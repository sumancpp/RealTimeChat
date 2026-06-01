import dotenv from "dotenv";
dotenv.config();
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
    secure: true
});

const uploadOnCloudinary = async (filePath) => {

    try {

        console.log("Uploading file:", filePath);

        const result = await cloudinary.uploader.upload(
    filePath,
    {
        folder: "baatcheet",
        resource_type: "auto",
        timeout: 120000
    }
);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        return result.secure_url;

    } catch (error) {

        console.log(
            "Cloudinary Full Error:",
            error
        );

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        return null;

    }

};

export default uploadOnCloudinary;