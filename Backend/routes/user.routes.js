import express from "express";

    getCurrentUser,
    getOtherUser,
    searchUsers,
    subscribeToNotifications
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

export default userRouter;