import nodemailer from "nodemailer";
import dns from "dns";

// Force IPv4 resolution to prevent IPv6 ENETUNREACH errors on cloud providers like Render
dns.setDefaultResultOrder("ipv4first");

const transporter =
    nodemailer.createTransport({

        service: "gmail",

        auth: {

            user:
                process.env.EMAIL_USER,

            pass:
                process.env.EMAIL_PASS

        }

    });

export default transporter;