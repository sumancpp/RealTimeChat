import http from "http";
import express from "express";
import { Server } from "socket.io";

import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import Conversation from "../models/conversation.model.js";

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

// ONLINE USERS & GROUP CACHE
export const userSocketMap = {};
const groupCacheMap = {};


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

        if (userId && userId !== "undefined") {

            if (!userSocketMap[userId]) {
                userSocketMap[userId] = [];
            }
            if (!userSocketMap[userId].includes(socket.id)) {
                userSocketMap[userId].push(socket.id);
            }

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

        // GHOST MESSAGE EVENTS
        socket.on("revealGhostMessage", async ({ messageId }) => {
            try {
                const message = await Message.findById(messageId);
                if (message && !message.isGhostRevealed) {
                    message.isGhostRevealed = true;
                    message.ghostRevealedAt = new Date();
                    await message.save();

                    const senderSocketId = getReceiverSocketId(message.sender);
                    const receiverSocketId = getReceiverSocketId(message.receiver);

                    if (senderSocketId) io.to(senderSocketId).emit("ghostMessageRevealed", { messageId, ghostRevealedAt: message.ghostRevealedAt });
                    if (receiverSocketId) io.to(receiverSocketId).emit("ghostMessageRevealed", { messageId, ghostRevealedAt: message.ghostRevealedAt });
                }
            } catch (err) {
                console.log("revealGhostMessage error:", err.message);
            }
        });

        socket.on("disintegrateGhostMessage", async ({ messageId }) => {
            try {
                const message = await Message.findById(messageId);
                if (message) {
                    const senderId = message.sender?.toString();
                    const receiverId = message.receiver?.toString();

                    await Conversation.updateMany(
                        { messages: messageId },
                        { $pull: { messages: messageId } }
                    );

                    await Message.findByIdAndDelete(messageId);

                    if (senderId) {
                        const senderSocketId = getReceiverSocketId(senderId);
                        if (senderSocketId) io.to(senderSocketId).emit("ghostMessageDisintegrated", { messageId });
                    }

                    if (receiverId) {
                        const receiverSocketId = getReceiverSocketId(receiverId);
                        if (receiverSocketId) io.to(receiverSocketId).emit("ghostMessageDisintegrated", { messageId });
                    }
                }
            } catch (err) {
                console.log("disintegrateGhostMessage error:", err.message);
            }
        });

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

        // WEBRTC CALLING SIGNALING
        socket.on("callUser", ({ userToCall, callType }) => {
            console.log(`[WebRTC] callUser from ${userId} to ${userToCall}, type: ${callType}`);
            const receiverSocketId = getReceiverSocketId(userToCall);
            if (receiverSocketId) {
                console.log(`[WebRTC] Emitting incomingCall to socket ${receiverSocketId}`);
                io.to(receiverSocketId).emit("incomingCall", { from: userId, callType });
            } else {
                console.log(`[WebRTC] User ${userToCall} is offline.`);
            }
        });

        socket.on("rejectCall", ({ to }) => {
            const receiverSocketId = getReceiverSocketId(to);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("callRejected");
            }
        });

        socket.on("acceptCall", ({ to }) => {
            const receiverSocketId = getReceiverSocketId(to);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("callAccepted");
            }
        });

        socket.on("webrtcSignal", ({ to, signalData }) => {
            const receiverSocketId = getReceiverSocketId(to);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("webrtcSignal", { signalData, from: userId });
            }
        });

        socket.on("endCall", ({ to }) => {
            const receiverSocketId = getReceiverSocketId(to);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("callEnded");
            }
        });

        // GAME EVENTS
        socket.on("gameInvite", ({ to, gameType }) => {
            const receiverSocketId = getReceiverSocketId(to);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("gameInvite", { from: userId, gameType: gameType || 'tabletennis' });
            }
        });

        socket.on("acceptGame", ({ to, gameType, messageId }) => {
            const receiverSocketId = getReceiverSocketId(to);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("gameAccepted", { from: userId, gameType, messageId });
            }
        });

        const handleGameMessageDeletion = async (messageId) => {
            if (!messageId) return;
            try {
                const message = await Message.findById(messageId);
                if (message) {
                    message.isDeleted = true;
                    message.message = "";
                    message.image = "";
                    message.voice = "";
                    message.replyTo = null;
                    message.reactions = [];
                    await message.save();
                    io.emit("gameMessageDeleted", { messageId });
                }
            } catch (err) {
                console.log(err);
            }
        };

        socket.on("declineGame", async ({ to, messageId }) => {
            const receiverSocketId = getReceiverSocketId(to);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("gameDeclined", { from: userId });
            }
            await handleGameMessageDeletion(messageId);
        });
        
        socket.on("endGame", async ({ to, messageId }) => {
            const receiverSocketId = getReceiverSocketId(to);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("gameEnded", { from: userId });
            }
            await handleGameMessageDeletion(messageId);
        });

        socket.on("paddleMove", ({ to, x, y }) => {
            const receiverSocketId = getReceiverSocketId(to);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("paddleMove", { x, y });
            }
        });

        socket.on("ballMove", ({ to, ball }) => {
            const receiverSocketId = getReceiverSocketId(to);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("ballMove", { ball });
            }
        });

        socket.on("scoreUpdate", ({ to, score }) => {
            const receiverSocketId = getReceiverSocketId(to);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("scoreUpdate", { score });
            }
        });

        // IN-CHAT MINI GAMES EVENTS
        socket.on("startMiniGame", ({ to, gameType }) => {
            const receiverSocketId = getReceiverSocketId(to);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("startMiniGame", { gameType, from: userId });
            }
        });

        socket.on("ticTacToeMove", ({ to, index, symbol, board, nextTurn, winner }) => {
            const receiverSocketId = getReceiverSocketId(to);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("ticTacToeMove", { index, symbol, board, nextTurn, winner, from: userId });
            }
        });

        socket.on("rpsChoice", ({ to, choice }) => {
            const receiverSocketId = getReceiverSocketId(to);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("rpsChoice", { choice, from: userId });
            }
        });

        // IN-MEMORY GROUP PARTICIPANT CACHE FOR ZERO-DB DRAWING LATENCY
        socket.on("joinGroupRoom", ({ groupId }) => {
            if (groupId) socket.join(groupId.toString());
        });

        socket.on("draw", async ({ groupId, data }) => {
            try {
                if (!groupId) return;
                socket.to(groupId.toString()).emit("draw", { groupId, data });

                let participants = groupCacheMap[groupId];
                if (!participants) {
                    const group = await Conversation.findById(groupId).select("participants isGroup");
                    if (group && group.isGroup) {
                        participants = group.participants.map(p => p.toString());
                        groupCacheMap[groupId] = participants;
                    }
                }
                if (participants) {
                    participants.forEach(pId => {
                        const receiverSockets = getReceiverSocketId(pId);
                        if (receiverSockets) {
                            const socketsList = Array.isArray(receiverSockets) ? receiverSockets : [receiverSockets];
                            socketsList.forEach(sId => {
                                if (sId !== socket.id) {
                                    io.to(sId).emit("draw", { groupId, data });
                                }
                            });
                        }
                    });
                }
            } catch (err) {
                console.log("draw event error:", err.message);
            }
        });

        socket.on("clearCanvas", async ({ groupId }) => {
            try {
                if (!groupId) return;
                socket.to(groupId.toString()).emit("clearCanvas", { groupId });

                let participants = groupCacheMap[groupId];
                if (!participants) {
                    const group = await Conversation.findById(groupId).select("participants isGroup");
                    if (group && group.isGroup) {
                        participants = group.participants.map(p => p.toString());
                        groupCacheMap[groupId] = participants;
                    }
                }
                if (participants) {
                    participants.forEach(pId => {
                        const receiverSockets = getReceiverSocketId(pId);
                        if (receiverSockets) {
                            const socketsList = Array.isArray(receiverSockets) ? receiverSockets : [receiverSockets];
                            socketsList.forEach(sId => {
                                if (sId !== socket.id) {
                                    io.to(sId).emit("clearCanvas", { groupId });
                                }
                            });
                        }
                    });
                }
            } catch (err) {
                console.log("clearCanvas error:", err.message);
            }
        });



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

                if (userId && userSocketMap[userId]) {
                    userSocketMap[userId] = userSocketMap[userId].filter(id => id !== socket.id);
                    if (userSocketMap[userId].length === 0) {
                        delete userSocketMap[userId];
                    }
                }

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