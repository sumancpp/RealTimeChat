import webpush from "web-push";
import dotenv from "dotenv";
import User from "../models/user.model.js";
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

export const sendPushNotificationToUser = async (userOrUserId, payload) => {
    try {
        const user = (typeof userOrUserId === 'object' && userOrUserId?.pushSubscriptions)
            ? userOrUserId
            : await User.findById(userOrUserId);

        if (!user || !user.pushSubscriptions || user.pushSubscriptions.length === 0) {
            return;
        }

        const notificationPayload = typeof payload === 'string' ? payload : JSON.stringify(payload);

        await Promise.all(
            user.pushSubscriptions.map(async (sub) => {
                try {
                    await webpush.sendNotification(sub, notificationPayload);
                } catch (err) {
                    // HTTP 410 (Gone) or HTTP 404 (Not Found) indicates the push subscription has unsubscribed or expired
                    if (err.statusCode === 410 || err.statusCode === 404) {
                        const targetEndpoint = sub?.endpoint || (typeof sub === 'string' ? sub : null);
                        console.warn(`[WebPush] Subscription expired or unsubscribed (HTTP ${err.statusCode}). Removing endpoint from DB.`);
                        if (targetEndpoint) {
                            await User.findByIdAndUpdate(user._id, {
                                $pull: {
                                    pushSubscriptions: { endpoint: targetEndpoint }
                                }
                            }).catch(e => console.error("[WebPush] Failed to remove expired endpoint:", e.message));

                            await User.findByIdAndUpdate(user._id, {
                                $pull: {
                                    pushSubscriptions: targetEndpoint
                                }
                            }).catch(() => {});
                        }
                    } else {
                        console.error("[WebPush] Push notification send error:", err.message || err);
                    }
                }
            })
        );
    } catch (err) {
        console.error("[WebPush] Helper error:", err.message || err);
    }
};

export default webpush;
