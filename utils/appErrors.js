class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    // Nice way of using string method on a number
    // if status code starts with 4 then status is fail, else it is an error
    this.status = `{statusCode}`.startsWith('4') ? 'fail' : 'error';

    // ONLY OPERATIONAL ERRORS
    this.isOperational = true;

    // Now we do not want the entire stack trace to show up
    Error.captureStackTrace(this, this.constructor);
  }
}
module.exports = AppError;
