export const validationErrorHandler = (err, req, res, next) => {
  if (err.name === 'ValidationError' || err.name === 'ValidatorError') {
    const errors = {};

    if (err.errors) {
      Object.keys(err.errors).forEach(key => {
        errors[key] = err.errors[key].message;
      });
    }

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }
  next(err);
};

export class ValidationError extends Error {
  constructor(message, errors = {}) {
    super(message);
    this.name = 'ValidationError';
    this.errors = errors;
    this.statusCode = 400;
  }
}

export const catchAsync = fn => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
