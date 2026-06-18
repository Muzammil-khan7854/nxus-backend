const mongoose = require('mongoose');

const SpecSchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: String, required: true }
}, { _id: false });

const ReviewSchema = new mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  text: { type: String, required: true },
  date: { type: String, default: () => new Date().toLocaleDateString('en-US') }
}, { _id: false });

const ProductSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  brand: {
    type: String,
    default: 'NXUS'
  },
  category: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    enum: ['men', 'women', 'kids', 'unisex'],
    default: 'unisex'
  },
  price: {
    type: Number,
    required: true
  },
  salePrice: {
    type: Number,
    default: null
  },
  images: {
    type: [String],
    default: []
  },
  badge: {
    type: String,
    default: ''
  },
  badgeClass: {
    type: String,
    default: 'new'
  },
  desc: {
    type: String,
    default: ''
  },
  longDesc: {
    type: String,
    default: ''
  },
  specs: {
    type: [SpecSchema],
    default: []
  },
  sizes: {
    type: [mongoose.Schema.Types.Mixed], // numbers or strings like "S", "M"
    default: []
  },
  availableSizes: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  },
  colors: {
    type: [String],
    default: []
  },
  availableColors: {
    type: [String],
    default: []
  },
  returnPolicy: {
    type: String,
    default: '7 Days'
  },
  codAvailable: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 4.5
  },
  reviewCount: {
    type: Number,
    default: 0
  },
  reviews: {
    type: [ReviewSchema],
    default: []
  },
  isSaleActive: {
    type: Boolean,
    default: false
  },
  saleLabel: {
    type: String,
    default: ''
  },
  saleStart: {
    type: Date,
    default: null
  },
  saleEnd: {
    type: Date,
    default: null
  },
  metaTitle: {
    type: String,
    default: ''
  },
  isWhitelisted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', ProductSchema);
