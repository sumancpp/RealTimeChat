import bcrypt from "bcryptjs";
import uploadOnCloudinary from "../config/cloudinary.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import generateGeminiReply from "../config/gemini.js";
import webpush from "../config/webpush.js";

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

        const senderUserObj = await User.findById(sender);
        const receiverUserObj = await User.findById(receiver);

        if (receiverUserObj?.blockedUsers?.includes(sender)) {
            return res.status(403).json({ message: "You are blocked by this user" });
        }
        if (senderUserObj?.blockedUsers?.includes(receiver)) {
            return res.status(403).json({ message: "You have blocked this user" });
        }

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



        let finalMessage = message;
        if (finalMessage?.trim().toLowerCase() === "@roast") {
            const targetName = receiverUserObj?.name || receiverUserObj?.userName || "my friend";
            const roastPrompt = `Generate a short, funny, friendly roast for someone named ${targetName}. Keep it under 2 sentences.`;
            try {
                const aiRoast = await generateGeminiReply(roastPrompt);
                if (aiRoast) {
                    finalMessage = `🔥 ${aiRoast}`;
                }
            } catch (err) {
                console.error("Roast generation failed", err);
                finalMessage = "🔥 I tried to roast you, but the AI couldn't find anything bad to say!";
            }
        } else if (finalMessage?.trim().toLowerCase() === "@music") {
            let historyStr = "";
            if (conversation && conversation.messages && conversation.messages.length > 0) {
                try {
                    const populatedConv = await Conversation.findById(conversation._id).populate({
                        path: 'messages',
                        options: { limit: 5, sort: { createdAt: -1 } }
                    });
                    if (populatedConv && populatedConv.messages) {
                        historyStr = populatedConv.messages
                            .reverse()
                            .map(m => m.message)
                            .filter(Boolean)
                            .join(" | ");
                    }
                } catch (err) {
                    console.error("Error fetching history for mood", err);
                }
            }
            
            const musicPrompt = `Based on this recent chat history: "${historyStr || 'No history yet'}", what is the mood of the conversation? Suggest exactly 2 songs that fit this mood perfectly. Format strictly as: "Mood: [mood] 🎵 Songs: 1. [song by artist], 2. [song by artist]". Keep it short.`;
            try {
                const aiMusic = await generateGeminiReply(musicPrompt);
                if (aiMusic) {
                    finalMessage = `🎧 ${aiMusic}`;
                }
            } catch (err) {
                console.error("Music generation failed", err);
                finalMessage = "🎧 I tried to find some mood music, but my headphones are tangled!";
            }
        }

        const newMessage =
await Message.create({

    sender,

    receiver,

    message: finalMessage,

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

        } else {
            const rUser = await User.findById(receiver);
            if (rUser && rUser.pushSubscriptions?.length > 0) {
                const senderUser = await User.findById(sender).select("name userName profileImage");
                const senderName = senderUser?.name || senderUser?.userName || "Someone";
                const notificationPayload = JSON.stringify({
                    title: `New message from ${senderName}`,
                    body: message || "Sent an attachment",
                    icon: senderUser?.profileImage || "/vite.svg"
                });

                rUser.pushSubscriptions.forEach(sub => {
                    webpush.sendNotification(sub, notificationPayload).catch(err => {
                        console.error("Push error", err);
                    });
                });
            }
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

                    const senderUser = await User.findById(sender);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    let isAiAllowed = true;
                    let aiReply = "";

                    if (senderUser) {
                        const lastAiDate = senderUser.aiChatDate ? new Date(senderUser.aiChatDate) : null;
                        if (lastAiDate) lastAiDate.setHours(0, 0, 0, 0);

                        if (lastAiDate && lastAiDate.getTime() === today.getTime()) {
                            if (senderUser.aiChatCount >= 50) {
                                isAiAllowed = false;
                                aiReply = "You have reached your daily limit of 50 AI chats. Please try again tomorrow.";
                            } else {
                                senderUser.aiChatCount += 1;
                                await senderUser.save();
                            }
                        } else {
                            senderUser.aiChatCount = 1;
                            senderUser.aiChatDate = new Date();
                            await senderUser.save();
                        }
                    }

                    if (isAiAllowed) {
                        aiReply = await generateGeminiReply(prompt);
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
                console.error("AI ERROR:", error?.message || error);

                const fallbackAiReply =
                    "Sorry, I couldn't generate a response right now. Please try again later.";

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
                    message: fallbackAiReply,
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
                        "AI fallback message not emitted: sender socket not connected",
                        sender
                    );
                }
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
    match: { deletedFor: { $ne: sender } },
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

        const conversations = await Conversation.find({
            participants: { $in: [currentUser] },
            isGroup: false
        });

        const chattedUserIds = new Set();
        conversations.forEach(conv => {
            conv.participants.forEach(p => {
                if (p.toString() !== currentUser.toString()) {
                    chattedUserIds.add(p.toString());
                }
            });
        });

        // Add AI users so they are always accessible
        const aiUsers = await User.find({ isAI: true }).select("_id");
        aiUsers.forEach(ai => chattedUserIds.add(ai._id.toString()));

        const users = await User.find({
            _id: { $in: Array.from(chattedUserIds) }
        }).select("-password");

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

                                ],
                                deletedFor: { $ne: currentUser }

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
                                    false,
                                
                                deletedFor: { $ne: currentUser }

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

        // Filter out users who have no messages left with the current user, unless they are AI
        let filteredUsers = usersWithChatData.filter(u => u.lastMessageTime || u.isAI);

        filteredUsers.sort(
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
                filteredUsers
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

// DELETE CONVERSATION
export const deleteConversation = async (req, res) => {
    try {
        const currentUser = req.userId;
        const { id: otherUser } = req.params;
        const { deleteForEveryone } = req.body;

        // Find the conversation
        const conversation = await Conversation.findOne({
            participants: { $all: [currentUser, otherUser] },
            isGroup: false
        });

        if (!conversation) {
            return res.status(404).json({ message: "Conversation not found" });
        }

        if (deleteForEveryone) {
            // Delete all messages in this conversation globally
            await Message.deleteMany({ _id: { $in: conversation.messages } });
            // Delete the conversation document
            await Conversation.findByIdAndDelete(conversation._id);
            
            const otherSocketId = getReceiverSocketId(otherUser);
            if (otherSocketId) {
                io.to(otherSocketId).emit("conversationDeletedForEveryone", { conversationId: conversation._id, otherUserId: currentUser });
            }
        } else {
            // Just mark as deleted for the current user
            await Message.updateMany(
                { _id: { $in: conversation.messages } },
                { $addToSet: { deletedFor: currentUser } }
            );
        }

        return res.status(200).json({ message: "Conversation deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// EDIT MESSAGE
export const editMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const { newContent } = req.body;
        const userId = req.userId;

        const message = await Message.findById(messageId);

        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        if (message.sender.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Not authorized to edit this message" });
        }

        const timeDiff = Date.now() - new Date(message.createdAt).getTime();
        if (timeDiff > 15 * 60 * 1000) {
            return res.status(400).json({ message: "Messages can only be edited within 15 minutes of sending." });
        }

        message.message = newContent;
        message.isEdited = true;
        message.editedAt = new Date();

        await message.save();

        io.emit("messageEdited", { messageId: message._id, newContent, editedAt: message.editedAt });

        return res.status(200).json(message);
    } catch (error) {
        return res.status(500).json({ message: error.message });
      }
};