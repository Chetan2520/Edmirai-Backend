const express = require('express');
const nodemailer = require('nodemailer');
const Faculty = require('../models/faculty'); // Model import
require('dotenv').config();

const router = express.Router();

// --- Nodemailer Setup (Gmail App Password Config) ---
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS // MUST be the 16-digit App Password
    }
});

// Optional: SMTP verification for debugging
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ SMTP CONFIG ERROR (Router Level):', error.message);
    } else {
        console.log('✅ Faculty SMTP ready in router!');
    }
});
// ----------------------------------------------------


// POST request to submit a faculty application
router.post('/apply', async (req, res) => {
    try {
        const { name, email, phone } = req.body;

        // Basic validation
        if (!name || !email || !phone) {
            return res.status(400).json({ message: 'All fields (name, email, phone) are required!' });
        }

        // 1. DB mein save karo
        const newApplicant = new Faculty({ name, email, phone });
        await newApplicant.save();
        console.log('Faculty application saved to DB:', newApplicant._id);

        // 2. Email bhejo
        const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;
        const mailOptions = {
            from: `"Faculty Application" <${process.env.SMTP_USER}>`,
            to: adminEmail,
            subject: `🧑‍🏫 NEW Faculty Application: ${name}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #075985; border-radius: 10px;">
                    <h2 style="color: #075985; text-align: center;">⭐ New Faculty Application Submitted ⭐</h2>
                    <p style="font-size: 16px; color: #333;">A new teaching candidate has applied. Please contact them ASAP.</p>
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                        <tr><td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Name:</td><td style="padding: 10px; border: 1px solid #eee;">${name}</td></tr>
                        <tr><td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Email:</td><td style="padding: 10px; border: 1px solid #eee;">${email}</td></tr>
                        <tr><td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Phone:</td><td style="padding: 10px; border: 1px solid #eee;">${phone}</td></tr>
                    </table>
                    <p style="font-size: 12px; color: #666; text-align: center;">Application ID: ${newApplicant._id}</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Faculty email sent successfully to: ${adminEmail}`);

        res.status(200).json({ message: 'Application submitted successfully! We will contact you within 24 hours.' });

    } catch (error) {
        console.error('🔴 CRITICAL ERROR in /apply route:', error.message, error);

        let userMessage = 'Failed to submit application. Please try again later.';

        if (error.code === 11000) { // MongoDB Duplicate Error Code (Email already exists)
            userMessage = 'This email has already been used for an application. We will contact you soon.';
        } else if (error.message.includes('authentication')) {
            userMessage = 'Server configuration error (Authentication failed).';
        }

        res.status(500).json({ message: userMessage });
    }
});

module.exports = router;