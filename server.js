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

// CORS setups - allow any client for easy deployment testing (Render/Vercel)
app.use(cors());

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
