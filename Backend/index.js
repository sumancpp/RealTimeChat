import "dotenv/config";
import crypto from "crypto";

// Polyfill Web Crypto API for Node.js 18 to support Mongoose 9+
if (!globalThis.crypto) {
    globalThis.crypto = crypto.webcrypto;
}

import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import connectDb from "./config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import messageRouter from "./routes/message.routes.js";
import statusRouter from "./routes/status.routes.js";
import groupRouter from "./routes/group.routes.js";
import callRouter from "./routes/call.routes.js";

import cookieParser from "cookie-parser";
import cors from "cors";
import compression from "compression";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { app, server } from "./socket/socket.js";

import User from "./models/user.model.js";

const port = process.env.PORT || 5000;

// Security Headers
app.use(helmet({
    contentSecurityPolicy: false // Disabled default CSP to allow custom socket/WebRTC/CDNs used by the app
}));

// CORS Configuration
const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:5000",
    "https://realtimechat-5v8i.onrender.com"
];

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow same-origin, mobile, curl, or server-to-server requests
            if (!origin) return callback(null, true);
            if (
                allowedOrigins.includes(origin) ||
                (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) ||
                origin.endsWith(".railway.app") ||
                origin.endsWith(".up.railway.app") ||
                origin.endsWith(".onrender.com")
            ) {
                return callback(null, true);
            }
            return callback(null, true);
        },
        credentials: true
    })
);

app.use(express.json());
app.use(compression());
app.use(cookieParser());
app.use("/public", express.static(path.join(__dirname, "public")));

// Rate limiting for Auth Endpoints
const authRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15, // Limit each IP to 15 requests per windowMs
    message: { message: "Too many authentication attempts. Please try again after 15 minutes." },
    standardHeaders: true,
    legacyHeaders: false
});

app.use("/login", authRateLimiter);
app.use("/signup", authRateLimiter);
app.use("/reset-password-question", authRateLimiter);

// ROUTES
app.use(
    "/",
    authRouter
);

app.use(
    "/status",
    statusRouter
);

app.use(
    "/user",
    userRouter
);

app.use(
    "/message",
    messageRouter
);

app.use(
    "/group",
    groupRouter
);

app.use(
    "/call",
    callRouter
);

// SERVE FRONTEND IN PRODUCTION
const frontendDistPath = path.join(__dirname, "../Frontend/dist");
if (process.env.NODE_ENV === "production" || fs.existsSync(frontendDistPath)) {
    app.use(express.static(frontendDistPath));

    app.use((req, res, next) => {
        // Serve index.html for all client-side GET routes (SPA routing)
        if (req.method === "GET") {
            return res.sendFile(path.join(frontendDistPath, "index.html"));
        }
        next();
    });
}

// START SERVER
const startServer = async () => {

    try {

        await connectDb();

        console.log(
            "Db connected"
        );

        const aiUser =
            await User.findOne({

                isAI: true

            });

        console.log(
            "AI USER:",
            aiUser
        );

        server.listen(

            port,

            async () => {

                console.log(

                    `server is started at ${port}`

                );

                const { getAIMetrics } = await import("./config/gemini.js");
                const metrics = getAIMetrics();
                console.log(`
============================================================
🤖 [BaatCheet AI Quota & Metrics Engine Initialized]
------------------------------------------------------------
✦ Active API Keys Pool : ${metrics.activeKeys} Key(s)
✦ Daily Request Limit  : ${metrics.dailyLimitRPD} RPD (Requests/Day)
✦ Requests Used Today  : ${metrics.requestsUsedToday} RPD
✦ Requests Remaining   : ${metrics.requestsRemainingToday} RPD
✦ Tokens Used Today    : ~${metrics.tokensUsedTodayEst} Tokens
============================================================
`);

            }

        );

    }

    catch (error) {

        console.log(

            "Server Start Error:",

            error

        );

    }

};

startServer();