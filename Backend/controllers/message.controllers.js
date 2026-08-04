import bcrypt from "bcryptjs";
import uploadOnCloudinary from "../config/cloudinary.js";
import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import generateGeminiReply, { GEMINI_MODEL } from "../config/gemini.js";
import webpush from "../config/webpush.js";

import {
    io,
    getReceiverSocketId
} from "../socket/socket.js";

// SEND MESSAGE
export const sendMessage = async (req, res) => {

    try {

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

        let image = "";

let voice = "";

if (req.file) {
    let uploadedFile = await uploadOnCloudinary(req.file.path);
    if (!uploadedFile) {
        // Local static fallback so image upload NEVER fails
        uploadedFile = `${req.protocol}://${req.get("host")}/public/${req.file.filename}`;
    }

    if (req.file.mimetype.startsWith("image")) {
        image = uploadedFile;
    } else if (req.file.mimetype.startsWith("audio")) {
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
        let isAIMessage = false;
        let isAIMusic = false;
        let musicQuery = "";

        if (finalMessage?.trim().toLowerCase() === "@roast") {
            isAIMessage = true;
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
            
            const musicPrompt = `Based on this recent chat history: "${historyStr || 'No history yet'}", what is the mood of the conversation? Suggest 1 song that fits this mood perfectly. You should suggest either an English song or a Hindi/Bollywood song, feel free to mix it up. Return ONLY the song title and artist format like "Song Name by Artist", nothing else.`;
            try {
                const aiMusic = await generateGeminiReply(musicPrompt);
                if (aiMusic) {
                    isAIMessage = true;
                    isAIMusic = true;
                    musicQuery = aiMusic.trim().replace(/['"]/g, ''); // Remove quotes if any
                    finalMessage = `I'm feeling the vibe! Here's a mood track for us:`;
                }
            } catch (err) {
                console.error("Music generation failed", err);
                finalMessage = "🎧 I tried to find some mood music, but my headphones are tangled!";
            }
        } else if (finalMessage?.trim().toLowerCase() === "@summarize") {
            isAIMessage = true;
            let historyStr = "";
            if (conversation && conversation.messages && conversation.messages.length > 0) {
                try {
                    const populatedConv = await Conversation.findById(conversation._id).populate({
                        path: 'messages',
                        options: { limit: 15, sort: { createdAt: -1 } }
                    });
                    if (populatedConv && populatedConv.messages) {
                        historyStr = populatedConv.messages
                            .reverse()
                            .map(m => m.message)
                            .filter(Boolean)
                            .join("\n");
                    }
                } catch (err) {
                    console.error("Error fetching history for summary", err);
                }
            }
            const summaryPrompt = `Summarize the following recent chat conversation in 3 concise, key bullet points with emojis:\n\n${historyStr || 'No history recorded yet.'}`;
            try {
                const aiSummary = await generateGeminiReply(summaryPrompt);
                finalMessage = `✨ **AI Conversation Summary**:\n\n${aiSummary || 'No recent messages to summarize.'}`;
            } catch (err) {
                console.error("Summary generation failed", err);
                finalMessage = "✨ AI summary is currently unavailable.";
            }
        } else if (finalMessage?.trim().toLowerCase().startsWith("@translate")) {
            isAIMessage = true;
            const parts = finalMessage.trim().split(" ");
            const targetLang = parts[1] || "English";
            const textToTranslate = parts.slice(2).join(" ");
            let historyLastMsg = "";
            if (!textToTranslate && conversation && conversation.messages && conversation.messages.length > 0) {
                try {
                    const lastMsgObj = await Message.findById(conversation.messages[conversation.messages.length - 1]);
                    if (lastMsgObj) historyLastMsg = lastMsgObj.message;
                } catch (e) {}
            }
            const sourceText = textToTranslate || historyLastMsg || "Hello! How are you?";
            const translatePrompt = `Translate the following text into ${targetLang}. Return ONLY the direct translation without extra quotes:\n"${sourceText}"`;
            try {
                const translated = await generateGeminiReply(translatePrompt);
                finalMessage = `🌐 **AI Translation (${targetLang})**:\n${translated}`;
            } catch (err) {
                console.error("Translation failed", err);
                finalMessage = "🌐 AI translation failed.";
            }
        }

        const newMessage =
await Message.create({

    sender,

    receiver,

    message: finalMessage,
    
    isAIMessage,
    isAIMusic,
    musicQuery,
    isGhost: Boolean(req.body.isGhost === 'true' || req.body.isGhost === true || (typeof finalMessage === 'string' && finalMessage.startsWith('@ghost'))),
    isViewOnce: Boolean(req.body.isViewOnce === 'true' || req.body.isViewOnce === true),

    image,

    voice,

    audioTranscript: req.body.audioTranscript || "",

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
            )
            .populate("sender", "name email profileImage userName")
            .populate({
                path: "replyTo",
                select: "message image sender"
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

        // SENDER SOCKET EMISSION REMOVED
        // Emitting back to the sender causes a duplication flicker with Optimistic UI updates.
        // The sender already receives the message through the HTTP response.

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

                    // SENDER SOCKET EMISSION REMOVED FOR AI
                    // The sender receives the AI response through the HTTP response payload.
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

                // SENDER SOCKET EMISSION REMOVED FOR FALLBACK AI
                // The sender receives the fallback AI response through the HTTP response payload.
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

        // Clean up any ghost messages that have expired (revealed > 5s ago)
        const validMessages = [];
        const now = Date.now();
        for (const msg of conversation.messages) {
            if (msg.isGhost && msg.isGhostRevealed && msg.ghostRevealedAt) {
                const elapsed = now - new Date(msg.ghostRevealedAt).getTime();
                if (elapsed >= 5000) {
                    await Message.findByIdAndDelete(msg._id);
                    await Conversation.updateOne({ _id: conversation._id }, { $pull: { messages: msg._id } });
                    continue;
                }
            }
            validMessages.push(msg);
        }

        return res.status(200)
            .json(
                validMessages
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

                        const isLastGhost = lastMessage?.isGhost || (typeof lastMessage?.message === 'string' && lastMessage?.message.startsWith('@ghost'));
                        const formattedLastMessage = isLastGhost
                            ? "Ghost SMS 👻"
                            : (lastMessage?.message || (lastMessage?.image ? "📷 Image" : lastMessage?.voice ? "🎤 Voice Message" : ""));

                        return {
                            ...user.toObject(),
                            lastMessage: formattedLastMessage,
                            isLastGhost,
                            lastMessageTime: lastMessage?.createdAt || null,
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

// REVEAL GHOST MESSAGE
export const revealGhostMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        if (!message.isGhostRevealed) {
            message.isGhostRevealed = true;
            message.ghostRevealedAt = new Date();
            await message.save();

            const senderSocketId = getReceiverSocketId(message.sender);
            const receiverSocketId = getReceiverSocketId(message.receiver);

            if (senderSocketId) {
                io.to(senderSocketId).emit("ghostMessageRevealed", { messageId, ghostRevealedAt: message.ghostRevealedAt });
            }
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("ghostMessageRevealed", { messageId, ghostRevealedAt: message.ghostRevealedAt });
            }
        }

        return res.status(200).json(message);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// DISINTEGRATE GHOST MESSAGE
export const disintegrateGhostMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(200).json({ success: true, message: "Already disintegrated" });
        }

        const senderId = message.sender?.toString();
        const receiverId = message.receiver?.toString();

        await Conversation.updateMany(
            { messages: messageId },
            { $pull: { messages: messageId } }
        );

        await Message.findByIdAndDelete(messageId);

        if (senderId) {
            const senderSocketId = getReceiverSocketId(senderId);
            if (senderSocketId) {
                io.to(senderSocketId).emit("ghostMessageDisintegrated", { messageId });
            }
        }

        if (receiverId) {
            const receiverSocketId = getReceiverSocketId(receiverId);
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("ghostMessageDisintegrated", { messageId });
            }
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// AI CONTROLLER FUNCTIONS FOR DIRECT API CALLS

// Generate AI Summary for a conversation
export const generateAISummary = async (req, res) => {
    try {
        const sender = req.userId;
        const { receiver } = req.params;
        const conversation = await Conversation.findOne({
            participants: { $all: [sender, receiver] }
        }).populate({
            path: 'messages',
            options: { limit: 20, sort: { createdAt: -1 } },
            populate: { path: 'sender', select: 'name userName' }
        });

        if (!conversation || !conversation.messages || conversation.messages.length === 0) {
            return res.status(200).json({ summary: "No chat history available to summarize yet!" });
        }

        const chatLogs = conversation.messages
            .reverse()
            .map(m => `${m.sender?.name || 'User'}: ${m.message || '[Media]'}`)
            .join("\n");

        const prompt = `Below is the recent chat transcript between two users:\n${chatLogs}\n\nProvide a clear, engaging 3-bullet point summary of what they discussed and key highlights. Keep it concise.`;

        const summary = await generateGeminiReply(prompt);
        return res.status(200).json({ summary });
    } catch (error) {
        console.error("generateAISummary Error:", error);
        return res.status(500).json({ message: "Failed to generate AI Summary", error: error.message });
    }
};

// Generate AI Smart Replies
export const generateSmartReplies = async (req, res) => {
    try {
        const sender = req.userId;
        const { receiver } = req.params;
        const conversation = await Conversation.findOne({
            participants: { $all: [sender, receiver] }
        }).populate({
            path: 'messages',
            options: { limit: 5, sort: { createdAt: -1 } }
        });

        if (!conversation || !conversation.messages || conversation.messages.length === 0) {
            return res.status(200).json({ suggestions: ["Hey there! 👋", "How's it going?", "What's up?"] });
        }

        const lastMessages = conversation.messages
            .reverse()
            .map(m => m.message)
            .filter(Boolean)
            .join(" | ");

        const prompt = `Based on these recent chat messages: "${lastMessages}", suggest 3 short, natural, conversational quick-reply options for the user. Return ONLY a valid JSON array of 3 strings like ["Reply 1", "Reply 2", "Reply 3"], with no extra text or markdown formatting.`;

        const rawReply = await generateGeminiReply(prompt);
        let suggestions = [];
        try {
            const cleanJson = rawReply.replace(/```json|```/g, '').trim();
            suggestions = JSON.parse(cleanJson);
        } catch (e) {
            suggestions = rawReply
                .split("\n")
                .map(s => s.replace(/^[-*0-9.]+\s*/, '').trim())
                .filter(Boolean)
                .slice(0, 3);
        }

        if (!Array.isArray(suggestions) || suggestions.length === 0) {
            suggestions = ["Sounds good! 👍", "Tell me more!", "Got it, thanks!"];
        }

        return res.status(200).json({ suggestions });
    } catch (error) {
        console.error("generateSmartReplies Error:", error);
        return res.status(500).json({ suggestions: ["Sounds good! 👍", "Tell me more!", "Got it, thanks!"] });
    }
};

// Translate Specific Message with Gemini AI & MyMemory Fallback
export const translateTextMessage = async (req, res) => {
    try {
        const { text, targetLanguage = "English" } = req.body;
        if (!text) {
            return res.status(400).json({ message: "Text to translate is required" });
        }

        let translatedText = "";

        // 1. Try Gemini AI First
        try {
            const translationSystemInstruction = `You are a professional multi-lingual translator. Translate the text into ${targetLanguage}. If target is Bengali, use authentic Bengali script (বাংলা). Output ONLY the direct translated text with no extra commentary or quotes.`;
            const geminiRes = await generateGeminiReply(text, GEMINI_MODEL, 2, translationSystemInstruction);
            if (geminiRes && !geminiRes.includes("Missing Key") && !geminiRes.includes("couldn't generate") && !geminiRes.includes("fallback text")) {
                translatedText = geminiRes;
            }
        } catch (e) {
            console.log("Gemini translate error, falling back to MyMemory API:", e.message);
        }

        // 2. High-Accuracy Fallback: MyMemory Free Translation API
        if (!translatedText) {
            const langMap = {
                "English": "en",
                "Bengali": "bn",
                "Hindi": "hi",
                "Spanish": "es",
                "French": "fr",
                "German": "de",
                "Japanese": "ja",
                "Mandarin": "zh",
                "Arabic": "ar",
                "Russian": "ru",
                "Italian": "it",
                "Portuguese": "pt"
            };
            const targetCode = langMap[targetLanguage] || "en";
            
            try {
                const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=autodetect|${targetCode}`);
                const data = await response.json();
                if (data && data.responseData && data.responseData.translatedText) {
                    translatedText = data.responseData.translatedText;
                }
            } catch (err) {
                console.error("MyMemory translation error:", err);
            }
        }

        if (!translatedText) {
            translatedText = text; // Return original text if translation service offline
        }

        return res.status(200).json({ translatedText });
    } catch (error) {
        console.error("translateTextMessage Error:", error);
        return res.status(200).json({ translatedText: req.body.text || "Translation failed." });
    }
};

// OPEN VIEW ONCE MESSAGE
export const openViewOnceMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: "Message not found" });
        }

        if (!message.isViewOnceOpened) {
            message.isViewOnceOpened = true;
            await message.save();

            const senderSocketId = getReceiverSocketId(message.sender);
            const receiverSocketId = getReceiverSocketId(message.receiver);

            if (senderSocketId) {
                io.to(senderSocketId).emit("viewOnceOpened", { messageId });
            }
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("viewOnceOpened", { messageId });
            }
        }

        return res.status(200).json(message);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// 1. AI CHAT SENTIMENT & VIBE METER
export const getChatSentiment = async (req, res) => {
    try {
        const userId = req.userId;
        const { targetUserId } = req.params;

        const conversation = await Conversation.findOne({
            participants: { $all: [userId, targetUserId] }
        });

        if (!conversation || !conversation.messages || conversation.messages.length === 0) {
            return res.status(200).json({
                sentiment: "Neutral",
                score: "85%",
                vibe: "😊 Warm & Friendly",
                summary: "Conversation is peaceful and balanced!"
            });
        }

        const recentMsgIds = conversation.messages.slice(-25);
        const recentMsgs = await Message.find({ _id: { $in: recentMsgIds }, isDeleted: false });
        const textBuffer = recentMsgs.map(m => m.message).filter(Boolean).join("\n");

        if (!textBuffer.trim()) {
            return res.status(200).json({
                sentiment: "Neutral",
                score: "80%",
                vibe: "😊 Calm & Respectful",
                summary: "Recent activity consists mainly of media attachments."
            });
        }

        const prompt = `Analyze the sentiment and vibe of the following chat messages. Output a short JSON object with keys "sentiment" (e.g. Positive, Energetic, Calm), "score" (percentage like 88%), "vibe" (short emoji + description like "🔥 Energetic & Collaborative"), and "summary" (1-2 sentences overall summary). Output ONLY raw valid JSON:\n"${textBuffer.slice(0, 1000)}"`;

        try {
            const aiRes = await generateGeminiReply(prompt, undefined, 2, "You are a chat sentiment analyst. Output raw JSON only.");
            const cleanJson = aiRes.replace(/```json|```/g, "").trim();
            const parsed = JSON.parse(cleanJson);
            return res.status(200).json(parsed);
        } catch (e) {
            return res.status(200).json({
                sentiment: "Positive",
                score: "90%",
                vibe: "🔥 Active & Engaging",
                summary: "The conversation shows high engagement and friendly interaction."
            });
        }
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// 2. AI CODE REVIEWER & BUG DETECTOR
export const reviewCodeSnippet = async (req, res) => {
    try {
        const { code, language } = req.body;
        if (!code) {
            return res.status(400).json({ message: "Code snippet is required" });
        }

        const langHeader = language && language !== "Auto-Detect" ? `Language: ${language}` : "Auto-detect programming language (e.g. Python, JavaScript, C++, Java, PHP, Go, Rust, SQL)";

        const prompt = `Perform a comprehensive code review on the following code snippet (${langHeader}).

Provide a clear, structured review:
1. 🔍 Overall Quality & Bug Summary
2. 🐛 Bugs / Syntax Errors Detected (explain missing quotes, undefined variables, function typos, etc.)
3. ⚡ Corrected & Optimized Code Solution
4. 🖥️ Expected Output / Console Execution Result (clearly show the exact text/result printed when the fixed code is executed)

Code snippet:
\`\`\`
${code}
\`\`\``;

        const review = await generateGeminiReply(
            prompt, 
            undefined, 
            2, 
            "You are a Senior Principal Software Engineer and Code Reviewer. Identify the exact programming language used (or intended, e.g. Python vs JavaScript). Be constructive, precise, and format code clearly with proper syntax highlighting."
        );
        return res.status(200).json({ review });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// 3. AI VOICE NOTE TRANSCRIBER
export const transcribeVoiceMessage = async (req, res) => {
    try {
        const { audioText, voiceUrl } = req.body;
        
        let speechText = audioText?.trim();
        if (!speechText || speechText === "Voice audio message") {
            speechText = "Audio note recording";
        }

        const prompt = `You are an expert Speech-to-Text Transcriber and AI Audio Summarizer.
Analyze this voice note spoken content: "${speechText}".

Format your response cleanly into 2 sections:
📝 TRANSCRIPT: "${speechText}"
💡 SUMMARY: (Provide a 1-sentence quick summary of what the speaker said)

Do NOT include any extra disclaimers, warnings, or historical quotes. Output only the transcript and summary directly.`;

        const transcript = await generateGeminiReply(prompt, undefined, 2, "You are a speech-to-text audio transcriber.");
        return res.status(200).json({ transcript: transcript || `📝 TRANSCRIPT:\n"${speechText}"\n\n💡 SUMMARY:\nVoice message recording transcribed.` });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};