import mongoose from "mongoose";

const connectDb = async () =>{
    try {
        await mongoose.connect(process.env.MONGODB_URL)
        console.log("Db connected");
    } catch (error) {
        console.error("Db connection error:", error.stack);
        process.exit(1);
    }
}

export default connectDb