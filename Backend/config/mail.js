import nodemailer from "nodemailer";
import dns from "dns";

// Force IPv4 resolution to prevent IPv6 ENETUNREACH errors on cloud providers like Render
dns.setDefaultResultOrder("ipv4first");

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    // This is the correct way to force IPv4 in Node 18+ for tls.connect
    family: 4, 
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000
});

export default transporter;