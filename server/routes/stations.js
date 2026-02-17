const express = require('express');
const router = express.Router();
const { prepare } = require('../db');

// Get all stations (for autocomplete)
router.get('/', (req, res) => {
    try {
        const { q } = req.query;

        let stations;
        if (q) {
            // Search stations
            stations = prepare(`
                SELECT * FROM stations 
                WHERE station_code LIKE ? 
                   OR station_name LIKE ? 
                   OR city LIKE ?
                ORDER BY station_name
                LIMIT 20
            `).all(`%${q}%`, `%${q}%`, `%${q}%`);
        } else {
            // Get all stations
            stations = prepare(`
                SELECT * FROM stations ORDER BY station_name
            `).all();
        }

        res.json({ stations });
    } catch (error) {
        console.error('Station search error:', error);
        res.status(500).json({ error: 'Failed to get stations', message: error.message });
    }
});

// Get station by code
router.get('/:code', (req, res) => {
    try {
        const { code } = req.params;

        const station = prepare(`
            SELECT * FROM stations WHERE station_code = ?
        `).get(code.toUpperCase());

        if (!station) {
            return res.status(404).json({ error: 'Station not found' });
        }

        res.json({ station });
    } catch (error) {
        console.error('Get station error:', error);
        res.status(500).json({ error: 'Failed to get station', message: error.message });
    }
});

// Get trains passing through a station
router.get('/:code/trains', (req, res) => {
    try {
        const { code } = req.params;

        const trains = prepare(`
            SELECT DISTINCT 
                t.*,
                rs.arrival_time,
                rs.departure_time,
                rs.stop_order
            FROM trains t
            JOIN route_stops rs ON t.train_id = rs.train_id
            JOIN stations s ON rs.station_id = s.station_id
            WHERE s.station_code = ?
            ORDER BY rs.departure_time
        `).all(code.toUpperCase());

        res.json({ trains });
    } catch (error) {
        console.error('Station trains error:', error);
        res.status(500).json({ error: 'Failed to get trains', message: error.message });
    }
});

module.exports = router;
