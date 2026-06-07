import dotenv from "dotenv";
dotenv.config();

import express from "express";
import connectDb from "./config/db.js";

import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import messageRouter from "./routes/message.routes.js";

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
    "/user",
    userRouter
);

app.use(
    "/message",
    messageRouter
);

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