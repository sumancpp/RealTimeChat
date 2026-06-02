import dotenv from "dotenv";
dotenv.config();

import express from "express";
import connectDb from "./config/db.js";
import authRouter from "./routes/auth.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import userRouter from "./routes/user.routes.js";
import messageRouter from "./routes/message.routes.js";
import { app, server } from "./socket/socket.js";

const port = process.env.PORT || 5000;

// TEMPORARY CORS TEST
const allowedOrigins = [
    "http://localhost:5173",
    "https://baatcheet-ueje.onrender.com"
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
app.get("/test-cors", (req, res) => {

    res.json({
        success: true,
        origin: req.headers.origin
    });

});

app.use("/", authRouter);

app.use("/user", userRouter);

app.use("/message", messageRouter);

server.listen(port, () => {

    connectDb();

    console.log(
        `server is started at ${port}`
    );

});