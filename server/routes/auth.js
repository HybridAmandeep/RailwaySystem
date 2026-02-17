const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { prepare } = require('../db');

// Register new user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, full_name, phone } = req.body;

        // Validation
        if (!username || !email || !password || !full_name) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Check if user already exists
        const existingUser = prepare(
            'SELECT user_id FROM users WHERE username = ? OR email = ?'
        ).get(username, email);

        if (existingUser) {
            return res.status(400).json({ error: 'Username or email already exists' });
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // Insert user
        const result = prepare(`
            INSERT INTO users (username, email, password_hash, full_name, phone)
            VALUES (?, ?, ?, ?, ?)
        `).run(username, email, password_hash, full_name, phone || null);

        // Create session
        req.session.userId = result.lastInsertRowid;
        req.session.username = username;

        res.status(201).json({
            message: 'Registration successful',
            user: {
                user_id: result.lastInsertRowid,
                username,
                email,
                full_name
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed', message: error.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Find user
        const user = prepare(
            'SELECT * FROM users WHERE username = ? OR email = ?'
        ).get(username, username);

        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Create session
        req.session.userId = user.user_id;
        req.session.username = user.username;

        res.json({
            message: 'Login successful',
            user: {
                user_id: user.user_id,
                username: user.username,
                email: user.email,
                full_name: user.full_name
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed', message: error.message });
    }
});

// Logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ message: 'Logout successful' });
    });
});

// Get current user profile
router.get('/profile', (req, res) => {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = prepare(
        'SELECT user_id, username, email, full_name, phone, created_at FROM users WHERE user_id = ?'
    ).get(req.session.userId);

    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user });
});

// Check authentication status
router.get('/status', (req, res) => {
    if (req.session.userId) {
        const user = prepare(
            'SELECT user_id, username, email, full_name FROM users WHERE user_id = ?'
        ).get(req.session.userId);

        res.json({ authenticated: true, user });
    } else {
        res.json({ authenticated: false });
    }
});

module.exports = router;
