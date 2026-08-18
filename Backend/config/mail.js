import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

const transporter = {
    sendMail: async (options) => {
        if (!resend) {
            console.warn("RESEND_API_KEY is not configured in environment variables.");
            return { id: "skipped" };
        }
        // Resend's free tier requires you to use onboarding@resend.dev as the sender.
        // It also ONLY allows you to send emails to the email address you used to sign up for Resend!
        const { data, error } = await resend.emails.send({
            from: "onboarding@resend.dev",
            to: options.to,
            subject: options.subject,
            html: options.html,
            text: options.text,
        });

        if (error) {
            console.error("Resend API Error:", error);
            throw new Error(error.message);
        }
        
        return data;
    }
};

export default transporter;