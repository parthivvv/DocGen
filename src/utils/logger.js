const winston = require('winston');

/**
 * Logger configuration using Winston
 */
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        winston.format.json()
    ),
    defaultMeta: { service: 'document-generation-service' },
    transports: [
        // Write to console
        new winston.transports.Console({
            format: winston.format.combine(
                winston.format.colorize(),
                winston.format.printf(
                    info => `${info.timestamp} ${info.level}: ${info.message}${info.stack ? '\n' + info.stack : ''}`
                )
            )
        })
    ]
});

// Add file transport in production
if (process.env.NODE_ENV === 'production') {
    logger.add(new winston.transports.File({ filename: 'logs/error.log', level: 'error' }));
    logger.add(new winston.transports.File({ filename: 'logs/combined.log' }));
}

module.exports = logger;