import "dotenv/config";
import crypto from "crypto";

// Polyfill Web Crypto API for Node.js 18 to support Mongoose 9+
if (!globalThis.crypto) {
    globalThis.crypto = crypto.webcrypto;
}

import express from "express";
import path from "path";
import connectDb from "./config/db.js";

import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import messageRouter from "./routes/message.routes.js";
import statusRouter from "./routes/status.routes.js";
import groupRouter from "./routes/group.routes.js";

import cookieParser from "cookie-parser";
import cors from "cors";

import { app, server } from "./socket/socket.js";

import User from "./models/user.model.js";

const port = process.env.PORT || 5000;

// CORS
const allowedOrigins = [
    "http://localhost:5173",
    "https://realtimechat-5v8i.onrender.com"
];

app.use(
    cors({
        origin: allowedOrigins,
        credentials: true
    })
);

app.use(express.json());

app.use(cookieParser());

// TEST ROUTE
app.get(
    "/test-cors",
    (req, res) => {

        res.json({

            success: true,

            origin:
                req.headers.origin

        });

    }
);

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

// SERVE FRONTEND IN PRODUCTION
const __dirname = path.resolve();
if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(__dirname, "../Frontend/dist")));

    app.use((req, res) => {
        res.sendFile(path.join(__dirname, "../Frontend/dist", "index.html"));
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

            () => {

                console.log(

                    `server is started at ${port}`

                );

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