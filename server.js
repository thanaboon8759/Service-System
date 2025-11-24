const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

const startServer = async () => {
    // Connect to database
    await connectDB();

    const app = express();

    // Middleware
    app.use(express.json());
    app.use(cors());
    if (process.env.NODE_ENV === 'development') {
        app.use(morgan('dev'));
    }

    // Serve static files
    app.use(express.static('public'));

    // Routes
    app.use('/api/auth', require('./routes/authRoutes'));
    app.use('/api/tickets', require('./routes/ticketRoutes'));
    app.use('/api/users', require('./routes/userRoutes'));

    app.get('/', (req, res) => {
        res.sendFile(__dirname + '/public/index.html');
    });

    // 404 for API routes
    app.use('/api', (req, res) => {
        res.status(404).json({ message: 'Not Found' });
    });

    // Error Handler
    app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).json({
            message: err.message || 'Server Error',
            stack: process.env.NODE_ENV === 'production' ? null : err.stack,
        });
    });

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();
