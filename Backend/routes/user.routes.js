import express from "express";

import {
    getCurrentUser,
    getOtherUser,
    searchUsers,
    subscribeToNotifications,
    blockUser,
    unblockUser,
    setupChatLockPin,
    verifyChatLockPin,
    lockChat,
    unlockChat
} from "../controllers/user.controller.js";

import isAuth from "../middlewares/isAuth.js";

import { editProfile } from "../controllers/auth.controllers.js";

import { upload } from "../middlewares/multer.js";


const userRouter = express.Router();

// CURRENT USER
userRouter.get(
    "/current",
    isAuth,
    getCurrentUser
);

// OTHER USERS
userRouter.get(
    "/others",
    isAuth,
    getOtherUser
);

// SEARCH USERS
userRouter.get(
    "/search",
    isAuth,
    searchUsers
);

// UPDATE PROFILE
userRouter.put(
    "/profile",
    isAuth,
    upload.single("profileImage"),
    editProfile
);

// SUBSCRIBE TO NOTIFICATIONS
userRouter.post(
    "/subscribe",
    isAuth,
    subscribeToNotifications
);

// BLOCK USER
userRouter.post(
    "/block/:id",
    isAuth,
    blockUser
);

// UNBLOCK USER
userRouter.post(
    "/unblock/:id",
    isAuth,
    unblockUser
);

// SETUP CHAT LOCK PIN
userRouter.post(
    "/chat-lock/setup",
    isAuth,
    setupChatLockPin
);

// VERIFY CHAT LOCK PIN
userRouter.post(
    "/chat-lock/verify",
    isAuth,
    verifyChatLockPin
);

// LOCK CHAT
userRouter.post(
    "/chat-lock/lock/:id",
    isAuth,
    lockChat
);

// UNLOCK CHAT
userRouter.post(
    "/chat-lock/unlock/:id",
    isAuth,
    unlockChat
);

export default userRouter;