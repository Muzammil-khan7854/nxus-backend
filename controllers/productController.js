const Product = require('../models/Product');
const mongoose = require('mongoose');

// Default initial products array with scaled Indian Rupee (₹) pricing
const defaultProductsList = [
  {
    id: 'prod-hyperglide',
    name: 'NXUS HyperGlide Pro',
    brand: 'NXUS',
    category: 'athletic',
    gender: 'men',
    price: 15600.00,
    salePrice: null,
    images: [
      'assets/shoe_athletic.png',
      'assets/shoe.png',
      'assets/hero_shoe.png',
      'assets/shoe_minimal.png'
    ],
    badge: 'NEW',
    badgeClass: 'new',
    desc: 'Neon Orange / Velocity White',
    longDesc: 'The HyperGlide Pro is engineered for elite runners who demand the absolute best.',
    specs: [
      { label: 'Upper', value: 'AeroKnit Monofilament' },
      { label: 'Midsole', value: 'Nitrogen EVA Foam' },
      { label: 'Plate', value: 'Carbon Flux Shank' },
      { label: 'Weight', value: '240g (US 10)' },
      { label: 'Drop', value: '6mm' }
    ],
    sizes: [6, 7, 8, 9, 10, 11, 12, 13],
    availableSizes: [6, 7, 8, 9, 10, 11, 12, 13],
    colors: ['Solar Orange', 'Vapor Blue'],
    availableColors: ['Solar Orange', 'Vapor Blue'],
    returnPolicy: '7 Days',
    codAvailable: true,
    reviews: [],
    rating: 4.8,
    reviewCount: 342
  },
  {
    id: 'prod-streetmatrix',
    name: 'NXUS StreetMatrix Urban',
    brand: 'NXUS',
    category: 'lifestyle',
    gender: 'men',
    price: 12800.00,
    salePrice: null,
    images: [
      'assets/shoe_lifestyle.png',
      'assets/shoe_minimal.png',
      'assets/shoe.png',
      'assets/shoe_athletic.png'
    ],
    badge: 'HOT',
    badgeClass: 'hot',
    desc: 'Beige Cream / Minimal Gold',
    longDesc: 'Where street culture meets premium craft.',
    specs: [
      { label: 'Upper', value: 'Premium Full-Grain Leather' },
      { label: 'Lining', value: 'Moisture-Wicking Mesh' },
      { label: 'Midsole', value: 'Crepe-Inspired EVA' },
      { label: 'Outsole', value: 'Herringbone Rubber' },
      { label: 'Weight', value: '310g (US 10)' }
    ],
    sizes: [7, 8, 9, 10, 11, 12],
    availableSizes: [7, 8, 9, 10, 11, 12],
    colors: ['Vapor Grey', 'Solar Orange'],
    availableColors: ['Vapor Grey', 'Solar Orange'],
    rating: 4.6,
    reviewCount: 218
  },
  {
    id: 'prod-neonx',
    name: 'NXUS NeonX Limited',
    brand: 'NXUS',
    category: 'cyberpunk',
    gender: 'men',
    price: 17600.00,
    salePrice: null,
    images: [
      'assets/shoe_cyber.png',
      'assets/shoe_athletic.png',
      'assets/hero_shoe.png',
      'assets/shoe.png'
    ],
    badge: 'LIMITED',
    badgeClass: 'limited',
    desc: 'Techwear Matte Black / Ultraviolet',
    longDesc: 'A tactical silhouette born from the neon-lit streets.',
    specs: [
      { label: 'Upper', value: 'Carbon Polymer + Techwear Panels' },
      { label: 'Closure', value: 'Smart-Tension Elastic Maps' },
      { label: 'Midsole', value: 'Dampening Air Gel' },
      { label: 'Outsole', value: 'Tactical Grip Rubber' },
      { label: 'Special', value: 'UV-Reactive Accent Strip' }
    ],
    sizes: [8, 9, 10, 11, 12],
    availableSizes: [8, 9, 10, 11, 12],
    colors: ['Vapor Blue', 'Volt Green'],
    availableColors: ['Vapor Blue', 'Volt Green'],
    rating: 4.9,
    reviewCount: 89
  },
  {
    id: 'prod-monoshift',
    name: 'NXUS MonoShift Clean',
    brand: 'NXUS',
    category: 'minimalist',
    gender: 'men',
    price: 12000.00,
    salePrice: null,
    images: [
      'assets/shoe_minimal.png',
      'assets/shoe_lifestyle.png',
      'assets/shoe.png',
      'assets/shoe_athletic.png'
    ],
    badge: 'ESSENTIAL',
    badgeClass: 'new',
    desc: 'Clean Vapor Grey / Premium Leather',
    longDesc: 'Absolute minimalism, maximum comfort.',
    specs: [
      { label: 'Upper', value: 'Nappa Grain Leather' },
      { label: 'Lining', value: 'Natural Cotton Canvas' },
      { label: 'Midsole', value: 'Comfort Foam Block' },
      { label: 'Outsole', value: 'Clean-Edge Cup Sole' },
      { label: 'Weight', value: '285g (US 10)' }
    ],
    sizes: [7, 8, 9, 10, 11, 12, 13],
    availableSizes: [7, 8, 9, 10, 11, 12, 13],
    colors: ['Vapor Grey', 'Vapor Blue'],
    availableColors: ['Vapor Grey', 'Vapor Blue'],
    rating: 4.7,
    reviewCount: 176
  },
  {
    id: 'prod-voltrunner',
    name: 'NXUS VoltRunner X',
    brand: 'NXUS',
    category: 'athletic',
    gender: 'men',
    price: 14000.00,
    salePrice: 10320.00,
    images: [
      'assets/shoe.png',
      'assets/shoe_athletic.png',
      'assets/hero_shoe.png',
      'assets/shoe_minimal.png'
    ],
    badge: 'SALE',
    badgeClass: 'hot',
    desc: 'Electric Blue / Volt Sole',
    longDesc: 'The VoltRunner X is our flagship training shoe.',
    specs: [
      { label: 'Upper', value: 'Dual-Layer Training Mesh' },
      { label: 'Midsole', value: 'High-Rebound Compound' },
      { label: 'Heel Counter', value: 'Rigid TPU Exoskeleton' },
      { label: 'Outsole', value: 'Zonal Flex Rubber' },
      { label: 'Weight', value: '255g (US 10)' }
    ],
    sizes: [7, 8, 9, 10, 11, 12],
    availableSizes: [7, 8, 9, 10, 11, 12],
    colors: ['Volt Green', 'Solar Orange'],
    availableColors: ['Volt Green', 'Solar Orange'],
    rating: 4.5,
    reviewCount: 203
  },
  {
    id: 'prod-aurasoft',
    name: 'NXUS AuraSoft Runner',
    brand: 'NXUS',
    category: 'athletic',
    gender: 'women',
    price: 14800.00,
    salePrice: null,
    images: [
      'assets/shoe_women.png',
      'assets/shoe_minimal.png',
      'assets/shoe_lifestyle.png',
      'assets/shoe_women2.png'
    ],
    badge: 'NEW',
    badgeClass: 'new',
    desc: 'Rose Gold / Pearl White Knit',
    longDesc: 'Designed with the female athlete in mind.',
    specs: [
      { label: 'Upper', value: 'Recycled Stretch Knit' },
      { label: 'Midsole', value: 'Soft-Tune EVA+ Foam' },
      { label: 'Fit', value: 'Female Anatomic Last' },
      { label: 'Outsole', value: 'Flex-Point Rubber' },
      { label: 'Weight', value: '195g (US 7)' }
    ],
    sizes: [5, 6, 7, 8, 9, 10, 11],
    availableSizes: [5, 6, 7, 8, 9, 10, 11],
    colors: ['Rose Gold', 'Vapor Grey'],
    availableColors: ['Rose Gold', 'Vapor Grey'],
    rating: 4.8,
    reviewCount: 284
  },
  {
    id: 'prod-velvetrun',
    name: 'NXUS VelvetRun Luxe',
    brand: 'NXUS',
    category: 'lifestyle',
    gender: 'women',
    price: 16800.00,
    salePrice: null,
    images: [
      'assets/shoe_women2.png',
      'assets/shoe_women.png',
      'assets/shoe_lifestyle.png',
      'assets/shoe_minimal.png'
    ],
    badge: 'LUXE',
    badgeClass: 'limited',
    desc: 'Ivory White / 24K Gold Platform',
    longDesc: 'Luxury meets performance.',
    specs: [
      { label: 'Upper', value: 'Italian Microsuede' },
      { label: 'Trim', value: 'Hand-Stitched Gold Detail' },
      { label: 'Platform', value: '35mm Comfort Wedge' },
      { label: 'Insole', value: 'Memory Foam Footbed' },
      { label: 'Weight', value: '310g (US 7)' }
    ],
    sizes: [5, 6, 7, 8, 9, 10],
    availableSizes: [5, 6, 7, 8, 9, 10],
    colors: ['Rose Gold', 'Vapor Grey'],
    availableColors: ['Rose Gold', 'Vapor Grey'],
    rating: 4.7,
    reviewCount: 127
  },
  {
    id: 'prod-zenflow',
    name: 'NXUS ZenFlow Slide',
    brand: 'NXUS',
    category: 'minimalist',
    gender: 'women',
    price: 7600.00,
    salePrice: 5520.00,
    images: [
      'assets/shoe_lifestyle.png',
      'assets/shoe_women.png',
      'assets/shoe_minimal.png',
      'assets/shoe_women2.png'
    ],
    badge: 'SALE',
    badgeClass: 'hot',
    desc: 'Sand Beige / Natural Jute',
    longDesc: 'A minimalist slip-on built for the modern woman.',
    specs: [
      { label: 'Upper', value: 'Canvas + Jute Lining' },
      { label: 'Insole', value: 'Cloud-Soft Footbed' },
      { label: 'Closure', value: 'Slip-On (Elastic Gore)' },
      { label: 'Outsole', value: 'Flexible Rubber' },
      { label: 'Weight', value: '160g (US 7)' }
    ],
    sizes: [5, 6, 7, 8, 9, 10, 11],
    availableSizes: [5, 6, 7, 8, 9, 10, 11],
    colors: ['Vapor Grey', 'Rose Gold'],
    availableColors: ['Vapor Grey', 'Rose Gold'],
    rating: 4.4,
    reviewCount: 196
  },
  {
    id: 'prod-prismkid',
    name: 'NXUS PrismKid Spark',
    brand: 'NXUS',
    category: 'athletic',
    gender: 'kids',
    price: 6320.00,
    salePrice: null,
    images: [
      'assets/shoe_kids.png',
      'assets/shoe_athletic.png',
      'assets/shoe.png',
      'assets/shoe_minimal.png'
    ],
    badge: 'KIDS',
    badgeClass: 'new',
    desc: 'Vivid Blue / Sunrise Yellow Velcro',
    longDesc: 'Built for active kids who never stop moving.',
    specs: [
      { label: 'Upper', value: 'Reinforced Synthetic Mesh' },
      { label: 'Closure', value: 'Dual Velcro Straps' },
      { label: 'Feature', value: 'LED Light-Up Outsole' },
      { label: 'Care', value: 'Machine Washable' },
      { label: 'Age Range', value: '4–10 years' }
    ],
    sizes: [10, 11, 12, 13, 1, 2, 3, 4, 5],
    availableSizes: [10, 11, 12, 13, 1, 2, 3, 4, 5],
    colors: ['Vapor Blue', 'Volt Green'],
    availableColors: ['Vapor Blue', 'Volt Green'],
    rating: 4.9,
    reviewCount: 412
  },
  {
    id: 'prod-boltkid',
    name: 'NXUS BoltKid Runner',
    brand: 'NXUS',
    category: 'athletic',
    gender: 'kids',
    price: 5520.00,
    salePrice: null,
    images: [
      'assets/shoe_kids.png',
      'assets/shoe_athletic.png',
      'assets/shoe_minimal.png',
      'assets/shoe.png'
    ],
    badge: 'FUN',
    badgeClass: 'hot',
    desc: 'Speed Red / Electric White',
    longDesc: 'Speed is the name of the game.',
    specs: [
      { label: 'Upper', value: 'Breathable Athletic Mesh' },
      { label: 'Closure', value: 'Quick-Lace Toggle' },
      { label: 'Midsole', value: 'Cushion-Plus Foam' },
      { label: 'Outsole', value: 'Non-Marking Rubber' },
      { label: 'Age Range', value: '6–14 years' }
    ],
    sizes: [1, 2, 3, 4, 5, 6, 7],
    availableSizes: [1, 2, 3, 4, 5, 6, 7],
    colors: ['Solar Orange', 'Volt Green'],
    availableColors: ['Solar Orange', 'Volt Green'],
    rating: 4.7,
    reviewCount: 231
  },
  {
    id: 'prod-lacekit',
    name: 'NXUS LaceKit Elite',
    brand: 'NXUS',
    category: 'accessories',
    gender: 'unisex',
    price: 1920.00,
    salePrice: null,
    images: [
      'assets/shoe_accessories.png'
    ],
    badge: 'ACC',
    badgeClass: 'new',
    desc: 'Neon / Neutral / Volt — 3 pairs',
    longDesc: 'Upgrade your look with NXUS LaceKit Elite.',
    specs: [
      { label: 'Material', value: 'Waxed Polyester-Cotton' },
      { label: 'Aglets', value: 'Brushed Metal' },
      { label: 'Lengths', value: '45", 54", 63"' },
      { label: 'Pairs', value: '3 pairs per pack' },
      { label: 'Type', value: 'Flat Waxed' }
    ],
    sizes: ['One Size'],
    availableSizes: ['One Size'],
    colors: ['Solar Orange', 'Volt Green', 'Vapor Blue'],
    availableColors: ['Solar Orange', 'Volt Green', 'Vapor Blue'],
    rating: 4.6,
    reviewCount: 88
  },
  {
    id: 'prod-orthoinsole',
    name: 'NXUS OrthoInsole Max',
    brand: 'NXUS',
    category: 'accessories',
    gender: 'unisex',
    price: 3600.00,
    salePrice: 2560.00,
    images: [
      'assets/shoe_accessories.png'
    ],
    badge: 'SALE',
    badgeClass: 'hot',
    desc: 'Orthopedic Arch Support Insole',
    longDesc: 'The OrthoInsole Max is designed by podiatrists.',
    specs: [
      { label: 'Construction', value: 'Tri-Layer (Foam/Gel/Support)' },
      { label: 'Arch Support', value: 'High Orthopedic Grade' },
      { label: 'Compatibility', value: 'All NXUS Models' },
      { label: 'Sizes', value: 'S / M / L / XL' },
      { label: 'Warranty', value: '12 Months' }
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    availableSizes: ['S', 'M', 'L', 'XL'],
    colors: ['Vapor Grey'],
    availableColors: ['Vapor Grey'],
    rating: 4.8,
    reviewCount: 143
  }
];

// Local products array for in-memory operations in case database connection fails
let localProducts = [...defaultProductsList];

// @desc    Get all products
// @route   GET /api/products
const getProducts = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.warn('Database is offline, serving products from memory catalog.');
      return res.json({ success: true, count: localProducts.length, products: localProducts });
    }
    const dbProducts = await Product.find({});
    // Sync local changes to DB view if necessary, or just serve DB values
    res.json({ success: true, count: dbProducts.length, products: dbProducts });
  } catch (error) {
    console.error('getProducts DB error, serving from memory:', error.message);
    res.json({ success: true, count: localProducts.length, products: localProducts });
  }
};

