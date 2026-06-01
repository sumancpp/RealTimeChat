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
                    new: true
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

            }).select("-password");

        return res.status(200).json(
            users
        );

    } catch (error) {

        return res.status(500).json({
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

            }).select(
                "-password"
            );

        return res.status(200)
            .json(users);

    } catch (error) {

        return res.status(500)
            .json({
                message:
                    error.message
            });

    }

};