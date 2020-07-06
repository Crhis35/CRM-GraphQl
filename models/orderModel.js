const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const orderSchema = new mongoose.Schema({
  order: {
    type: Array,
    required: [true, 'Orde must have products'],
    trim: true,
  },
  total: {
    type: Number,
    required: [true, 'Orde must have total'],
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Orde must have a client'],
    ref: 'Client',
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    required: [true, 'Orde must have a seller'],
    ref: 'User',
  },
  status: {
    type: String,
    enum: {
      values: ['Waiting', 'Succesfully', 'Cancel'],
      default: 'Waiting',
      message: 'Status must be Waiting, Succesfully or Cancel ',
      required: [true, 'Order must have a status'],
    },
  },
  createAt: {
    type: Date,
    default: Date.now(),
  },
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
