import Blog from "../models/post.model.js";
import fs from "fs-extra";
import mongoose from "mongoose"
import { uploadImage, deleteImage } from "../utils/cloudinary.js";



export const createPost = async (req, res) => {
    const { title, content } = req.body;

    const createNewBlog = async () => {
        const newBlog = new Blog({ title, content });

        if (req.files) {
            const { front_image, back_image } = req.files;
            await handleImageUpload(front_image, newBlog, 'front_image');
            await handleImageUpload(back_image, newBlog, 'back_image');
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
        const productSave = await createNewBlog();
        return res.status(201).json({ message: "Created Post", productSave });
    } catch (error) {
        console.error(error.message);
        return res.status(500).json({ message: "Something went wrong", error: error.message });
    }
};


export const getAllPost = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const response = await Blog.paginate(
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
export const deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await Blog.findByIdAndDelete(id);

        if (!blog) {
            return res.status(404).json({ message: "Post not found" });
        }

        if (blog.front_image && blog.front_image.publicId) {
            await deleteImage(blog.front_image.publicId);
        }

        if (blog.back_image && blog.back_image.publicId) {
            await deleteImage(blog.back_image.publicId);
        }

        return res.status(200).json({ message: "Post deleted" });
    } catch (error) {
        return res.status(500).json({ message: "something went wrong", error: error.message });
    }
};

export const updatePost = async (req, res) => {
    const { id } = req.params;
    const updateFields = req.body;

    const handleImageUpdate = async (imageFile, currentImageField) => {
        if (imageFile) {
            const result = await uploadImage(imageFile.tempFilePath);
            updateFields[currentImageField] = {
                publicId: result.public_id,
                secureUrl: result.secure_url,
            };
            if (updatedPostUser[currentImageField]?.publicId) {
                await deleteImage(updatedPostUser[currentImageField].publicId);
            }
            fs.unlink(imageFile.tempFilePath, (err) => {
                if (err) console.error(`Error deleting ${currentImageField} temp file: ${err.message}`);
            });
        }
    };

    try {
        const updatedPostUser = await Blog.findByIdAndUpdate(id, updateFields, { new: true });
        if (!updatedPostUser) {
            return res.status(404).json({ message: "Product not found" });
        }

        await handleImageUpdate(req.files?.front_image, 'front_image');
        await handleImageUpdate(req.files?.back_image, 'back_image');

        const updatedPostUserWithImages = await Blog.findByIdAndUpdate(id, updateFields, { new: true });
        res.status(200).json({ data: updatedPostUserWithImages });
    } catch (error) {
        console.error(error);
        if (error instanceof mongoose.Error.CastError) {
            return res.status(400).json({ message: "Invalid Id" });
        }
        return res.status(500).json({ message: "Something went wrong" });
    }
};
