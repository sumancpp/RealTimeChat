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

    expiresAt: {
        type: Date,
        default: null
    },

    isViewOnce: {
        type: Boolean,
        default: false
    },

    viewOnceSeen: {
        type: Boolean,
        default: false
    }

}, {
    timestamps: true
});

messageSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Message = mongoose.model(
    "Message",
    messageSchema
);

export default Message;