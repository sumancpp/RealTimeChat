import express from "express";

import {
    login,
    logOut,
    signUp,
    getSecurityQuestion,
    resetPasswordWithQuestion
} from "../controllers/auth.controllers.js";

const authRouter = express.Router();

authRouter.post(
    "/signup",
    signUp
);

authRouter.post(
    "/login",
    login
);

authRouter.get(
    "/logout",
    logOut
);

authRouter.post(
    "/get-security-question",
    getSecurityQuestion
);

authRouter.post(
    "/reset-password-question",
    resetPasswordWithQuestion
);

export default authRouter;