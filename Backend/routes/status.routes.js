import express from "express";
import { uploadStatus, getStatuses, viewStatus, deleteStatus } from "../controllers/status.controller.js";
import isAuth from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";

const statusRouter = express.Router();

const statusUpload = upload.fields([
    { name: "image", maxCount: 1 },
    { name: "media", maxCount: 1 }
]);

statusRouter.post("/upload", isAuth, statusUpload, uploadStatus);
statusRouter.post("/create", isAuth, statusUpload, uploadStatus);
statusRouter.get("/", isAuth, getStatuses);
statusRouter.post("/view/:id", isAuth, viewStatus);
statusRouter.delete("/:id", isAuth, deleteStatus);

export default statusRouter;
