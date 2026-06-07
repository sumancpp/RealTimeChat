import bcrypt from "bcryptjs";
import uploadOnCloudinary from "../config/cloudinary.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import ai from "../config/gemini.js";

import {
    io,
    getReceiverSocketId
} from "../socket/socket.js";

// SEND MESSAGE
export const sendMessage = async (req, res) => {

    console.log("SEND MESSAGE API HIT");

    try {

        console.log(
            "REQ BODY:",
            req.body
        );

        const sender =
            req.userId;

        const { receiver } =
            req.params;

        const {
            message,
            replyTo
        } = req.body;

        console.log(
            "MESSAGE:",
            message
        );

        console.log(
            "REPLY TO:",
            replyTo
        );

        let image = "";

let voice = "";

if (req.file) {

    const uploadedFile =
        await uploadOnCloudinary(
            req.file.path
        );

    if (

        req.file.mimetype.startsWith(
            "image"
        )

    ) {

        image = uploadedFile;

    }

    else if (

        req.file.mimetype.startsWith(
            "audio"
        )

    ) {

        voice = uploadedFile;

    }

}

        let conversation =
            await Conversation.findOne({

                participants: {

                    $all: [
                        sender,
                        receiver
                    ]

                }

            });

        const newMessage =
await Message.create({

    sender,

    receiver,

    message,

    image,

    voice,

    replyTo:
        replyTo || null,

    isSeen: false

});

console.log(
    "SAVED MESSAGE:",
    newMessage
);

        if (!conversation) {

            conversation =
                await Conversation.create({

                    participants: [
                        sender,
                        receiver
                    ],

                    messages: [
                        newMessage._id
                    ]

                });

        }

        else {

            conversation.messages.push(
                newMessage._id
            );

            conversation.updatedAt =
                new Date();

            await conversation.save();

        }

        const populatedMessage =
            await Message.findById(
                newMessage._id
            ).populate({

                path: "replyTo",

                select:
                    "message image sender"

            });

        // RECEIVER SOCKET
        const receiverSocketId =
            getReceiverSocketId(
                receiver
            );

        if (receiverSocketId) {

            io.to(
                receiverSocketId
            ).emit(
                "newMessage",
                populatedMessage
            );

        }

        // SENDER SOCKET
        const senderSocketId =
            getReceiverSocketId(
                sender
            );

        if (senderSocketId) {

            io.to(
                senderSocketId
            ).emit(
                "newMessage",
                populatedMessage
            );

        }

        // AI COMMAND

        let populatedAiMessage;

        const trimmedMessage = message?.trim();
        const receiverUser = receiver
            ? await User.findById(receiver)
            : null;
        const isAiChat =
            trimmedMessage?.toLowerCase().startsWith("@ai") ||
            receiverUser?.isAI;

        if (trimmedMessage && isAiChat) {
            try {
                const prompt = trimmedMessage
                    .replace(/^@ai\s*/i, "")
                    .trim();

                if (prompt) {
                    console.log("AI BLOCK HIT");
                    console.log("PROMPT:", prompt);

                    const response = await ai.models.generateContent({
                        model: "gemini-2.5-flash",
                        contents: prompt
                    });

                    const aiReply =
                        response.text ||
                        response.candidates?.[0]?.content?.parts?.map(
                            (part) => part?.text || ""
                        ).join("") ||
                        "Sorry, I couldn't generate a response.";

                    if (!response.text) {
                        console.log("AI RESPONSE FULL:", response);
                    }
                    console.log("AI RESPONSE:", aiReply);

                    let aiUser = receiverUser?.isAI ? receiverUser : await User.findOne({ isAI: true });
                    if (!aiUser) {
                        const hashedPassword = await bcrypt.hash(
                            "baatcheet-ai",
                            5
                        );
                        aiUser = await User.create({
                            name: "BaatCheet AI",
                            userName: "ai",
                            email: "ai@baatcheet.com",
                            password: hashedPassword,
                            isAI: true,
                            profileImage:
                                "https://cdn-icons-png.flaticon.com/512/4712/4712027.png"
                        });
                        console.log("AI user created on demand.");
                    }

                    const aiMessage = await Message.create({
                        sender: aiUser._id,
                        receiver: sender,
                        message: aiReply,
                        isSeen: false
                    });

                    populatedAiMessage = await Message.findById(
                        aiMessage._id
                    ).populate({
                        path: "replyTo",
                        select: "message image sender"
                    });

                    conversation.messages.push(aiMessage._id);
                    await conversation.save();

                    if (senderSocketId) {
                        io.to(senderSocketId).emit(
                            "newMessage",
                            populatedAiMessage
                        );
                    } else {
                        console.log(
                            "AI message not emitted: sender socket not connected",
                            sender
                        );
                    }
                }
            } catch (error) {
                console.error("AI ERROR:",
                    error?.response?.data ||
                    error?.message ||
                    error
                );
            }
        }

        const responsePayload =
            populatedAiMessage ?
                { message: populatedMessage, aiMessage: populatedAiMessage } :
                populatedMessage;

        return res.status(201).json(responsePayload);

    }

    catch (error) {

        console.log(error);

        return res.status(500).json({

            message:
                `send message error ${error.message}`

        });

    }

};



