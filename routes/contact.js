const express = require('express');
const { sendContactEmail } = require('../controllers/contactController');

const router = express.Router();

// POST /api/contact – Form submit ke liye
router.post('/contact', sendContactEmail);

module.exports = router;