import Conversation from "../models/conversation.model.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import uploadOnCloudinary from "../config/cloudinary.js";
import { io, getReceiverSocketId } from "../socket/socket.js";

// CREATE GROUP
export const createGroup = async (req, res) => {
    try {
        const { groupName, groupDescription, participants } = req.body;
        
        let parsedParticipants = [];
        if (participants) {
            parsedParticipants = typeof participants === 'string' ? JSON.parse(participants) : participants;
        }
        
        let groupProfileImage = "";
        if (req.file) {
            const uploadedFile = await uploadOnCloudinary(req.file.path);
            if (req.file.mimetype.startsWith("image")) {
                groupProfileImage = uploadedFile;
            }
        }

        const newGroup = await Conversation.create({
            isGroup: true,
            groupName,
            groupDescription,
            groupProfileImage,
            participants: [...parsedParticipants, req.userId],
            admins: [req.userId],
            messages: []
        });

        const populatedGroup = await Conversation.findById(newGroup._id).populate("participants", "-password").populate("admins", "-password");

        return res.status(201).json(populatedGroup);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// GET GROUPS FOR USER
export const getGroups = async (req, res) => {
    try {
        const groups = await Conversation.find({
            isGroup: true,
            participants: { $in: [req.userId] }
        }).populate("participants", "-password").populate("admins", "-password").populate("messages");

        // Adding some structure to match user list items
        const groupsWithData = groups.map((group) => {
            const msgs = group.messages;
            const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;
            return {
                ...group.toObject(),
                lastMessage: lastMsg?.message || (lastMsg?.image ? "📷 Image" : lastMsg?.voice ? "🎤 Voice" : ""),
                lastMessageTime: lastMsg?.createdAt || group.createdAt,
                unreadCount: 0 // Simplification for now
            };
        });

        groupsWithData.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());

        return res.status(200).json(groupsWithData);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// ADD USERS TO GROUP (admin only)
export const addUsersToGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { usersToAdd } = req.body; // array of userIds

        const group = await Conversation.findById(groupId);
        if(!group) return res.status(404).json({ message: "Group not found" });

        if(!group.admins.some(admin => admin.toString() === req.userId.toString())) {
            return res.status(403).json({ message: "Only admins can add users" });
        }

        const newParticipants = [...new Set([...group.participants.map(p => p.toString()), ...usersToAdd])];
        group.participants = newParticipants;
        await group.save();

        const updatedGroup = await Conversation.findById(groupId).populate("participants", "-password").populate("admins", "-password");

        return res.status(200).json(updatedGroup);

    } catch (error) {
         return res.status(500).json({ message: error.message });
    }
}

// MAKE ADMIN
export const makeAdmin = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { userIdToMakeAdmin } = req.body; 

        const group = await Conversation.findById(groupId);
        if(!group) return res.status(404).json({ message: "Group not found" });

        if(!group.admins.some(admin => admin.toString() === req.userId.toString())) {
            return res.status(403).json({ message: "Only admins can make other users admin" });
        }

        if(!group.admins.some(admin => admin.toString() === userIdToMakeAdmin.toString())) {
            group.admins.push(userIdToMakeAdmin);
            await group.save();
        }

        const updatedGroup = await Conversation.findById(groupId).populate("participants", "-password").populate("admins", "-password");
        return res.status(200).json(updatedGroup);

    } catch(error) {
        return res.status(500).json({ message: error.message });
    }
}

// SEND MESSAGE TO GROUP
export const sendGroupMessage = async (req, res) => {
    try {
        const sender = req.userId;
        const { groupId } = req.params;
        const { message, replyTo } = req.body;

        let image = "";
        let voice = "";

        if (req.file) {
            const uploadedFile = await uploadOnCloudinary(req.file.path);
            if (req.file.mimetype.startsWith("image")) {
                image = uploadedFile;
            } else if (req.file.mimetype.startsWith("audio")) {
                voice = uploadedFile;
            }
        }

        let group = await Conversation.findById(groupId);
        if(!group) return res.status(404).json({ message: "Group not found" });

        if(!group.participants.some(p => p.toString() === sender.toString())) {
            return res.status(403).json({ message: "You are not a participant of this group" });
        }

        const newMessage = await Message.create({
            sender,
            conversationId: groupId,
            message,
            image,
            voice,
            replyTo: replyTo || null,
            isSeen: false
        });

        group.messages.push(newMessage._id);
        group.updatedAt = new Date();
        await group.save();

        const populatedMessage = await Message.findById(newMessage._id)
            .populate({ path: "replyTo", select: "message image sender" })
            .populate("sender", "name userName profileImage");

        // emit to all participants
        group.participants.forEach(participantId => {
            const socketId = getReceiverSocketId(participantId.toString());
            if(socketId) {
                io.to(socketId).emit("newGroupMessage", { ...populatedMessage.toObject(), groupId });
            }
        });

        return res.status(201).json(populatedMessage);
    } catch(error) {
        return res.status(500).json({ message: error.message });
    }
}

// GET GROUP MESSAGES
export const getGroupMessages = async (req, res) => {
    try {
        const { groupId } = req.params;

        const group = await Conversation.findById(groupId).populate({
            path: "messages",
            populate: [
                {
                    path: "replyTo",
                    select: "message image sender"
                },
                {
                    path: "sender",
                    select: "name userName profileImage"
                }
            ]
        });

        if(!group) return res.status(404).json({ message: "Group not found" });

        return res.status(200).json(group.messages);

    } catch(error) {
        return res.status(500).json({ message: error.message });
    }
}
