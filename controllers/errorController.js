// For development mode

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stackTrace: err.stack,
    error: err
  });
};

// For production mode

const sendErrorProd = (err, res) => {
  // For operational errors - trusted error : send message to the client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  } else {
    // For programming errors, unknown errors - do not leak details to the client
    // 1.Log error
    console.log('ERROR !!!!!!!', err);

    // 2. send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong !'
    });
  }
};

module.exports = (err, req, res, next) => {
  // 500 - internal server error
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    sendErrorProd(err, res);
  }
};
