import mongoose from "mongoose";
import dotenv from "dotenv";

import User from "./models/user.model.js";
import Conversation from "./models/conversation.model.js";
import Message from "./models/message.model.js";

dotenv.config();

const deleteAllUsers = async () => {

    try {

        await mongoose.connect(
            process.env.MONGODB_URL
        );

        console.log("DB Connected");

        await User.deleteMany({});

        await Conversation.deleteMany({});

        await Message.deleteMany({});

        console.log(
            "All users, messages and conversations deleted"
        );

        process.exit();

    } catch (error) {

        console.log(error);

        process.exit(1);

    }

};

deleteAllUsers();