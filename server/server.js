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

    // Routes
    app.use('/api/auth', require('./routes/authRoutes'));
    app.use('/api/tickets', require('./routes/ticketRoutes'));
    app.use('/api/users', require('./routes/userRoutes'));

    // 404 for API routes (Global)
    app.use('/api', (req, res) => {
        res.status(404).json({ message: 'Not Found' });
    });

    // Serve React App in Production
    if (process.env.NODE_ENV === 'production') {
        const path = require('path');
        // Serve static files from React app
        app.use(express.static(path.join(__dirname, '../client/dist')));

        app.get('*', (req, res) => {
            // Don't intercept API routes (they should have been handled above, but just in case)
            if (req.path.startsWith('/api')) {
                return res.status(404).json({ message: 'Not Found' });
            }
            res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'));
        });
    } else {
        // Development
        app.get('/', (req, res) => {
            res.json({ message: 'API is running. Please use the Frontend at port 5173.' });
        });
    }

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
