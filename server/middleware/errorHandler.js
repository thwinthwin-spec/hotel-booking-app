// Central error handler. Converts common library errors into clean JSON.
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error('[error]', err);

  // Bad ObjectId in a route parameter
  if (err.name === 'CastError') {
    return res.status(404).json({ message: `Resource not found: ${err.path}` });
  }

  // Duplicate key (unique index violation)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    return res.status(409).json({ message: `Duplicate value for ${field}` });
  }

  // Mongoose schema validation
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors || {}).map((item) => ({
      field: item.path,
      msg: item.message
    }));
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  // Multer upload problems
  if (err.name === 'MulterError') {
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }
  if (err.message === 'Only image files are allowed') {
    return res.status(400).json({ message: err.message });
  }

  const status = err.status || err.statusCode || 500;
  const response = { message: status === 500 ? 'Server error' : err.message };
  if (process.env.NODE_ENV === 'development') response.stack = err.stack;
  return res.status(status).json(response);
}

module.exports = errorHandler;
