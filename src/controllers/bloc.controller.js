import PostModel from "../models/post.model.js";
import fs from "fs-extra";
import mongoose from "mongoose"
import { uploadImage, deleteImage } from "../utils/cloudinary.js";



export const createPost = async (req, res) => {
    const { title, content, idUser } = req.body;

    const createNewPost = async () => {
        const newBlog = new PostModel({ title, content,idUser });

        if (req.files) {
            const { imagePost } = req.files;
            await handleImageUpload(imagePost, newBlog, 'imagePost');
            // await handleImageUpload(back_image, newBlog, 'back_image');
        } else {
            console.warn('No files were uploaded.');
        }

        return await newBlog.save();
    };

    const handleImageUpload = async (image, blog, imageType) => {
        if (image) {
            try {
                const result = await uploadImage(image.tempFilePath);
                blog[imageType] = {
                    publicId: result.public_id,
                    secureUrl: result.secure_url,
                };
                fs.unlink(image.tempFilePath, (err) => {
                    if (err) console.error(`Error deleting ${imageType} temp file: ${err.message}`);
                });
            } catch (error) {
                console.error(`Error uploading ${imageType}: ${error.message}`);
            }
        }
    };

    try {
        const productSave = await createNewPost();
        return res.status(201).json({ message: "Created Post", productSave });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Something went wrong", error: error.message });
    }
};


export const getAllPost = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const response = await PostModel.paginate(
            {},
            {
                limit,
                page,
                sort: { createdAt: -1 },
            }
        );
        return res.status(200).json(response);
    } catch (error) {
        return res.status(500).json({ message: "something went wrong" ,error: error.message});
    }
}; 
export const deletePostById = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await PostModel.findByIdAndDelete(id);

        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (post.imagePost && post.imagePost.publicId) {
            await deleteImage(post.imagePost.publicId);
        }

        if (post.back_image && post.back_image.publicId) {
            await deleteImage(post.back_image.publicId);
        }

        return res.status(200).json({ message: "Post deleted" });
    } catch (error) {
        return res.status(500).json({ message: "something went wrong", error: error.message });
    }
};

export const updatePostById = async (req, res) => {
    try {
        const { id } = req.params;

        const updateFields = req.body;

        const updatedPostUser = await PostModel.findByIdAndUpdate(
            id,
            updateFields,
            {
                new: true,
            }
        );

        if (!updatedPostUser) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (req.files?.imagePost) {
            const resultFrontImage = await uploadImage(
                req.files.imagePost.tempFilePath
            );
            updateFields.imagePost = {
                publicId: resultFrontImage.public_id,
                secureUrl: resultFrontImage.secure_url,
            };

            if (
                updatedPostUser.imagePost &&
                updatedPostUser.imagePost.publicId
            ) {
                await deleteImage(updatedPostUser.imagePost.publicId);
            }

            fs.unlink(req.files.imagePost.tempFilePath);
        }

        if (req.files?.back_image) {
            const resultBackImage = await uploadImage(
                req.files.back_image.tempFilePath
            );
            updateFields.back_image = {
                publicId: resultBackImage.public_id,
                secureUrl: resultBackImage.secure_url,
            };

            if (
                updatedPostUser.back_image &&
                updatedPostUser.back_image.publicId
            ) {
                await deleteImage(updatedPostUser.back_image.publicId);
            }

            fs.unlink(req.files.back_image.tempFilePath);
        }

        const updatedPostUserWithImages = await PostModel.findByIdAndUpdate(
            id,
            updateFields,
            { new: true }
        );

        const response = {
            data: updatedPostUserWithImages,
        };

        res.status(200).json(response);
    } catch (error) {
        console.error(error);

        if (error instanceof mongoose.Error.CastError) {
            return res.status(400).json({ message: "Invalid Id" });
        }

        return res.status(500).json({ message: "Something went wrong" });
    }
};
