import uploadOnCloudinary from "../config/cloudinary.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

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

        if (req.file) {

            image =
                await uploadOnCloudinary(
                    req.file.path
                );

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

        return res.status(201).json(
            populatedMessage
        );

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