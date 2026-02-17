const express = require('express');
const router = express.Router();
const { prepare, transaction } = require('../db');

// Generate PNR number
function generatePNR() {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${timestamp}${random}`;
}

// Middleware to check authentication
function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    next();
}

// Create new booking
router.post('/', requireAuth, (req, res) => {
    try {
        const {
            train_id,
            journey_date,
            from_station,
            to_station,
            coach_type,
            passengers
        } = req.body;

        // Validation
        if (!train_id || !journey_date || !from_station || !to_station || !coach_type || !passengers) {
            return res.status(400).json({ error: 'All booking details are required' });
        }

        if (!Array.isArray(passengers) || passengers.length === 0) {
            return res.status(400).json({ error: 'At least one passenger is required' });
        }

        // Get station IDs
        const fromStation = prepare(
            'SELECT station_id FROM stations WHERE station_code = ?'
        ).get(from_station);

        const toStation = prepare(
            'SELECT station_id FROM stations WHERE station_code = ?'
        ).get(to_station);

        if (!fromStation || !toStation) {
            return res.status(400).json({ error: 'Invalid station codes' });
        }

        // Check availability
        let availability = prepare(`
            SELECT available_seats FROM seat_availability
            WHERE train_id = ? AND journey_date = ? AND coach_type = ?
        `).get(train_id, journey_date, coach_type);

        // If no availability record, create one from coaches
        if (!availability) {
            const coach = prepare(`
                SELECT SUM(total_seats) as total_seats FROM coaches
                WHERE train_id = ? AND coach_type = ?
            `).get(train_id, coach_type);

            if (coach && coach.total_seats) {
                prepare(`
                    INSERT INTO seat_availability (train_id, journey_date, coach_type, available_seats, total_seats)
                    VALUES (?, ?, ?, ?, ?)
                `).run(train_id, journey_date, coach_type, coach.total_seats, coach.total_seats);

                availability = { available_seats: coach.total_seats };
            } else {
                availability = { available_seats: 100 }; // Default
            }
        }

        const numPassengers = passengers.length;
        let bookingStatus = 'CONFIRMED';
        let waitlistNumber = null;

        if (!availability || availability.available_seats < numPassengers) {
            bookingStatus = 'WAITLIST';
            // Get current waitlist count
            const waitlistCount = prepare(`
                SELECT COUNT(*) as count FROM waitlist w
                JOIN bookings b ON w.booking_id = b.booking_id
                WHERE b.train_id = ? AND b.journey_date = ? AND w.coach_type = ?
            `).get(train_id, journey_date, coach_type);
            waitlistNumber = (waitlistCount?.count || 0) + 1;
        }

        // Calculate fare
        const coach = prepare(`
            SELECT base_fare FROM coaches 
            WHERE train_id = ? AND coach_type = ?
            LIMIT 1
        `).get(train_id, coach_type);

        const baseFare = coach?.base_fare || 1000;
        const totalFare = baseFare * numPassengers;

        // Generate PNR
        const pnr = generatePNR();

        // Create booking atomically using transaction
        const createBooking = transaction(() => {
            // Create booking
            const bookingResult = prepare(`
                INSERT INTO bookings (pnr, user_id, train_id, journey_date, from_station_id, to_station_id, coach_type, total_fare, booking_status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(pnr, req.session.userId, train_id, journey_date, fromStation.station_id, toStation.station_id, coach_type, totalFare, bookingStatus);

            const bookingId = bookingResult.lastInsertRowid;

            // Add passengers
            passengers.forEach((p, index) => {
                prepare(`
                    INSERT INTO passengers (booking_id, passenger_name, age, gender, berth_preference, passenger_status)
                    VALUES (?, ?, ?, ?, ?, ?)
                `).run(bookingId, p.name, p.age, p.gender, p.berth_preference || 'NO PREFERENCE', bookingStatus);
            });

            // Update availability if confirmed
            if (bookingStatus === 'CONFIRMED') {
                prepare(`
                    UPDATE seat_availability 
                    SET available_seats = available_seats - ?
                    WHERE train_id = ? AND journey_date = ? AND coach_type = ?
                `).run(numPassengers, train_id, journey_date, coach_type);
            } else {
                // Add to waitlist
                prepare(`
                    INSERT INTO waitlist (booking_id, waitlist_number, coach_type)
                    VALUES (?, ?, ?)
                `).run(bookingId, waitlistNumber, coach_type);
            }

            // Create payment record (pending)
            const transactionId = `TXN${Date.now()}`;
            prepare(`
                INSERT INTO payments (booking_id, amount, payment_method, transaction_id, payment_status)
                VALUES (?, ?, 'PENDING', ?, 'PENDING')
            `).run(bookingId, totalFare, transactionId);

            return { bookingId, pnr, transactionId };
        });

        const result = createBooking();

        res.status(201).json({
            message: 'Booking created successfully',
            booking: {
                booking_id: result.bookingId,
                pnr: result.pnr,
                transaction_id: result.transactionId,
                status: bookingStatus,
                waitlist_number: waitlistNumber,
                total_fare: totalFare,
                passengers: numPassengers
            }
        });
    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({ error: 'Booking failed', message: error.message });
    }
});

