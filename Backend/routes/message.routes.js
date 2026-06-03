import express from "express";

import isAuth from "../middlewares/isAuth.js";

import { upload } from "../middlewares/multer.js";

import {
  getMessage,
  sendMessage,
  getSortedUsers,
  reactToMessage
} from "../controllers/message.controllers.js";

const messageRouter = express.Router();

messageRouter.post(
  "/send/:receiver",
  isAuth,
  upload.single("image"),
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

export default messageRouter;