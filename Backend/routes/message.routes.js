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
  updateDisappearingTimer,
  markViewOnceSeen
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

// DISAPPEARING TIMER
messageRouter.put(
    "/disappearing/:id",
    isAuth,
    updateDisappearingTimer
);

// MARK VIEW ONCE SEEN
messageRouter.put(
    "/view-once/:messageId",
    isAuth,
    markViewOnceSeen
);

export default messageRouter;