// Complete payment
router.post('/:pnr/pay', requireAuth, (req, res) => {
    try {
        const { pnr } = req.params;
        const { payment_method } = req.body;

        // Get booking
        const booking = prepare(`
            SELECT b.*, p.payment_id, p.transaction_id
            FROM bookings b
            JOIN payments p ON b.booking_id = p.booking_id
            WHERE b.pnr = ? AND b.user_id = ?
        `).get(pnr, req.session.userId);

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        // Update payment
        prepare(`
            UPDATE payments 
            SET payment_status = 'COMPLETED', payment_method = ?, paid_at = datetime('now')
            WHERE booking_id = ?
        `).run(payment_method || 'UPI', booking.booking_id);

        // Assign seat numbers if confirmed
        if (booking.booking_status === 'CONFIRMED') {
            const passengers = prepare(
                'SELECT * FROM passengers WHERE booking_id = ?'
            ).all(booking.booking_id);

            const coach = prepare(`
                SELECT coach_number FROM coaches 
                WHERE train_id = ? AND coach_type = ?
                LIMIT 1
            `).get(booking.train_id, booking.coach_type);

            passengers.forEach((p, index) => {
                const seatNumber = Math.floor(Math.random() * 72) + 1;
                const berths = ['LB', 'MB', 'UB', 'SL', 'SU'];
                const berthType = berths[index % berths.length];

                prepare(`
                    UPDATE passengers 
                    SET seat_number = ?, coach_number = ?
                    WHERE passenger_id = ?
                `).run(`${seatNumber}/${berthType}`, coach?.coach_number || 'B1', p.passenger_id);
            });
        }

        res.json({
            message: 'Payment successful',
            pnr: pnr,
            transaction_id: booking.transaction_id,
            status: booking.booking_status
        });
    } catch (error) {
        console.error('Payment error:', error);
        res.status(500).json({ error: 'Payment failed', message: error.message });
    }
});

