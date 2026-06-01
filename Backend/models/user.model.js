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

    profileImage: {
        type: String,
        default: ""
    },

    // WhatsApp-style Last Seen
    lastSeen: {
        type: Date,
        default: Date.now
    }

}, {
    timestamps: true
});

const User = mongoose.model(
    "User",
    userSchema
);

export default User;