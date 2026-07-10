import Call from "../models/call.model.js";

// Save a call record
export const saveCallHistory = async (req, res) => {
    try {
        const { receiverId, callType } = req.body;
        const callerId = req.userId;

        if (!receiverId || !callType) {
            return res.status(400).json({ message: "Receiver ID and Call Type are required" });
        }

        const newCall = await Call.create({
            caller: callerId,
            receiver: receiverId,
            callType
        });

        const populatedCall = await Call.findById(newCall._id).populate("caller", "name userName profileImage").populate("receiver", "name userName profileImage");

        return res.status(201).json(populatedCall);
    } catch (error) {
        console.log("Save Call History Error:", error);
        return res.status(500).json({ message: `Error saving call history: ${error.message}` });
    }
};

// Get call history for user
export const getCallHistory = async (req, res) => {
    try {
        const userId = req.userId;

        const calls = await Call.find({
            $or: [{ caller: userId }, { receiver: userId }]
        })
        .populate("caller", "name userName profileImage")
        .populate("receiver", "name userName profileImage")
        .sort({ createdAt: -1 });

        return res.status(200).json(calls);
    } catch (error) {
        console.log("Get Call History Error:", error);
        return res.status(500).json({ message: `Error getting call history: ${error.message}` });
    }
};

// Delete a call history record
export const deleteCallHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const call = await Call.findById(id);
        if (!call) {
            return res.status(404).json({ message: "Call history not found" });
        }

        // Only allow if user is either caller or receiver
        if (call.caller.toString() !== userId.toString() && call.receiver.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this call record" });
        }

        await Call.findByIdAndDelete(id);

        return res.status(200).json({ message: "Call history deleted successfully", id });
    } catch (error) {
        console.log("Delete Call History Error:", error);
        return res.status(500).json({ message: `Error deleting call history: ${error.message}` });
    }
};