// @desc    Get single product by custom ID
// @route   GET /api/products/:id
const getProductById = async (req, res, next) => {
  const { id } = req.params;
  try {
    if (mongoose.connection.readyState !== 1) {
      const prod = localProducts.find(p => p.id === id);
      if (prod) {
        return res.json({ success: true, product: prod });
      }
      return res.status(404).json({ success: false, message: 'Product not found (Offline Mode)' });
    }
    const product = await Product.findOne({ id });
    if (!product) {
      // Try local memory before giving up
      const prod = localProducts.find(p => p.id === id);
      if (prod) {
        return res.json({ success: true, product: prod });
      }
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    console.error('getProductById DB error, searching memory:', error.message);
    const prod = localProducts.find(p => p.id === id);
    if (prod) {
      return res.json({ success: true, product: prod });
    }
    res.status(404).json({ success: false, message: 'Product not found' });
  }
};

// @desc    Create a product (Admin only)
// @route   POST /api/products
const createProduct = async (req, res, next) => {
  const {
    id, name, brand, category, gender, price, salePrice, images,
    badge, badgeClass, desc, longDesc, specs, sizes, colors,
    availableSizes, availableColors, returnPolicy, codAvailable,
    isSaleActive, saleLabel, saleStart, saleEnd, metaTitle, isWhitelisted
  } = req.body;

  try {
    // Check locally first
    const exists = localProducts.some(p => p.id === id);
    if (exists) {
      return res.status(400).json({ success: false, message: `Product ID '${id}' already exists` });
    }

    // Secondary strict validation to prevent invalid injections
    if (!name || !category || isNaN(price) || price <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid product details. Price must be > 0.' });
    }

    const newProductData = {
      id, name, brand: brand || 'NXUS', category, gender, price, salePrice,
      images: images || ['assets/shoe.png'],
      badge, badgeClass: badgeClass || 'new', desc, longDesc, 
      specs: specs || [
        { label: 'Upper', value: 'Premium Mesh' },
        { label: 'Midsole', value: 'Comfort EVA' },
        { label: 'Outsole', value: 'Durable Rubber' }
      ], 
      sizes: Array.isArray(sizes) ? sizes : String(sizes).split(',').map(s => parseFloat(s.trim())).filter(s => !isNaN(s)), 
      colors: Array.isArray(colors) ? colors : String(colors).split(',').map(c => c.trim()),
      availableSizes: availableSizes || (Array.isArray(sizes) ? sizes : String(sizes).split(',').map(s => parseFloat(s.trim())).filter(s => !isNaN(s))),
      availableColors: availableColors || (Array.isArray(colors) ? colors : String(colors).split(',').map(c => c.trim())),
      returnPolicy: returnPolicy || '7 Days', 
      codAvailable: codAvailable !== undefined ? codAvailable : true,
      isSaleActive: isSaleActive || (salePrice !== null), 
      saleLabel, saleStart, saleEnd, metaTitle, isWhitelisted,
      reviews: [],
      rating: 5.0,
      reviewCount: 0
    };

    // Push into local list
    localProducts.unshift(newProductData);

    // Try saving in MongoDB if online
    if (mongoose.connection.readyState === 1) {
      const product = new Product(newProductData);
      await product.save();
    }

    res.status(201).json({ success: true, product: newProductData });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an existing product (Admin only)
// @route   PUT /api/products/:id
const updateProduct = async (req, res, next) => {
  const { id } = req.params;
  try {
    // 1. Update in-memory first
    const idx = localProducts.findIndex(p => p.id === id);
    if (idx !== -1) {
      localProducts[idx] = { ...localProducts[idx], ...req.body };
    }

    // 2. Try DB update if connected
    if (mongoose.connection.readyState === 1) {
      const product = await Product.findOne({ id });
      if (product) {
        Object.assign(product, req.body);
        await product.save();
      }
    }

    if (idx !== -1) {
      res.json({ success: true, product: localProducts[idx] });
    } else {
      res.status(404).json({ success: false, message: 'Product not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product (Admin only)
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res, next) => {
  const { id } = req.params;
  try {
    // 1. Delete in-memory first
    const idx = localProducts.findIndex(p => p.id === id);
    if (idx !== -1) {
      localProducts.splice(idx, 1);
    }

    // 2. Try DB delete if connected
    let deletedFromDb = false;
    if (mongoose.connection.readyState === 1) {
      const result = await Product.deleteOne({ id });
      deletedFromDb = result.deletedCount > 0;
    }

    if (idx !== -1 || deletedFromDb) {
      res.json({ success: true, message: 'Product deleted successfully' });
    } else {
      res.status(404).json({ success: false, message: 'Product not found' });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Seed database with default products
// @route   POST /api/products/seed
const seedProducts = async (req, res, next) => {
  try {
    // Overwrite local memory
    localProducts = [...defaultProductsList];

    if (mongoose.connection.readyState !== 1) {
      return res.status(201).json({ success: true, message: 'Seeded in-memory catalog successfully (Offline Mode).' });
    }

    const count = await Product.countDocuments({});
    if (count > 0) {
      return res.status(400).json({ success: false, message: 'Database already has products, skipping database seeding' });
    }

    await Product.insertMany(defaultProductsList);
    res.status(201).json({ success: true, message: 'Seeded catalog successfully with default styles!' });
  } catch (error) {
    next(error);
  }
};

// @desc    Add review to a product
// @route   POST /api/products/:id/review
const addProductReview = async (req, res, next) => {
  const { rating, text } = req.body;
  const { id } = req.params;

  try {
    const review = {
      name: req.user ? req.user.name : 'Verified Buyer',
      rating: parseInt(rating),
      text: text,
      date: new Date().toLocaleDateString('en-IN')
    };

    // Update in-memory
    const idx = localProducts.findIndex(p => p.id === id);
    if (idx !== -1) {
      const p = localProducts[idx];
      p.reviews = p.reviews || [];
      p.reviews.push(review);
      const totalRating = p.reviews.reduce((sum, r) => sum + r.rating, 0);
      p.rating = parseFloat((totalRating / p.reviews.length).toFixed(1));
      p.reviewCount = p.reviews.length;
    }

    // Update DB
    if (mongoose.connection.readyState === 1) {
      const product = await Product.findOne({ id });
      if (product) {
        product.reviews.push(review);
        const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0);
        product.rating = parseFloat((totalRating / product.reviews.length).toFixed(1));
        product.reviewCount = product.reviews.length;
        await product.save();
      }
    }

    if (idx !== -1) {
      res.json({ success: true, product: localProducts[idx] });
    } else {
      res.status(404).json({ success: false, message: 'Product not found' });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  seedProducts,
  addProductReview
};
