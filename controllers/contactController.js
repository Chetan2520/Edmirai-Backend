const nodemailer = require('nodemailer');
const Contact = require('../models/Contact');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Startup pe SMTP verify
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP config error:', error);
  } else {
    console.log('SMTP ready for Gmail emails!');
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
    const newContact = new Contact({ name, phone, board, grade });
    await newContact.save();
    console.log('Inquiry saved to DB:', newContact._id);

    // Email bhejo – to: ADMIN_EMAIL ya fallback SMTP_USER (tumhare main email pe)
    const adminEmail = process.env.ADMIN_EMAIL || process.env.SMTP_USER;  // Yeh key change: Tumhare email pe hi jaayega!
    const mailOptions = {
      from: `"Contact Form" <${process.env.SMTP_USER}>`,  // From: Tumhara email, lekin friendly name se
      to: adminEmail,  // Tumhare email pe (jo .env mein add kiya)
      subject: `New Student Inquiry: ${name} wants to join!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <h2 style="color: #dc2626; text-align: center;">🔔 New Contact Form Submission</h2>
          <p style="font-size: 16px; color: #333;">A new student has submitted an inquiry. Here's the details:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr><td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Name:</td><td style="padding: 10px; border: 1px solid #eee;">${name}</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Phone:</td><td style="padding: 10px; border: 1px solid #eee;">${phone}</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Board:</td><td style="padding: 10px; border: 1px solid #eee;">${board}</td></tr>
            <tr><td style="padding: 10px; border: 1px solid #eee; font-weight: bold;">Grade:</td><td style="padding: 10px; border: 1px solid #eee;">${grade}</td></tr>
          </table>
          <hr style="border: 1px solid #ccc;">
          <p style="font-size: 12px; color: #666; text-align: center;">This is an automated notification from your EdmireAI contact form. Reply to this email to connect with the student.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to: ${adminEmail}`);

    res.status(200).json({ message: 'Inquiry submitted successfully! We’ll get back to you soon.' });

  } catch (error) {
    console.error('Error in sendContactEmail:', error);
    res.status(500).json({ message: 'Failed to send inquiry. Please try again later.' });
  }
};

module.exports = { sendContactEmail };