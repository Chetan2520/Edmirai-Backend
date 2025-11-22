const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true  // Extra spaces remove karega
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  board: {
    type: String,
    required: true,
    enum: ['CBSE', 'ICSE', 'State Board', 'IB', 'IGCSE']  // Valid boards only
  },
  grade: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true  // createdAt aur updatedAt auto add karega
});

module.exports = mongoose.model('Contact', contactSchema);