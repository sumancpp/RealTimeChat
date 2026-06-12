import "dotenv/config";
import nodemailer from "nodemailer";
import dns from "dns";
dns.setDefaultResultOrder("ipv4first");

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function main() {
    try {
        console.log("Sending...");
        let info = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER, // send to self
            subject: "Test from Server",
            text: "Hello world!"
        });
        console.log("Success! Message ID: " + info.messageId);
    } catch(err) {
        console.error("Error: ", err.message);
    }
}
main();
