const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product must have a name'],
    trim: true,
  },
  quantity: {
    type: Number,
    required: [true, 'Product must have a Quantity'],
    trim: true,
  },
  price: {
    type: Number,
    required: [true, 'Product must have a price'],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

productSchema.index({ name: 'text' });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;
