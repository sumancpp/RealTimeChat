import express from "express";
import { uploadStatus, getStatuses, viewStatus, deleteStatus } from "../controllers/status.controller.js";
import isAuth from "../middlewares/isAuth.js";
import { upload } from "../middlewares/multer.js";

const statusRouter = express.Router();

statusRouter.post("/upload", isAuth, upload.single("image"), uploadStatus);
statusRouter.get("/", isAuth, getStatuses);
statusRouter.post("/view/:id", isAuth, viewStatus);
statusRouter.delete("/:id", isAuth, deleteStatus);

export default statusRouter;
