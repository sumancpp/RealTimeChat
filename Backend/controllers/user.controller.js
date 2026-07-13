import User from "../models/user.model.js";

// UPDATE PROFILE
export const updateProfile = async (req, res) => {

    try {

        const { name, profileImage } = req.body;

        const updatedUser =
            await User.findByIdAndUpdate(

                req.userId,

                {
                    name,
                    profileImage
                },

                {
                    returnDocument: 'after'
                }

            ).select("-password");

        if (!updatedUser) {

            return res.status(404).json({
                message: "User not found"
            });

        }

        return res.status(200).json(
            updatedUser
        );

    } catch (error) {

        return res.status(500).json({
            message:
                `Update profile error: ${error.message}`
        });

    }

};

// GET CURRENT USER
export const getCurrentUser = async (
    req,
    res
) => {

    try {

        const user =
            await User.findById(
                req.userId
            ).select("-password");

        if (!user) {

            return res.status(404).json({
                message: "User not found"
            });

        }

        return res.status(200).json(user);

    } catch (error) {

        return res.status(500).json({
            message:
                `Get current user error: ${error.message}`
        });

    }

};

// GET OTHER USERS
export const getOtherUser = async (
    req,
    res
) => {

    try {

        const users =
            await User.find({

                _id: {
                    $ne: req.userId
                }

            })

            .select("-password")

            .sort({

                isAI: -1

            });

        return res
            .status(200)
            .json(users);

    }

    catch (error) {

        return res
            .status(500)
            .json({

                message:
                    `Get Other User error ${error.message}`

            });

    }

};

// SEARCH USERS
export const searchUsers = async (
    req,
    res
) => {

    try {

        const query =
            req.query.query;

        const users =
            await User.find({

                _id: {
                    $ne: req.userId
                },

                $or: [

                    {

                        name: {

                            $regex: query,

                            $options: "i"

                        }

                    },

                    {

                        userName: {

                            $regex: query,

                            $options: "i"

                        }

                    }

                ]

            })

            .select("-password")

            .sort({

                isAI: -1

            });

        return res
            .status(200)
            .json(users);

    }

    catch (error) {

        return res
            .status(500)
            .json({

                message:
                    error.message

            });

    }

};

// SUBSCRIBE TO NOTIFICATIONS
export const subscribeToNotifications = async (req, res) => {
    try {
        const { subscription } = req.body;
        if (!subscription) return res.status(400).json({ message: "Subscription is required" });
        
        await User.findByIdAndUpdate(
            req.userId,
            { $addToSet: { pushSubscriptions: subscription } }
        );
        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// BLOCK USER
export const blockUser = async (req, res) => {
    try {
        const currentUser = req.userId;
        const { id: userToBlock } = req.params;

        if (currentUser.toString() === userToBlock.toString()) {
            return res.status(400).json({ message: "You cannot block yourself" });
        }

        const user = await User.findByIdAndUpdate(
            currentUser,
            { $addToSet: { blockedUsers: userToBlock } },
            { new: true }
        ).select("-password");

        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// UNBLOCK USER
export const unblockUser = async (req, res) => {
    try {
        const currentUser = req.userId;
        const { id: userToUnblock } = req.params;

        const user = await User.findByIdAndUpdate(
            currentUser,
            { $pull: { blockedUsers: userToUnblock } },
            { new: true }
        ).select("-password");

        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// CHAT LOCK - SETUP PIN
export const setupChatLockPin = async (req, res) => {
    try {
        const { pin } = req.body;
        if (!pin || pin.length < 4) {
            return res.status(400).json({ message: "PIN must be at least 4 characters" });
        }
        
        const hashedPin = await bcrypt.hash(pin, 10);
        const user = await User.findByIdAndUpdate(req.userId, { chatLockPin: hashedPin }, { new: true }).select("-password");
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// CHAT LOCK - VERIFY PIN
export const verifyChatLockPin = async (req, res) => {
    try {
        const { pin } = req.body;
        const user = await User.findById(req.userId);
        
        if (!user.chatLockPin) {
            return res.status(400).json({ message: "No PIN set up" });
        }
        
        const isMatch = await bcrypt.compare(pin, user.chatLockPin);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid PIN" });
        }
        
        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// CHAT LOCK - LOCK CHAT
export const lockChat = async (req, res) => {
    try {
        const { id: userToLock } = req.params;
        const user = await User.findByIdAndUpdate(
            req.userId,
            { $addToSet: { lockedChats: userToLock } },
            { new: true }
        ).select("-password");
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

// CHAT LOCK - UNLOCK CHAT
export const unlockChat = async (req, res) => {
    try {
        const { id: userToUnlock } = req.params;
        const user = await User.findByIdAndUpdate(
            req.userId,
            { $pull: { lockedChats: userToUnlock } },
            { new: true }
        ).select("-password");
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};