import mongoose from "mongoose";
import { mongoUrl } from "./Backend/config.js";
import User from "./Backend/models/user.model.js";

async function test() {
  await mongoose.connect(mongoUrl);
  const user = await User.findOne({ lockedChats: { $exists: true, $not: {$size: 0} } });
  if (!user) {
    console.log("No user has locked chats!");
    const anyUser = await User.findOne();
    if(anyUser) console.log("Users exist, but no locked chats.", anyUser.lockedChats);
  } else {
    console.log("Found user with locked chats!");
    console.log("User ID:", user._id);
    console.log("Locked Chats:", user.lockedChats);
  }
  process.exit();
}
test();
