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
        type: String,
        required: true,
        default: "What is your favorite color?"
    },

    securityAnswer: {
        type: String,
        required: true,
        default: "black"
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
    }

}, {
    timestamps: true
});

const User = mongoose.model(
    "User",
    userSchema
);

export default User;