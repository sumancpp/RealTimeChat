import webpush from "web-push";
import dotenv from "dotenv";
dotenv.config();

if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
    try {
        const pubKey = process.env.VAPID_PUBLIC_KEY.trim().replace(/=+$/, '');
        const privKey = process.env.VAPID_PRIVATE_KEY.trim().replace(/=+$/, '');
        webpush.setVapidDetails(
            'mailto:sumancoder404@gmail.com',
            pubKey,
            privKey
        );
    } catch (error) {
        console.warn("WARNING: Invalid VAPID keys format:", error.message);
    }
} else {
    console.warn("WARNING: VAPID keys are missing in environment variables. Web Push Notifications will be disabled.");
}

export default webpush;
