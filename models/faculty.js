const mongoose = require('mongoose');

const facultySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true // Ensure no duplicate applications via email
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  appliedAt: {
    type: Date,
    default: Date.now
  }
});

const Faculty = mongoose.model('Faculty', facultySchema);
module.exports = Faculty;