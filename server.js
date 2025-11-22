const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const contactRoutes  = require('./routes/contact');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors({ origin: 'http://localhost:5173' })); // Frontend URL adjust karo (production mein)
app.use(express.json()); // JSON bodies parse karne ke liye
app.use(express.urlencoded({ extended: true })); // URL-encoded bodies ke liye

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected successfully!'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api', contactRoutes);

// Health check route (test ke liye)
app.get('/', (req, res) => {
  res.json({ message: 'Backend is running smoothly!' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong! Try again later.' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});