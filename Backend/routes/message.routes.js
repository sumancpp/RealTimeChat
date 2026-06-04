import express from "express";

import isAuth from "../middlewares/isAuth.js";

import { upload } from "../middlewares/multer.js";

import {
  getMessage,
  sendMessage,
  getSortedUsers,
  reactToMessage,
  deleteMessage
} from "../controllers/message.controllers.js";

const messageRouter = express.Router();

messageRouter.post(
  "/send/:receiver",
  isAuth,
  upload.single("file"),
  sendMessage
);

messageRouter.get(
  "/get/:receiver",
  isAuth,
  getMessage
);

messageRouter.get(
  "/sorted-users",
  isAuth,
  getSortedUsers
);

messageRouter.post(
    "/react/:messageId",
    isAuth,
    reactToMessage
);

messageRouter.delete(
    "/delete/:messageId",
    isAuth,
    deleteMessage
);

export default messageRouter;