import Comment from "../models/comments.js";

import Blog from "../models/post.model.js";
import User from "../models/User.js";
import { format } from "date-fns";


export const addComment = async (req, res) => {
    const { comment, postId, idUser } = req.body;

    const findBlogPost = async (postId) => {
        const blogPost = await Blog.findById(postId);
        if (!blogPost) {
            throw new Error("Blog post not found");
        }
        return blogPost;
    };

    const findUser = async (idUser) => {
        const user = await User.findById(idUser);
        if (!user) {
            throw new Error("User not found");
        }
        return user;
    };

    const saveNewComment = async () => {
        const newComment = new Comment({ comment, postId, idUser });
        return await newComment.save();
    };

    const updateBlogPostWithComment = async (blogPost, commentId) => {
        blogPost.comments.push(commentId);
        await blogPost.save();
    };

    try {
        const blogPost = await findBlogPost(postId);
        await findUser(idUser);
        const saveComment = await saveNewComment();
        await updateBlogPostWithComment(blogPost, saveComment._id);

        return res.status(200).json({ message: "Comment added successfully", saveComment });
    } catch (error) {
        console.error(error.message);
        const status = error.message === "Blog post not found" || error.message === "User not found" ? 404 : 500;
        return res.status(status).json({ message: error.message });
    }
};


export const getComments = async (req, res) => {
    try {
        const { postId } = req.params;
        const comments = await Comment.find({ postId })
            .populate("idUser", "name")
            .exec();

        // Formatear las fechas de los comentarios
        const formattedComments = comments.map(comment => {
            return {
                ...comment.toObject(),
                date: format(new Date(comment.createdAt), 'MM/dd/yyyy, h:mm:ss a')
            };
        });

        return res.status(200).json(formattedComments);
    } catch (error) {
        console.log(error.message);
        return res.status(500).json({ message: "something went wrong", error: error.message });
    }
};