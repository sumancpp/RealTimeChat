import { json } from "express"
import genToken from "../config/token.js"
import User from "../models/user.model.js"
import bcrypt from "bcryptjs"
import uploadOnCloudinary from "../config/cloudinary.js"
import transporter from "../config/mail.js";
import crypto from "crypto";

export const signUp = async (req, res) => {
     try {
        const {userName,email,password}=req.body

         if (!userName || !email || !password) {
         return res.status(400).json({ message: "All fields are required" })
        }

        if(password.length<6){
             return res.status(400).json({message:"Password must be at least 6 characters"})
        }

        const checkUserByuserName = await User.findOne({userName})
        if(checkUserByuserName){
            return res.status(400).json({message:"Username already exist"})
        }

        const checkUserByemail = await User.findOne({email})
        if(checkUserByemail){
            return res.status(400).json({message:"Email already exist"})
        }

        const hashedPassword = await bcrypt.hash(password,5)

        const user = await User.create({
            userName,
            email,
            password:hashedPassword
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


//forget password
export const forgotPassword =
    async (req, res) => {

        try {

            const { email } =
                req.body;

            const user =
                await User.findOne({
                    email
                });

            if (!user) {

                return res.status(404)
                    .json({

                        message:
                            "User not found"

                    });

            }

            const otp =
                Math.floor(

                    100000 +

                    Math.random() *

                    900000

                ).toString();

            console.log("Generated OTP:", otp, "for email:", email);

            user.resetOtp =
                otp;

            user.resetOtpExpiry =
                Date.now() +
                10 * 60 * 1000;

            await user.save();

            try {
                await transporter.sendMail({

                    from:
                        process.env.EMAIL_USER,

                    to:
                        email,

                    subject:
                        "BaatCheet Password Reset OTP",

                    text:
                        `Your OTP is ${otp}`,

                    html:
                        `<p>Your OTP for password reset is: <strong>${otp}</strong></p><p>This OTP will expire in 10 minutes.</p>`

                });

                console.log("OTP sent successfully to:", email);

            } catch (mailError) {
                console.error("Email sending failed:", mailError);
                return res.status(500).json({
                    message: "Failed to send OTP. Check email configuration."
                });
            }

            return res.status(200)
                .json({

                    message:
                        "OTP sent successfully"

                });

        }

        catch (error) {

            console.error("Forgot password error:", error);

            return res.status(500)
                .json({

                    message:
                        error.message

                });

        }

    };


// Verify OTP API

export const verifyOtp =
    async (req, res) => {

        try {

            const {

                email,

                otp

            } = req.body;

            const user =
                await User.findOne({

                    email

                });

            if (

                !user ||

                user.resetOtp !== otp

            ) {

                return res.status(400)
                    .json({

                        message:
                            "Invalid OTP"

                    });

            }

            if (

                user.resetOtpExpiry <
                Date.now()

            ) {

                return res.status(400)
                    .json({

                        message:
                            "OTP Expired"

                    });

            }

            return res.status(200)
                .json({

                    success: true

                });

        }

        catch (error) {

            return res.status(500)
                .json({

                    message:
                        error.message

                });

        }

    };

 // Reset Password API
 
 export const resetPassword =
    async (req, res) => {

        try {

            const {

                email,

                otp,

                password

            } = req.body;

            const user =
                await User.findOne({

                    email

                });

            if (

                !user ||

                user.resetOtp !== otp

            ) {

                return res.status(400)
                    .json({

                        message:
                            "Invalid OTP"

                    });

            }

            const hashedPassword =
                await bcrypt.hash(
                    password,
                    5
                );

            user.password =
                hashedPassword;

            user.resetOtp =
                null;

            user.resetOtpExpiry =
                null;

            await user.save();

            return res.status(200)
                .json({

                    message:
                        "Password updated"

                });

        }

        catch (error) {

            return res.status(500)
                .json({

                    message:
                        error.message

                });

        }

    };

export const testEmail = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                message: "Email is required"
            });
        }

        console.log("Testing email with:", {
            from: process.env.EMAIL_USER,
            to: email
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "BaatCheet - Test Email",
            html: "<h1>Test Email</h1><p>If you received this, your email configuration is working correctly!</p>"
        });

        return res.status(200).json({
            message: "Test email sent successfully"
        });

    } catch (error) {
        console.error("Test email error:", error);
        return res.status(500).json({
            message: "Email test failed: " + error.message
        });
    }
};