// Get booking by PNR
router.get('/pnr/:pnr', (req, res) => {
    try {
        const { pnr } = req.params;

        const booking = prepare(`
            SELECT 
                b.*,
                t.train_number,
                t.train_name,
                s1.station_code as from_code,
                s1.station_name as from_station,
                s2.station_code as to_code,
                s2.station_name as to_station,
                p.payment_status,
                p.payment_method,
                p.transaction_id
            FROM bookings b
            JOIN trains t ON b.train_id = t.train_id
            JOIN stations s1 ON b.from_station_id = s1.station_id
            JOIN stations s2 ON b.to_station_id = s2.station_id
            LEFT JOIN payments p ON b.booking_id = p.booking_id
            WHERE b.pnr = ?
        `).get(pnr);

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        // Get passengers
        const passengers = prepare(
            'SELECT * FROM passengers WHERE booking_id = ?'
        ).all(booking.booking_id);

        // Get waitlist info if applicable
        let waitlistInfo = null;
        if (booking.booking_status === 'WAITLIST') {
            waitlistInfo = prepare(
                'SELECT waitlist_number FROM waitlist WHERE booking_id = ?'
            ).get(booking.booking_id);
        }

        res.json({
            booking,
            passengers,
            waitlist: waitlistInfo
        });
    } catch (error) {
        console.error('PNR lookup error:', error);
        res.status(500).json({ error: 'Failed to get booking', message: error.message });
    }
});

// Get user's booking history
router.get('/', requireAuth, (req, res) => {
    try {
        const bookings = prepare(`
            SELECT 
                b.*,
                t.train_number,
                t.train_name,
                s1.station_code as from_code,
                s1.station_name as from_station,
                s2.station_code as to_code,
                s2.station_name as to_station,
                p.payment_status,
                (SELECT COUNT(*) FROM passengers WHERE booking_id = b.booking_id) as passenger_count
            FROM bookings b
            JOIN trains t ON b.train_id = t.train_id
            JOIN stations s1 ON b.from_station_id = s1.station_id
            JOIN stations s2 ON b.to_station_id = s2.station_id
            LEFT JOIN payments p ON b.booking_id = p.booking_id
            WHERE b.user_id = ?
            ORDER BY b.booked_at DESC
        `).all(req.session.userId);

        res.json({ bookings });
    } catch (error) {
        console.error('Booking history error:', error);
        res.status(500).json({ error: 'Failed to get bookings', message: error.message });
    }
});

// Cancel booking
router.post('/:pnr/cancel', requireAuth, (req, res) => {
    try {
        const { pnr } = req.params;

        // Get booking
        const booking = prepare(`
            SELECT * FROM bookings WHERE pnr = ? AND user_id = ?
        `).get(pnr, req.session.userId);

        if (!booking) {
            return res.status(404).json({ error: 'Booking not found' });
        }

        if (booking.booking_status === 'CANCELLED') {
            return res.status(400).json({ error: 'Booking already cancelled' });
        }

        // Calculate refund (simplified - 75% refund)
        const cancellationCharges = booking.total_fare * 0.25;
        const refundAmount = booking.total_fare - cancellationCharges;

        // Update booking status
        prepare(`
            UPDATE bookings SET booking_status = 'CANCELLED' WHERE booking_id = ?
        `).run(booking.booking_id);

        // Update passenger status
        prepare(`
            UPDATE passengers SET passenger_status = 'CANCELLED' WHERE booking_id = ?
        `).run(booking.booking_id);

        // Restore seat availability if was confirmed
        if (booking.booking_status === 'CONFIRMED') {
            const passengerCount = prepare(
                'SELECT COUNT(*) as count FROM passengers WHERE booking_id = ?'
            ).get(booking.booking_id);

            prepare(`
                UPDATE seat_availability 
                SET available_seats = available_seats + ?
                WHERE train_id = ? AND journey_date = ? AND coach_type = ?
            `).run(passengerCount.count || 1, booking.train_id, booking.journey_date, booking.coach_type);
        }

        // Create cancellation record
        prepare(`
            INSERT INTO cancellations (booking_id, refund_amount, cancellation_charges, refund_status)
            VALUES (?, ?, ?, 'PROCESSED')
        `).run(booking.booking_id, refundAmount, cancellationCharges);

        res.json({
            message: 'Booking cancelled successfully',
            pnr,
            refund_amount: refundAmount,
            cancellation_charges: cancellationCharges
        });
    } catch (error) {
        console.error('Cancellation error:', error);
        res.status(500).json({ error: 'Cancellation failed', message: error.message });
    }
});

module.exports = router;
