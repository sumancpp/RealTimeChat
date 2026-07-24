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
  disintegrateGhostMessage,
  generateAISummary,
  generateSmartReplies,
  translateTextMessage,
  openViewOnceMessage
} from "../controllers/message.controllers.js";

const messageRouter = express.Router();

// AI ROUTES
messageRouter.get("/ai-summary/:receiver", isAuth, generateAISummary);
messageRouter.get("/ai-smart-replies/:receiver", isAuth, generateSmartReplies);
messageRouter.post("/translate-message", isAuth, translateTextMessage);
messageRouter.post("/open-view-once/:messageId", isAuth, openViewOnceMessage);

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