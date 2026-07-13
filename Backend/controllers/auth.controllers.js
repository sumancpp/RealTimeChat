import { json } from "express"
import genToken from "../config/token.js"
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import uploadOnCloudinary from "../config/cloudinary.js"
import transporter from "../config/mail.js";
import crypto from "crypto";

export const signUp = async (req, res) => {
     try {
        const {name, email, password, securityQuestion, securityAnswer}=req.body

         if (!name || !email || !password || !securityQuestion || !securityAnswer) {
         return res.status(400).json({ message: "All fields are required" })
        }

        if(password.length<6){
             return res.status(400).json({message:"Password must be at least 6 characters"})
        }

        const checkUserByemail = await User.findOne({email})
        if(checkUserByemail){
            return res.status(400).json({message:"Email already exist"})
        }

        let baseUserName = name.trim().toLowerCase().replace(/\s+/g, '');
        if (!baseUserName) baseUserName = "user";
        
        let generatedUserName = "";
        let isUnique = false;
        
        while (!isUnique) {
             generatedUserName = baseUserName + Math.floor(1000 + Math.random() * 9000);
             const existing = await User.findOne({userName: generatedUserName});
             if (!existing) {
                 isUnique = true;
             }
        }

        const hashedPassword = await bcrypt.hash(password,5)

        const user = await User.create({
            name: name.trim(),
            userName: generatedUserName,
            email,
            password:hashedPassword,
            securityQuestion,
            securityAnswer: securityAnswer.toLowerCase().trim()
        })

        const token = await genToken(user._id)
        res.cookie("token",token,{
            httpOnly:true,
            maxAge:7*24*60*60*1000,
            sameSite:"None",
            secure:true
        })

    return res.status(201).json(user)

     } catch (error) {
        console.log(error);
        return res.status(500).json({message:`signup error ${error}`})
     }
}


//login

export const login = async (req, res) => {
     try {
        const {email,password}=req.body
        
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({message:"User doesnot exist"})
        }

        const isMatch = await bcrypt.compare(password,user.password)

        if(!isMatch){
            return res.status(400).json({message:"Incorrect Password"})
        }


        const token = await genToken(user._id)
        res.cookie("token",token,{
            httpOnly:true,
            maxAge:7*24*60*60*1000,
            sameSite:"None",
            secure:true
        })

    return res.status(200).json(user)

     } catch (error) {
        return res.status(500).json({message:`login error ${error}`})
     }
}


//logout

export const logOut = async (req, res) => {
    try {
        res.clearCookie("token")
        return res.status(200).json({ message: "Logout Successful" })
    } catch (error) {
        return res.status(500).json({ message: `logout error ${error}` })
    }
}


//profileImage

export const editProfile = async (req, res) => {

    try {

        let { name } = req.body;

        let profileImage = "";

        const updateData = {};

        if (name && name.trim()) {
            updateData.name = name.trim();
        }

        if (req.file) {

            profileImage =
                await uploadOnCloudinary(
                    req.file.path
                );

        }

        if (profileImage) {

            updateData.profileImage =
                profileImage;

        }

        const user =
            await User.findByIdAndUpdate(

                req.userId,

                updateData,

                {
                    returnDocument: 'after'
                }

            ).select("-password");

        if (!user) {

            return res.status(404).json({

                message:
                    "User not found"

            });

        }

        return res.status(200).json(
            user
        );

    } catch (error) {

        console.log(
            "PROFILE ERROR:",
            error
        );

        return res.status(500).json({

            message:
                error.message

        });

    }

};



export const getSecurityQuestion = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (!user.securityQuestion) {
            return res.status(400).json({ message: "No security question set for this user" });
        }
        return res.status(200).json({ securityQuestion: user.securityQuestion });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const resetPasswordWithQuestion = async (req, res) => {
    try {
        const { email, securityAnswer, newPassword } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        if (!user.securityAnswer || user.securityAnswer.toLowerCase() !== securityAnswer.toLowerCase().trim()) {
            return res.status(400).json({ message: "Incorrect security answer" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 5);
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
