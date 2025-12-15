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

    // Docs & Health endpoint
    const mongoose = require('mongoose');
        app.get('/docs', async (req, res) => {
                const dbState = mongoose.connection.readyState; // 0 disconnected, 1 connected, 2 connecting, 3 disconnecting
                let dbStatus = 'unknown';
                try {
                        dbStatus = dbState === 1 ? 'connected' : (dbState === 2 ? 'connecting' : (dbState === 3 ? 'disconnecting' : 'disconnected'));
                } catch (err) {
                        dbStatus = 'error';
                }

                const endpoints = [
                        { path: '/api/auth/register', method: 'POST', description: 'Register a new user' },
                        { path: '/api/auth/login', method: 'POST', description: 'Authenticate user and return token' },
                        { path: '/api/auth/me', method: 'GET', description: 'Get current user (protected)' },

                        { path: '/api/tickets/all/list', method: 'GET', description: 'Admin: list all tickets (protected+admin)' },
                        { path: '/api/tickets', method: 'GET', description: 'Get tickets for current user (protected)' },
                        { path: '/api/tickets', method: 'POST', description: 'Create a ticket (protected)' },
                        { path: '/api/tickets/:id', method: 'GET', description: 'Get a ticket by id (protected)' },
                        { path: '/api/tickets/:id', method: 'PUT', description: 'Update ticket (admin only)' },
                        { path: '/api/tickets/:id/messages', method: 'POST', description: 'Add message/note to ticket (protected)' },

                        { path: '/api/users', method: 'GET', description: 'Admin: list users (protected+admin)' }
                ];

                // If client accepts HTML, return a readable docs page
                if (req.accepts('html')) {
                        const uptimeSeconds = Math.floor(process.uptime());
                        const humanUptime = `${Math.floor(uptimeSeconds / 3600)}h ${Math.floor((uptimeSeconds % 3600) / 60)}m ${uptimeSeconds % 60}s`;
                        const html = `<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Service-System API Docs</title>
    <style>
        body{font-family:Inter,system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;background:#f7fafc;color:#0f172a;margin:0;padding:24px}
        .wrap{max-width:960px;margin:0 auto;background:#fff;border-radius:8px;padding:20px;box-shadow:0 4px 12px rgba(2,6,23,0.06)}
        h1{margin:0 0 8px;font-size:20px}
        .meta{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:16px}
        .badge{background:#eef2ff;color:#1e3a8a;padding:6px 10px;border-radius:6px;font-weight:600}
        table{width:100%;border-collapse:collapse;margin-top:12px}
        th,td{padding:10px;border-bottom:1px solid #eef2f6;text-align:left;font-size:14px}
        th{background:#f8fafc;text-transform:uppercase;color:#475569;font-size:12px}
        .muted{color:#64748b;font-size:13px}
        .footer{margin-top:18px;color:#94a3b8;font-size:13px}
    </style>
</head>
<body>
    <div class="wrap">
        <h1>Service-System API Docs</h1>
        <div class="meta">
            <div class="badge">Status: ${dbStatus}</div>
            <div class="muted">Uptime: ${humanUptime}</div>
            <div class="muted">Server time: ${new Date().toISOString()}</div>
        </div>
        <p class="muted">Available API endpoints:</p>
        <table>
            <thead>
                <tr><th>Path</th><th>Method</th><th>Description</th></tr>
            </thead>
            <tbody>
                ${endpoints.map(e => `<tr><td><code>${e.path}</code></td><td><strong>${e.method}</strong></td><td>${e.description}</td></tr>`).join('')}
            </tbody>
        </table>
        <div class="footer">For protected endpoints include the Authorization header: <code>Bearer &lt;token&gt;</code>.</div>
    </div>
</body>
</html>`;

                        return res.send(html);
                }

                // Default to JSON for API clients
                res.json({
                        service: 'Service-System API',
                        uptime: process.uptime(),
                        timestamp: new Date().toISOString(),
                        db: dbStatus,
                        endpoints
                });
        });

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
