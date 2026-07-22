import express from "express";

import isAuth from "../middlewares/isAuth.js";

import { upload } from "../middlewares/multer.js";

import {
  getMessage,
  sendMessage,
  getSortedUsers,
  reactToMessage,
  deleteMessage,
  deleteConversation,
  editMessage,
  revealGhostMessage,
  disintegrateGhostMessage
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

messageRouter.delete(
    "/conversation/:id",
    isAuth,
    deleteConversation
);

// EDIT MESSAGE
messageRouter.put(
    "/edit/:messageId",
    isAuth,
    editMessage
);

// GHOST MESSAGE ACTIONS
messageRouter.post(
    "/reveal-ghost/:messageId",
    isAuth,
    revealGhostMessage
);

messageRouter.delete(
    "/ghost/:messageId",
    isAuth,
    disintegrateGhostMessage
);

export default messageRouter;