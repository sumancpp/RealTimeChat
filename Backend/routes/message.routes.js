import express from "express";

import isAuth from "../middlewares/isAuth.js";

import { upload } from "../middlewares/multer.js";

import {
  getMessage,
  sendMessage,
  getSortedUsers
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

export default messageRouter;