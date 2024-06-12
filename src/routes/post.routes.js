import { Router } from "express";
import fileUpload from "express-fileupload";
import * as verify from "../middleware/authJwt.js";
import * as controllerP from "../controllers/bloc.controller.js";

const router = Router();

router.post(
    "/add/post",
    fileUpload({
        useTempFiles: true,
        tempFileDir: "./uploads",
    }),
    verify.verifyToken,
    controllerP.createPost
);
router.put(
    "/update/post/:id",
    fileUpload({
        useTempFiles: true,
        tempFileDir: "./uploads",
    }),
    // verify.verifyToken,
    controllerP.updatePostById
);

router.get("/getAll/post", verify.verifyToken, controllerP.getAllPost);

router.delete("/delete/post/:id", verify.verifyToken,controllerP.deletePostById);


export default router;