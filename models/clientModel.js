const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'User must have a name'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'User must have a Lastname'],
    trim: true,
  },
  enterprise: {
    type: String,
    required: [true, 'User must have a Enterprise'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide your email'],
    trim: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  phone: {
    type: String,
    trim: true,
  },
  createAt: {
    type: Date,
    default: Date.now(),
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'User must have a Seller'],
    ref: 'User',
  },
});

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;
