import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({

    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false
    },

    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
        required: false
    },

    message: {
        type: String,
        default: ""
    },

    image: {
        type: String,
        default: ""
    },

    voice: {
        type: String,
        default: ""
    },

    audioTranscript: {
        type: String,
        default: ""
    },

    // REPLY FEATURE
    replyTo: {

        type: mongoose.Schema.Types.ObjectId,

        ref: "Message",

        default: null

    },

    // REACTIONS FEATURE
    reactions: [

        {

            userId: {

                type: mongoose.Schema.Types.ObjectId,

                ref: "User"

            },

            emoji: {

                type: String

            }

        }

    ],

    isSeen: {
        type: Boolean,
        default: false
    },
    
    isDeleted: {
    type: Boolean,
    default: false
    },
    
    isSystemMessage: {
        type: Boolean,
        default: false
    },
    
    isAIMessage: {
        type: Boolean,
        default: false
    },
    
    isAIMusic: {
        type: Boolean,
        default: false
    },
    
    musicQuery: {
        type: String,
        default: ""
    },
    
    deletedFor: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }],

    isEdited: {
        type: Boolean,
        default: false
    },

    editedAt: {
        type: Date,
        default: null
    },

    isAnonymous: {
        type: Boolean,
        default: false
    },

    isGhost: {
        type: Boolean,
        default: false
    },

    isGhostRevealed: {
        type: Boolean,
        default: false
    },

    ghostRevealedAt: {
        type: Date,
        default: null
    },

    isViewOnce: {
        type: Boolean,
        default: false
    },

    isViewOnceOpened: {
        type: Boolean,
        default: false
    },

}, {
    timestamps: true
});

messageSchema.index({ sender: 1, receiver: 1, createdAt: -1 });
messageSchema.index({ receiver: 1, isSeen: 1 });
messageSchema.index({ createdAt: -1 });

const Message = mongoose.model(
    "Message",
    messageSchema
);

export default Message;