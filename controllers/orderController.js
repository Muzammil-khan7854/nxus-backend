const Order = require('../models/Order');
const mongoose = require('mongoose');

// In-memory array for orders when database is offline
let localOrders = [
  {
    id: 'NXUS-1042',
    userId: 'guest',
    items: 'Air Force 1 · Size 9',
    itemsList: [
      { id: 'prod-hyperglide', name: 'Air Force 1', price: 5400, size: '9', qty: 1 }
    ],
    total: 5400,
    shippingDetails: {
      name: 'Rahul',
      email: 'rahul@gmail.com',
      phone: '+91 98765 43210',
      address: 'Sector 62, Noida',
      city: 'Noida',
      zip: '201301'
    },
    paymentMethod: 'COD',
    status: 'Pending',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString() // 2 hours ago
  },
  {
    id: 'NXUS-1041',
    userId: 'guest',
    items: 'Jordan 1 · Size 7',
    itemsList: [
      { id: 'prod-streetmatrix', name: 'Jordan 1', price: 6240, size: '7', qty: 1 }
    ],
    total: 6240,
    shippingDetails: {
      name: 'Priya',
      email: 'priya@gmail.com',
      phone: '+91 98765 54321',
      address: 'Koramangala 4th Block, Bangalore',
      city: 'Bangalore',
      zip: '560034'
    },
    paymentMethod: 'Card',
    status: 'Shipped',
    createdAt: new Date(Date.now() - 5 * 3600000).toISOString() // 5 hours ago
  },
  {
    id: 'NXUS-1040',
    userId: 'guest',
    items: 'Yeezy 350 · Size 10',
    itemsList: [
      { id: 'prod-neonx', name: 'Yeezy 350', price: 9500, size: '10', qty: 1 }
    ],
    total: 9500,
    shippingDetails: {
      name: 'Aditya',
      email: 'aditya@gmail.com',
      phone: '+91 99999 88888',
      address: 'Bandra West, Mumbai',
      city: 'Mumbai',
      zip: '400050'
    },
    paymentMethod: 'Card',
    status: 'Delivered',
    createdAt: new Date(Date.now() - 24 * 3600000).toISOString() // 1 day ago
  },
  {
    id: 'NXUS-1039',
    userId: 'guest',
    items: 'Nike SB · Size 6',
    itemsList: [
      { id: 'prod-voltrunner', name: 'Nike SB', price: 2800, size: '6', qty: 1 }
    ],
    total: 2800,
    shippingDetails: {
      name: 'Sneha',
      email: 'sneha@gmail.com',
      phone: '+91 88888 77777',
      address: 'Salt Lake City, Kolkata',
      city: 'Kolkata',
      zip: '700091'
    },
    paymentMethod: 'COD',
    status: 'Pending',
    createdAt: new Date(Date.now() - 36 * 3600000).toISOString() // 1.5 days ago
  }
];

// @desc    Create a new order
// @route   POST /api/orders
const createOrder = async (req, res, next) => {
  const { total, items, itemsList, shippingDetails, paymentMethod } = req.body;

  try {
    // Generate a unique transaction order code
    const orderId = 'NXUS-' + Date.now().toString().substr(-6) + '-' + Math.floor(100 + Math.random() * 900);

    const orderData = {
      id: orderId,
      userId: req.user ? (req.user._id || req.user.id) : 'guest',
      items,
      itemsList,
      total,
      shippingDetails,
      paymentMethod,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    // Always push into local list first for safety
    localOrders.unshift(orderData);

    // Save in database if online
    if (mongoose.connection.readyState === 1) {
      try {
        const order = new Order(orderData);
        await order.save();
      } catch (dbErr) {
        console.error('Failed to save order in MongoDB, kept in local memory:', dbErr.message);
      }
    }

    res.status(201).json({ success: true, order: orderData });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
const getOrders = async (req, res, next) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.warn('Database is offline, serving orders from memory registry.');
      return res.json({ success: true, count: localOrders.length, orders: localOrders });
    }
    const dbOrders = await Order.find({});
    // Merge any newer in-memory orders that aren't saved in the DB
    const mergedOrders = [...localOrders];
    for (const dbo of dbOrders) {
      if (!mergedOrders.some(lo => lo.id === dbo.id)) {
        mergedOrders.push(dbo);
      }
    }
    res.json({ success: true, count: mergedOrders.length, orders: mergedOrders });
  } catch (error) {
    console.error('getOrders DB error, serving from memory:', error.message);
    res.json({ success: true, count: localOrders.length, orders: localOrders });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/my-orders
const getUserOrders = async (req, res, next) => {
  try {
    const userId = req.user ? (req.user._id || req.user.id).toString() : 'guest';
    
    if (mongoose.connection.readyState !== 1) {
      const filtered = localOrders.filter(o => o.userId === userId);
      return res.json({ success: true, count: filtered.length, orders: filtered });
    }

    const dbOrders = await Order.find({ userId });
    const userLocal = localOrders.filter(o => o.userId === userId);
    const merged = [...userLocal];
    for (const dbo of dbOrders) {
      if (!merged.some(lo => lo.id === dbo.id)) {
        merged.push(dbo);
      }
    }
    res.json({ success: true, count: merged.length, orders: merged });
  } catch (error) {
    res.json({ success: true, count: 0, orders: [] });
  }
};

// @desc    Update order status (Admin only)
// @route   PUT /api/orders/:id/status
const updateOrderStatus = async (req, res, next) => {
  const { status } = req.body;
  const orderId = req.params.id;

  try {
    // 1. Update in-memory first
    const idx = localOrders.findIndex(o => o.id === orderId);
    if (idx !== -1) {
      localOrders[idx].status = status;
    }

    // 2. Try DB update if connected
    let updatedDb = false;
    if (mongoose.connection.readyState === 1) {
      const order = await Order.findOne({ id: orderId });
      if (order) {
        order.status = status;
        await order.save();
        updatedDb = true;
      }
    }

    if (idx !== -1 || updatedDb) {
      res.json({ 
        success: true, 
        order: idx !== -1 ? localOrders[idx] : { id: orderId, status } 
      });
    } else {
      res.status(404).json({ success: false, message: 'Order not found' });
    }
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getUserOrders,
  updateOrderStatus
};
