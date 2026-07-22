import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({

    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ],

    messages: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Message"
        }
    ],

    isGroup: {
        type: Boolean,
        default: false
    },

    groupName: {
        type: String,
        default: ""
    },

    groupProfileImage: {
        type: String,
        default: ""
    },

    groupDescription: {
        type: String,
        default: ""
    },

    admins: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
    ]
}, {
    timestamps: true
});

conversationSchema.index({ participants: 1 });
conversationSchema.index({ isGroup: 1 });

const Conversation = mongoose.model(
    "Conversation",
    conversationSchema
);

export default Conversation;