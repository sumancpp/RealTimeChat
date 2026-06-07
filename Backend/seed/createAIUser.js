import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/user.model.js";

const createAIUser = async () => {

    const existingAI =
        await User.findOne({
            isAI: true
        });

    if (existingAI) {

        console.log(
            "AI User already exists"
        );

        return;

    }

    const hashedPassword =
        await bcrypt.hash(
            "baatcheet-ai",
            5
        );

    await User.create({

        name: "BaatCheet AI",

        userName: "ai",

        email:
            "ai@baatcheet.com",

        password:
            hashedPassword,

        isAI: true,

        profileImage:
            "https://cdn-icons-png.flaticon.com/512/4712/4712027.png"

    });

    console.log(
        "AI User Created"
    );

};

export default createAIUser;