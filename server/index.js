const express = require('express');
const cors = require('cors');
const session = require('express-session');
const path = require('path');
const { initializeDatabase } = require('./db');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: 'irctc-clone-secret-key-2024',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true in production with HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Serve static files
app.use(express.static(path.join(__dirname, '..', 'public')));

// Import routes
const authRoutes = require('./routes/auth');
const trainRoutes = require('./routes/trains');
const bookingRoutes = require('./routes/bookings');
const stationRoutes = require('./routes/stations');

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/trains', trainRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/stations', stationRoutes);

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Catch-all route for SPA
app.get('*', (req, res) => {
    // Check if it's an API route
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API endpoint not found' });
    }
    // Serve the requested HTML file or fallback to index
    const htmlFile = path.join(__dirname, '..', 'public', req.path);
    if (req.path.endsWith('.html')) {
        res.sendFile(htmlFile);
    } else {
        res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error', message: err.message });
});

// Initialize database and start server
async function startServer() {
    try {
        await initializeDatabase();
        console.log('Database initialized successfully');

        app.listen(PORT, () => {
            console.log(`
    ╔═══════════════════════════════════════════════════════╗
    ║                  IRCTC Clone Server                   ║
    ╠═══════════════════════════════════════════════════════╣
    ║  Server running at: http://localhost:${PORT}             ║
    ║  Database: SQLite (database/irctc.db)                 ║
    ╚═══════════════════════════════════════════════════════╝
            `);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

module.exports = app;
