import Status from "../models/status.model.js";
import uploadOnCloudinary from "../config/cloudinary.js";
import User from "../models/user.model.js";

// Upload Status
export const uploadStatus = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Image is required" });
        }

        const imageUrl = await uploadOnCloudinary(req.file.path);
        
        if (!imageUrl) {
            return res.status(500).json({ message: "Failed to upload image" });
        }

        const { caption } = req.body;

        const newStatus = await Status.create({
            user: req.userId,
            image: imageUrl,
            caption: caption || ""
        });

        const populatedStatus = await Status.findById(newStatus._id).populate("user", "name userName profileImage");

        res.status(201).json(populatedStatus);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to upload status" });
    }
};

// Get All Statuses
export const getStatuses = async (req, res) => {
    try {
        // Find all statuses from last 24 hours
        const statuses = await Status.find({
            createdAt: { $gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        }).populate("user", "name userName profileImage")
          .populate("viewers.user", "name userName profileImage")
          .sort({ createdAt: -1 });

        res.status(200).json(statuses);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to get statuses" });
    }
};

// View a status
export const viewStatus = async (req, res) => {
    try {
        const statusId = req.params.id;
        const status = await Status.findById(statusId);
        
        if (!status) {
            return res.status(404).json({ message: "Status not found" });
        }
        
        // Check if user already viewed
        const alreadyViewed = status.viewers.find(v => v.user.toString() === req.userId);
        
        if (!alreadyViewed && status.user.toString() !== req.userId) {
            status.viewers.push({ user: req.userId });
            await status.save();
        }
        
        res.status(200).json({ message: "Viewed successfully" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Failed to view status" });
    }
};

// Delete a status
export const deleteStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const status = await Status.findById(id);
        
        if (!status) {
            return res.status(404).json({ message: "Status not found" });
        }
        
        if (status.user.toString() !== req.userId.toString()) {
            return res.status(403).json({ message: "Not authorized to delete this status" });
        }
        
        await Status.findByIdAndDelete(id);
        return res.status(200).json({ message: "Status deleted successfully", id });
    } catch (error) {
        console.log("Delete Status Error:", error);
        return res.status(500).json({ message: "Failed to delete status" });
    }
};
