const express = require('express');
const router = express.Router();
const { prepare } = require('../db');

// Search trains by source, destination, and date
router.get('/search', (req, res) => {
    try {
        const { from, to, date } = req.query;

        if (!from || !to) {
            return res.status(400).json({ error: 'Source and destination are required' });
        }

        // Find trains that connect the two stations via route_stops
        const trains = prepare(`
            SELECT DISTINCT 
                t.train_id,
                t.train_number,
                t.train_name,
                t.train_type,
                t.running_days,
                s1.station_code as from_code,
                s1.station_name as from_station,
                s2.station_code as to_code,
                s2.station_name as to_station,
                rs1.departure_time,
                rs2.arrival_time,
                (rs2.distance_km - rs1.distance_km) as distance_km,
                rs1.stop_order as from_order,
                rs2.stop_order as to_order
            FROM trains t
            JOIN route_stops rs1 ON t.train_id = rs1.train_id
            JOIN route_stops rs2 ON t.train_id = rs2.train_id
            JOIN stations s1 ON rs1.station_id = s1.station_id
            JOIN stations s2 ON rs2.station_id = s2.station_id
            WHERE (UPPER(s1.station_code) = UPPER(?) OR s1.city LIKE ?)
              AND (UPPER(s2.station_code) = UPPER(?) OR s2.city LIKE ?)
              AND rs1.stop_order < rs2.stop_order
            ORDER BY rs1.departure_time
        `).all(from.toUpperCase(), `%${from}%`, to.toUpperCase(), `%${to}%`);

        // Get availability for each train
        const trainsWithAvailability = trains.map(train => {
            const availability = prepare(`
                SELECT coach_type, available_seats, total_seats
                FROM seat_availability
                WHERE train_id = ? AND journey_date = ?
            `).all(train.train_id, date || new Date().toISOString().split('T')[0]);

            // If no specific date availability, get from coaches
            let classes = availability;
            if (classes.length === 0) {
                classes = prepare(`
                    SELECT 
                        coach_type,
                        SUM(total_seats) as total_seats,
                        SUM(total_seats) as available_seats,
                        MIN(base_fare) as base_fare
                    FROM coaches
                    WHERE train_id = ?
                    GROUP BY coach_type
                `).all(train.train_id);
            }

            return { ...train, classes };
        });

        res.json({
            trains: trainsWithAvailability,
            searchParams: { from, to, date }
        });
    } catch (error) {
        console.error('Train search error:', error);
        res.status(500).json({ error: 'Search failed', message: error.message });
    }
});

// Get train details by ID
router.get('/:id', (req, res) => {
    try {
        const { id } = req.params;

        const train = prepare(`
            SELECT 
                t.*,
                s1.station_code as source_code,
                s1.station_name as source_name,
                s2.station_code as destination_code,
                s2.station_name as destination_name
            FROM trains t
            JOIN stations s1 ON t.source_station_id = s1.station_id
            JOIN stations s2 ON t.destination_station_id = s2.station_id
            WHERE t.train_id = ?
        `).get(id);

        if (!train) {
            return res.status(404).json({ error: 'Train not found' });
        }

        // Get route stops
        const stops = prepare(`
            SELECT 
                rs.*,
                s.station_code,
                s.station_name,
                s.city
            FROM route_stops rs
            JOIN stations s ON rs.station_id = s.station_id
            WHERE rs.train_id = ?
            ORDER BY rs.stop_order
        `).all(id);

        // Get coaches
        const coaches = prepare(`
            SELECT * FROM coaches WHERE train_id = ?
        `).all(id);

        res.json({ train, stops, coaches });
    } catch (error) {
        console.error('Get train error:', error);
        res.status(500).json({ error: 'Failed to get train', message: error.message });
    }
});

// Get seat availability for a train
router.get('/:id/availability', (req, res) => {
    try {
        const { id } = req.params;
        const { date, coachType } = req.query;

        let availability;
        if (date && coachType) {
            availability = prepare(`
                SELECT sa.*, c.coach_number, c.base_fare
                FROM seat_availability sa
                JOIN coaches c ON sa.train_id = c.train_id AND sa.coach_type = c.coach_type
                WHERE sa.train_id = ? AND sa.journey_date = ? AND sa.coach_type = ?
                GROUP BY sa.coach_type, sa.journey_date
            `).all(id, date, coachType);
        } else if (date) {
            availability = prepare(`
                SELECT sa.*, c.coach_number, c.base_fare
                FROM seat_availability sa
                JOIN coaches c ON sa.train_id = c.train_id AND sa.coach_type = c.coach_type
                WHERE sa.train_id = ? AND sa.journey_date = ?
                GROUP BY sa.coach_type, sa.journey_date
            `).all(id, date);
        } else {
            availability = prepare(`
                SELECT sa.*, c.coach_number, c.base_fare
                FROM seat_availability sa
                JOIN coaches c ON sa.train_id = c.train_id AND sa.coach_type = c.coach_type
                WHERE sa.train_id = ?
                GROUP BY sa.coach_type, sa.journey_date
            `).all(id);
        }

        // If no availability records, get default from coaches
        if (availability.length === 0) {
            const defaultAvailability = prepare(`
                SELECT 
                    coach_type,
                    SUM(total_seats) as available_seats,
                    SUM(total_seats) as total_seats,
                    MIN(base_fare) as base_fare
                FROM coaches
                WHERE train_id = ?
                GROUP BY coach_type
            `).all(id);

            return res.json({ availability: defaultAvailability, date, trainId: id });
        }

        res.json({ availability, date, trainId: id });
    } catch (error) {
        console.error('Availability error:', error);
        res.status(500).json({ error: 'Failed to get availability', message: error.message });
    }
});

// Get fare for a journey
router.get('/:id/fare', (req, res) => {
    try {
        const { id } = req.params;
        const { from, to, coachType } = req.query;

        // Calculate distance
        const distance = prepare(`
            SELECT 
                (rs2.distance_km - rs1.distance_km) as distance
            FROM route_stops rs1
            JOIN route_stops rs2 ON rs1.train_id = rs2.train_id
            JOIN stations s1 ON rs1.station_id = s1.station_id
            JOIN stations s2 ON rs2.station_id = s2.station_id
            WHERE rs1.train_id = ?
              AND s1.station_code = ?
              AND s2.station_code = ?
              AND rs1.stop_order < rs2.stop_order
        `).get(id, from, to);

        // Get base fare
        const coach = prepare(`
            SELECT base_fare FROM coaches 
            WHERE train_id = ? AND coach_type = ?
            LIMIT 1
        `).get(id, coachType || '3AC');

        if (!distance || !coach) {
            return res.status(404).json({ error: 'Could not calculate fare' });
        }

        // Calculate fare based on distance (simplified)
        const fare = Math.round(coach.base_fare * (distance.distance / 1000));

        res.json({
            fare,
            distance: distance.distance,
            coachType: coachType || '3AC',
            baseFare: coach.base_fare
        });
    } catch (error) {
        console.error('Fare calculation error:', error);
        res.status(500).json({ error: 'Failed to calculate fare', message: error.message });
    }
});

module.exports = router;
