const errorHandler = (err, req, res, next) => {
  console.error("Unhandled Exception Caught:", err.stack || err.message);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message;

  // Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    statusCode = 404;
    message = 'Resource not found';
  }

  // Mongoose ValidationError
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors).map(val => val.message).join(', ');
  }

  // Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    statusCode = 400;
    message = 'Duplicate field value entered. A resource already exists with this key.';
  }

  res.status(statusCode).json({
    success: false,
    message: message || 'An unexpected server error occurred',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

const notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

module.exports = { errorHandler, notFound };
