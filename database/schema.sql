-- IRCTC Clone Database Schema
-- SQLite Database

-- Enable foreign key support
PRAGMA foreign_keys = ON;

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);

-- ============================================
-- STATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS stations (
    station_id INTEGER PRIMARY KEY AUTOINCREMENT,
    station_code VARCHAR(10) UNIQUE NOT NULL,
    station_name VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    state VARCHAR(50) NOT NULL
);

CREATE INDEX idx_stations_code ON stations(station_code);
CREATE INDEX idx_stations_city ON stations(city);

-- ============================================
-- TRAINS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS trains (
    train_id INTEGER PRIMARY KEY AUTOINCREMENT,
    train_number VARCHAR(10) UNIQUE NOT NULL,
    train_name VARCHAR(100) NOT NULL,
    train_type VARCHAR(50) NOT NULL,
    source_station_id INTEGER NOT NULL,
    destination_station_id INTEGER NOT NULL,
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    running_days VARCHAR(20) DEFAULT 'SMTWTFS',
    total_distance_km INTEGER,
    FOREIGN KEY (source_station_id) REFERENCES stations(station_id),
    FOREIGN KEY (destination_station_id) REFERENCES stations(station_id)
);

CREATE INDEX idx_trains_number ON trains(train_number);
CREATE INDEX idx_trains_source ON trains(source_station_id);
CREATE INDEX idx_trains_destination ON trains(destination_station_id);

-- ============================================
-- ROUTE_STOPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS route_stops (
    stop_id INTEGER PRIMARY KEY AUTOINCREMENT,
    train_id INTEGER NOT NULL,
    station_id INTEGER NOT NULL,
    stop_order INTEGER NOT NULL,
    arrival_time TIME,
    departure_time TIME,
    distance_km INTEGER DEFAULT 0,
    halt_minutes INTEGER DEFAULT 2,
    FOREIGN KEY (train_id) REFERENCES trains(train_id) ON DELETE CASCADE,
    FOREIGN KEY (station_id) REFERENCES stations(station_id),
    UNIQUE(train_id, station_id)
);

CREATE INDEX idx_route_train ON route_stops(train_id);
CREATE INDEX idx_route_station ON route_stops(station_id);

-- ============================================
-- COACHES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS coaches (
    coach_id INTEGER PRIMARY KEY AUTOINCREMENT,
    train_id INTEGER NOT NULL,
    coach_number VARCHAR(10) NOT NULL,
    coach_type VARCHAR(20) NOT NULL,
    total_seats INTEGER NOT NULL,
    base_fare DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (train_id) REFERENCES trains(train_id) ON DELETE CASCADE,
    UNIQUE(train_id, coach_number)
);

CREATE INDEX idx_coaches_train ON coaches(train_id);
CREATE INDEX idx_coaches_type ON coaches(coach_type);

-- ============================================
-- SEATS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS seats (
    seat_id INTEGER PRIMARY KEY AUTOINCREMENT,
    coach_id INTEGER NOT NULL,
    seat_number VARCHAR(10) NOT NULL,
    seat_type VARCHAR(20) NOT NULL,
    is_lower_berth BOOLEAN DEFAULT 0,
    FOREIGN KEY (coach_id) REFERENCES coaches(coach_id) ON DELETE CASCADE,
    UNIQUE(coach_id, seat_number)
);

CREATE INDEX idx_seats_coach ON seats(coach_id);

-- ============================================
-- SEAT_AVAILABILITY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS seat_availability (
    availability_id INTEGER PRIMARY KEY AUTOINCREMENT,
    train_id INTEGER NOT NULL,
    journey_date DATE NOT NULL,
    coach_type VARCHAR(20) NOT NULL,
    available_seats INTEGER NOT NULL,
    total_seats INTEGER NOT NULL,
    FOREIGN KEY (train_id) REFERENCES trains(train_id) ON DELETE CASCADE,
    UNIQUE(train_id, journey_date, coach_type)
);

CREATE INDEX idx_availability_train_date ON seat_availability(train_id, journey_date);

-- ============================================
-- BOOKINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS bookings (
    booking_id INTEGER PRIMARY KEY AUTOINCREMENT,
    pnr VARCHAR(10) UNIQUE NOT NULL,
    user_id INTEGER NOT NULL,
    train_id INTEGER NOT NULL,
    journey_date DATE NOT NULL,
    from_station_id INTEGER NOT NULL,
    to_station_id INTEGER NOT NULL,
    coach_type VARCHAR(20) NOT NULL,
    total_fare DECIMAL(10,2) NOT NULL,
    booking_status VARCHAR(20) DEFAULT 'CONFIRMED',
    booked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (train_id) REFERENCES trains(train_id),
    FOREIGN KEY (from_station_id) REFERENCES stations(station_id),
    FOREIGN KEY (to_station_id) REFERENCES stations(station_id)
);

CREATE INDEX idx_bookings_pnr ON bookings(pnr);
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_train ON bookings(train_id);
CREATE INDEX idx_bookings_date ON bookings(journey_date);

-- ============================================
-- PASSENGERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS passengers (
    passenger_id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL,
    seat_id INTEGER,
    passenger_name VARCHAR(100) NOT NULL,
    age INTEGER NOT NULL,
    gender VARCHAR(10) NOT NULL,
    seat_number VARCHAR(10),
    coach_number VARCHAR(10),
    berth_preference VARCHAR(20),
    passenger_status VARCHAR(20) DEFAULT 'CONFIRMED',
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (seat_id) REFERENCES seats(seat_id)
);

CREATE INDEX idx_passengers_booking ON passengers(booking_id);

-- ============================================
-- PAYMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payments (
    payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    transaction_id VARCHAR(100) UNIQUE,
    payment_status VARCHAR(20) DEFAULT 'PENDING',
    paid_at DATETIME,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE
);

CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_transaction ON payments(transaction_id);

-- ============================================
-- WAITLIST TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS waitlist (
    waitlist_id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL,
    waitlist_number INTEGER NOT NULL,
    coach_type VARCHAR(20) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE CASCADE
);

CREATE INDEX idx_waitlist_booking ON waitlist(booking_id);

-- ============================================
-- CANCELLATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS cancellations (
    cancellation_id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL,
    cancelled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    refund_amount DECIMAL(10,2),
    refund_status VARCHAR(20) DEFAULT 'PENDING',
    cancellation_charges DECIMAL(10,2),
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
);

CREATE INDEX idx_cancellations_booking ON cancellations(booking_id);
