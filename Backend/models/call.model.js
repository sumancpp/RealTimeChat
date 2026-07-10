import mongoose from "mongoose";

const callSchema = new mongoose.Schema(
    {
        caller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        receiver: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        callType: {
            type: String,
            enum: ["video", "voice"],
            required: true
        }
    },
    { timestamps: true }
);

const Call = mongoose.model("Call", callSchema);
export default Call;
