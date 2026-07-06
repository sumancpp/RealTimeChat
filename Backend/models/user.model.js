import mongoose from "mongoose";

const userSchema = new mongoose.Schema({

    name: {
        type: String
    },

    userName: {
        type: String,
        required: true,
        unique: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true
    },

    securityQuestion: {
        type: String
    },

    securityAnswer: {
        type: String
    },

    profileImage: {
        type: String,
        default: ""
    },

    isAI: {
    type: Boolean,
    default: false
},

    resetOtp: {
    type: String,
    default: null
},

resetOtpExpiry: {
    type: Date,
    default: null
},

    lastSeen: {
        type: Date,
        default: Date.now
    },

    pushSubscriptions: {
        type: Array,
        default: []
    },

    aiChatCount: {
        type: Number,
        default: 0
    },

    aiChatDate: {
        type: Date,
        default: null
    }

}, {
    timestamps: true
});

const User = mongoose.model(
    "User",
    userSchema
);

export default User;