import mongoose from "mongoose";

const statusSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    image: {
        type: String,
        required: true
    },
    caption: {
        type: String,
        default: ""
    },
    viewers: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        viewedAt: {
            type: Date,
            default: Date.now
        }
    }],
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400 // 24 hours in seconds TTL index
    }
});

export default mongoose.model("Status", statusSchema);
