const AppError = require('./../utils/appError');

const sendErrorDev = (error, response) => {
  // console.error('FULL ERROR:', error);

  response.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    stack: error.stack,
    error
  });
};
const sendErrorProd = (error, response) => {
  if (error.isOperational) {
    response.status(error.statusCode).json({
      status: error.status,
      message: error.message
    });
  } else {
    console.error(error);
    response.status(500).json({
      status: 'error',
      message: 'Something Went Very Wrong!'
    });
  }
};

const handleCastErrorDB = (error) => {
  return new AppError(400, `Ivalid ${error.path}: ${error.value}`);
};
const handleDuplicate = (error) => {
  const fields = Object.values(error.keyValue);
  return new AppError(400, `Duplicate field value: ${fields}. Please use another value.`);
};
const handleValidationErrorDB = (error) => {
  const errorArray = Object.values(error.errors).map((err) => err.message);

  const message = `invalid data, ${errorArray.join('. ')}`;
  const newError = new AppError(400, message);
  return new AppError(400, message);
};
module.exports = (error, request, response, next) => {
  console.error('FULL ERROR:', error);
  error.statusCode = error.statusCode || 500;
  error.status = error.status || 'error';

  console.error('FULL ERROR:', error);
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(error, response);
  }
  //
  else if (process.env.NODE_ENV === 'production') {
    let errCopy = { ...error };
    errCopy.message = error.message;

    if (error.name === 'CastError') {
      errCopy = handleCastErrorDB(error);
    }
    if (error.code === 11000) {
      errCopy = handleDuplicate(error);
    }
    if (error.name === 'ValidationError') {
      errCopy = handleValidationErrorDB(error);
    }
    sendErrorProd(errCopy, response);
  }
};
