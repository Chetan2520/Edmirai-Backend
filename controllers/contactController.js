const nodemailer = require('nodemailer');
const Contact = require('../models/Contact');
require('dotenv').config();

// 1. UPDATED TRANSPORTER CONFIGURATION:
// Use explicit host/port for better stability and security with Gmail (SSL/TLS)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com', // Gmail SMTP Host
  port: 465,             // Secure port for SSL
  secure: true,          // Use SSL/TLS
  auth: {
    user: process.env.SMTP_USER, // Your full Gmail address
    pass: process.env.SMTP_PASS  // MUST be the 16-digit App Password
  }
});

// Startup pe SMTP verify
transporter.verify((error, success) => {
  if (error) {
    // If this fails, check SMTP_USER and SMTP_PASS (App Password) in .env
    console.error('❌ SMTP CONFIG ERROR:', error.message);
  } else {
    console.log('✅ SMTP ready for Gmail emails!');
  }
});

const sendContactEmail = async (req, res) => {
  try {
    const { name, phone, board, grade } = req.body;

    // Basic validation
    if (!name || !phone || !board || !grade) {
      return res.status(400).json({ message: 'All fields are required!' });
    }

    // DB mein save karo
    // Assuming Contact model and MongoDB connection are set up correctly
    const newContact = new Contact({ name, phone, board, grade });
    await newContact.save();
    console.log('Enquiry saved to DB:', newContact._id);

    // Email bhejo – to: ADMIN_EMAIL ya fallback SMTP_USER
    const adminEmail =  process.env.SMTP_USER; 
    const mailOptions = {
      from: `"Contact Form" <${process.env.SMTP_USER}>`, 
      to: adminEmail, 
      subject: `New Student Enquiry: ${name} wants to join!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #dc2626; text-align: center;">🔔 New Contact Form Submission</h2>
          <p style="font-size: 16px; color: #333;">A new student has submitted an Enquiry. Here's the details:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr><td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Name:</td><td style="padding: 10px; border: 1px solid #eee;">${name}</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Phone:</td><td style="padding: 10px; border: 1px solid #eee;">${phone}</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Board:</td><td style="padding: 10px; border: 1px solid #eee;">${board}</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Grade:</td><td style="padding: 10px; border: 1px solid #eee;">${grade}</td></tr>
          </table>
          <hr style="border: 1px solid #ccc;">
          <p style="font-size: 12px; color: #666; text-align: center;">This is an automated notification from your EdmireAI contact form.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to: ${adminEmail}`);

    res.status(200).json({ message: 'Enquiry submitted successfully! We’ll get back to you soon.' });

  } catch (error) {
    // IMPORTANT: Log the full error to the console for detailed debugging
    console.error('🔴 CRITICAL ERROR in sendContactEmail:', error.message, error);
    
    // Check for common auth errors and return a user-friendly message
    let userMessage = 'Failed to send Enquiry. Please check server logs for SMTP errors.';
    
    if (error.message.includes('authentication')) {
        userMessage = 'Authentication failed. Please verify the 16-digit App Password in the .env file.';
    }
console.error('🔴 CRITICAL ERROR in sendContactEmail:', error.message, error);
    res.status(500).json({ message: userMessage });
  }
};

module.exports = { sendContactEmail };