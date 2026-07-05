import webpush from "web-push";
import dotenv from "dotenv";
dotenv.config();

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(
        'mailto:sumancoder404@gmail.com',
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
    );
} else {
    console.warn("WARNING: VAPID keys are missing in environment variables. Web Push Notifications will be disabled.");
}

export default webpush;
