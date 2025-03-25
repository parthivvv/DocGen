const logger = require('./logger');

/**
 * Custom error class for API errors
 */
class CustomError extends Error {
    /**
     * Create a custom error
     * @param {number} statusCode - HTTP status code
     * @param {string} message - Error message
     */
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Error handling middleware
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware
 */
const errorMiddleware = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Something went wrong';

    logger.error(`Error ${statusCode}: ${message}`);

    if (process.env.NODE_ENV === 'development') {
        return res.status(statusCode).json({
            error: message,
            stack: err.stack
        });
    }

    return res.status(statusCode).json({
        error: message
    });
};

module.exports = {
    CustomError,
    errorMiddleware
};