const dns = require('dns');
// Set public DNS servers to resolve MongoDB SRV records (fixes querySrv ECONNREFUSED)
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (err) {
  console.warn('Warning: Could not set custom DNS servers:', err.message);
}

// Force Node.js to prefer IPv4 DNS resolution first
if (typeof dns.setDefaultResultOrder === 'function') {
  dns.setDefaultResultOrder('ipv4first');
}

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

const app = express();

// Connect to MongoDB
connectDB();

// CORS setups - Strict security for production
const allowedOrigins = [
  'http://localhost:3000', // For local development
  'https://nxus-shoes.vercel.app' // Your live frontend URL
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin: ' + origin;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Body parser middleware
app.use(express.json({ limit: '50mb' })); // Support base64 image uploads up to 50MB
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Robots.txt direct responder for backend
app.get('/robots.txt', (req, res) => {
  res.sendFile(require('path').join(__dirname, 'robots.txt'));
});

// Root check endpoint
app.get('/', (req, res) => {
  res.json({ success: true, message: 'NXUS Feetwear Fullstack API is running.' });
});

// Declared API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// Page Routing Not Found Handlers
app.use(notFound);

// Failsafe Global Exception Error Handler to avoid Node process crashes
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  });
}

// Export the app for Vercel Serverless
module.exports = app;