// GET CHAT MESSAGES
export const getMessage = async (
    req,
    res
) => {

    try {

        const sender =
            req.userId;

        const { receiver } =
            req.params;

        const conversation =
            await Conversation.findOne({

                participants: {
                    $all: [
                        sender,
                        receiver
                    ]
                }

            }).populate({

    path: "messages",

    populate: {

        path: "replyTo",

        select:
            "message image sender"

    }

});

        if (!conversation) {

            return res.status(200)
                .json([]);

        }

        // MARK AS SEEN
        await Message.updateMany(

            {

                sender: receiver,

                receiver: sender,

                isSeen: false

            },

            {

                isSeen: true

            }

        );

        // EMIT SEEN EVENT
        const receiverSocketId =
            getReceiverSocketId(
                receiver
            );

        if (receiverSocketId) {

            io.to(
                receiverSocketId
            ).emit(
                "messagesSeen"
            );

        }

        return res.status(200)
            .json(
                conversation.messages
            );

    } catch (error) {

        return res.status(500).json({

            message:
                `get message error ${error.message}`

        });

    }

};



// SIDEBAR USERS
export const getSortedUsers = async (
    req,
    res
) => {

    try {

        const currentUser =
            req.userId;

        const users =
            await User.find({

                _id: {
                    $ne:
                        currentUser
                }

            }).select(
                "-password"
            );

        const usersWithChatData =
            await Promise.all(

                users.map(
                    async (user) => {

                        // LAST MESSAGE
                        const lastMessage =
                            await Message.findOne({

                                $or: [

                                    {

                                        sender:
                                            currentUser,

                                        receiver:
                                            user._id

                                    },

                                    {

                                        sender:
                                            user._id,

                                        receiver:
                                            currentUser

                                    }

                                ]

                            })

                                .sort({
                                    createdAt:
                                        -1
                                });

                        // UNREAD COUNT
                        const unreadCount =
                            await Message.countDocuments({

                                sender:
                                    user._id,

                                receiver:
                                    currentUser,

                                isSeen:
                                    false

                            });

                        return {

                            ...user.toObject(),

                            lastMessage:
                                lastMessage?.message ||

                                (lastMessage?.image
 ? "📷 Image"
 : lastMessage?.voice
 ? "🎤 Voice Message"
 : ""),

                            lastMessageTime:
                                lastMessage?.createdAt ||

                                null,

                            unreadCount

                        };

                    }
                )

            );

        usersWithChatData.sort(
            (a, b) => {

                const timeA =
                    a.lastMessageTime
                        ? new Date(
                            a.lastMessageTime
                        )
                            .getTime()
                        : 0;

                const timeB =
                    b.lastMessageTime
                        ? new Date(
                            b.lastMessageTime
                        )
                            .getTime()
                        : 0;

                return (
                    timeB - timeA
                );

            }
        );

        return res.status(200)
            .json(
                usersWithChatData
            );

    } catch (error) {

        return res.status(500).json({

            message:
                error.message

        });

    }

};

//reactions

export const reactToMessage = async (
    req,
    res
) => {

    try {

        const userId =
            req.userId;

        const {
            messageId
        } = req.params;

        const {
            emoji
        } = req.body;

        const message =
            await Message.findById(
                messageId
            );

        if (!message) {

            return res.status(404)
                .json({

                    message:
                        "Message not found"

                });

        }

        const existingReaction =
            message.reactions.find(

                reaction =>

                    reaction.userId.toString() ===
                    userId.toString()

            );

        if (existingReaction) {

            existingReaction.emoji =
                emoji;

        }

        else {

            message.reactions.push({

                userId,

                emoji

            });

        }

        await message.save();

        io.emit(
            "messageReaction",
            message
        );

        return res.status(200)
            .json(message);

    }

    catch (error) {

        return res.status(500)
            .json({

                message:
                    error.message

            });

    }

};

// delete message

export const deleteMessage = async (
    req,
    res
) => {

    try {

        const userId =
            req.userId;

        const {
            messageId
        } = req.params;

        const message =
            await Message.findById(
                messageId
            );

        if (!message) {

            return res.status(404)
                .json({

                    message:
                        "Message not found"

                });

        }

        // ONLY SENDER CAN DELETE
        if (

            message.sender.toString() !==
            userId.toString()

        ) {

            return res.status(403)
                .json({

                    message:
                        "Not allowed"

                });

        }

        message.isDeleted =
            true;

        message.message =
            "";

        message.image =
            "";

        message.voice = "";

        message.replyTo =
            null;

        message.reactions =
            [];

        await message.save();

        io.emit(
            "messageDeleted",
            {
                messageId
            }
        );

        return res.status(200)
            .json({

                success: true

            });

    }

    catch (error) {

        return res.status(500)
            .json({

                message:
                    error.message

            });

    }

};