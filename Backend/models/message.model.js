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
    }

}, {
    timestamps: true
});

const Message = mongoose.model(
    "Message",
    messageSchema
);

export default Message;