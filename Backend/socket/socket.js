import http from "http";
import express from "express";
import { Server } from "socket.io";

import User from "../models/user.model.js";
import Message from "../models/message.model.js";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {

    cors: {

        origin: [

            "http://localhost:5173",

            "https://realtimechat-5v8i.onrender.com"

        ],

        credentials: true

    }

});

// ONLINE USERS
export const userSocketMap = {};

// GET USER SOCKET
export const getReceiverSocketId = (
    userId
) => {

    return userSocketMap[
        userId?.toString()
    ];

};

io.on(
    "connection",
    async (socket) => {

        console.log(
            "User Connected:",
            socket.id
        );

        const userId =
            socket.handshake.query.userId;

        if (userId) {

            userSocketMap[
                userId
            ] = socket.id;

        }

        // SEND ONLINE USERS
        io.emit(
            "getOnlineUsers",
            Object.keys(
                userSocketMap
            )
        );

        // MARK MESSAGES AS SEEN
        socket.on(
            "markMessagesSeen",
            async ({
                senderId,
                receiverId
            }) => {

                try {

                    await Message.updateMany(

                        {

                            sender:
                                senderId,

                            receiver:
                                receiverId,

                            isSeen:
                                false

                        },

                        {

                            isSeen:
                                true

                        }

                    );

                    const senderSocketId =
                        getReceiverSocketId(
                            senderId
                        );

                    if (
                        senderSocketId
                    ) {

                        io.to(
                            senderSocketId
                        ).emit(
                            "messagesSeen",
                            {
                                receiverId
                            }
                        );

                    }

                } catch (error) {

                    console.log(
                        "Seen Error:",
                        error.message
                    );

                }

            }
        );

        // TYPING
        socket.on(
            "typing",
            ({ receiverId }) => {

                const receiverSocketId =
                    getReceiverSocketId(
                        receiverId
                    );

                if (
                    receiverSocketId
                ) {

                    io.to(
                        receiverSocketId
                    ).emit(
                        "typing"
                    );

                }

            }
        );

        // STOP TYPING
        socket.on(
            "stopTyping",
            ({ receiverId }) => {

                const receiverSocketId =
                    getReceiverSocketId(
                        receiverId
                    );

                if (
                    receiverSocketId
                ) {

                    io.to(
                        receiverSocketId
                    ).emit(
                        "stopTyping"
                    );

                }

            }
        );

        // DISCONNECT
        socket.on(
            "disconnect",
            async () => {

                console.log(
                    "User Disconnected:",
                    socket.id
                );

                try {

                    if (userId) {

                        await User.findByIdAndUpdate(

                            userId,

                            {

                                lastSeen:
                                    new Date()

                            }

                        );

                    }

                } catch (error) {

                    console.log(
                        "Last Seen Error:",
                        error.message
                    );

                }

                delete userSocketMap[
                    userId
                ];

                io.emit(
                    "getOnlineUsers",
                    Object.keys(
                        userSocketMap
                    )
                );

            }
        );

    }
);

export {
    app,
    server,
    io
};