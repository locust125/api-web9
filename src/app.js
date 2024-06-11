import express from "express";
import morgan from "morgan";
import cors from "cors";
// import { initializeApp } from "./libs/initalSetup.js";


// blog
import login from "./routes/login.routes.js"
import blog from "./routes/post.routes.js";
import comment from "./routes/comments.routes.js";
import  User from "./routes/user.routes.js";
const app = express();

app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// initializeApp();

app.use(login);
app.use(blog);
app.use(comment);
app.use(User);

app.use((req, res) => {
    res.status(404).json("Ruta no encontrada");
});

export default app;