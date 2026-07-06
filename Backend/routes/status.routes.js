import express from "express";
import { uploadStatus, getStatuses, viewStatus } from "../controllers/status.controller.js";
import isAuth from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";

const statusRouter = express.Router();

statusRouter.post("/upload", isAuth, upload.single("image"), uploadStatus);
statusRouter.get("/", isAuth, getStatuses);
statusRouter.post("/view/:id", isAuth, viewStatus);

export default statusRouter;
