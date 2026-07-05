import express from "express";

import {
    login,
    logOut,
    signUp,
    forgotPassword,
    verifyOtp,
    resetPassword,
    testEmail,
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
    "/forgot-password",
    forgotPassword
);

authRouter.post(
    "/verify-otp",
    verifyOtp
);

authRouter.post(
    "/reset-password",
    resetPassword
);

authRouter.post(
    "/test-email",
    testEmail
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