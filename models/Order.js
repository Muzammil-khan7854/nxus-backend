const mongoose = require('mongoose');

const OrderItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  size: { type: String, required: true },
  color: { type: String, default: '' },
  qty: { type: Number, required: true, default: 1 },
  filter: { type: String, default: '' }
}, { _id: false });

const OrderSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true
  },
  items: {
    type: String, // String representation e.g. "NXUS HyperGlide Pro (Size: 10, Qty: 1)" for backwards compatibility
    required: true
  },
  itemsList: {
    type: [OrderItemSchema],
    default: []
  },
  total: {
    type: Number,
    required: true
  },
  date: {
    type: String,
    default: () => new Date().toISOString()
  },
  status: {
    type: String,
    enum: ['Pending', 'Packaging', 'Shipping', 'Delivered'],
    default: 'Pending'
  },
  shippingDetails: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, default: 'US' }
  },
  paymentMethod: {
    type: String,
    enum: ['COD', 'Card'],
    default: 'COD'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', OrderSchema);
