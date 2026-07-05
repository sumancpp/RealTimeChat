import webpush from "web-push";
import dotenv from "dotenv";
dotenv.config();

webpush.setVapidDetails(
    'mailto:sumancoder404@gmail.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

export default webpush;
