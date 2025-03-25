const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes');
const { errorMiddleware } = require('./utils/errorHandler');
const logger = require('./utils/logger');

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(morgan('dev'));
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api', routes);

// Serve static files from the public directory (for testing)
app.use(express.static('public'));

// Basic root route for health check
app.get('/', (req, res) => {
    res.json({ status: 'Document Generation Service is running' });
});

// Error handling middleware
app.use(errorMiddleware);

// Handle 404
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
});

module.exports = app; // For testing purposes