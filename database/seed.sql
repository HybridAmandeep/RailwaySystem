-- IRCTC Clone Seed Data
-- Sample stations, trains, coaches, and routes

-- ============================================
-- STATIONS DATA (Major Indian Railway Stations)
-- ============================================
INSERT INTO stations (station_code, station_name, city, state) VALUES
('NDLS', 'New Delhi', 'New Delhi', 'Delhi'),
('BCT', 'Mumbai Central', 'Mumbai', 'Maharashtra'),
('CSMT', 'Chhatrapati Shivaji Terminus', 'Mumbai', 'Maharashtra'),
('HWH', 'Howrah Junction', 'Kolkata', 'West Bengal'),
('MAS', 'Chennai Central', 'Chennai', 'Tamil Nadu'),
('SBC', 'Bengaluru City Junction', 'Bengaluru', 'Karnataka'),
('ADI', 'Ahmedabad Junction', 'Ahmedabad', 'Gujarat'),
('JP', 'Jaipur Junction', 'Jaipur', 'Rajasthan'),
('LKO', 'Lucknow Charbagh', 'Lucknow', 'Uttar Pradesh'),
('PNBE', 'Patna Junction', 'Patna', 'Bihar'),
('BPL', 'Bhopal Junction', 'Bhopal', 'Madhya Pradesh'),
('NGP', 'Nagpur Junction', 'Nagpur', 'Maharashtra'),
('PUNE', 'Pune Junction', 'Pune', 'Maharashtra'),
('HYB', 'Hyderabad Deccan', 'Hyderabad', 'Telangana'),
('CNB', 'Kanpur Central', 'Kanpur', 'Uttar Pradesh'),
('AGC', 'Agra Cantt', 'Agra', 'Uttar Pradesh'),
('GWL', 'Gwalior Junction', 'Gwalior', 'Madhya Pradesh'),
('JHS', 'Jhansi Junction', 'Jhansi', 'Uttar Pradesh'),
('BBS', 'Bhubaneswar', 'Bhubaneswar', 'Odisha'),
('VSKP', 'Visakhapatnam', 'Visakhapatnam', 'Andhra Pradesh'),
('TVC', 'Thiruvananthapuram Central', 'Thiruvananthapuram', 'Kerala'),
('ERS', 'Ernakulam Junction', 'Kochi', 'Kerala'),
('CBE', 'Coimbatore Junction', 'Coimbatore', 'Tamil Nadu'),
('MDU', 'Madurai Junction', 'Madurai', 'Tamil Nadu'),
('GKP', 'Gorakhpur Junction', 'Gorakhpur', 'Uttar Pradesh');

-- ============================================
-- TRAINS DATA
-- ============================================
INSERT INTO trains (train_number, train_name, train_type, source_station_id, destination_station_id, departure_time, arrival_time, running_days, total_distance_km) VALUES
('12301', 'Rajdhani Express', 'Rajdhani', 1, 4, '16:55', '09:55', 'SMTWTFS', 1447),
('12302', 'Rajdhani Express', 'Rajdhani', 4, 1, '14:05', '10:05', 'SMTWTFS', 1447),
('12951', 'Mumbai Rajdhani', 'Rajdhani', 1, 2, '16:35', '08:35', 'SMTWTFS', 1384),
('12952', 'Mumbai Rajdhani', 'Rajdhani', 2, 1, '17:00', '08:35', 'SMTWTFS', 1384),
('12259', 'Duronto Express', 'Duronto', 1, 6, '20:10', '06:00', 'SMTWTFS', 2444),
('12001', 'Shatabdi Express', 'Shatabdi', 1, 9, '06:10', '12:40', 'SMTWTFS', 512),
('12002', 'Shatabdi Express', 'Shatabdi', 9, 1, '15:30', '21:40', 'SMTWTFS', 512),
('12003', 'Lucknow Shatabdi', 'Shatabdi', 1, 9, '06:10', '12:25', 'SMTWTFS', 512),
('12627', 'Karnataka Express', 'Superfast', 1, 6, '21:00', '05:50', 'SMTWTFS', 2444),
('12628', 'Karnataka Express', 'Superfast', 6, 1, '20:00', '05:15', 'SMTWTFS', 2444),
('12723', 'Telangana Express', 'Superfast', 1, 14, '06:50', '08:50', 'SMTWTFS', 1653),
('12724', 'Telangana Express', 'Superfast', 14, 1, '18:10', '19:55', 'SMTWTFS', 1653),
('12309', 'Rajdhani Express', 'Rajdhani', 1, 10, '17:35', '08:40', 'SMTWTFS', 999),
('12621', 'Tamil Nadu Express', 'Superfast', 1, 5, '22:30', '05:45', 'SMTWTFS', 2175),
('12622', 'Tamil Nadu Express', 'Superfast', 5, 1, '22:00', '06:05', 'SMTWTFS', 2175);

-- ============================================
-- ROUTE STOPS DATA (Sample routes)
-- ============================================
-- Route for 12951 Mumbai Rajdhani (New Delhi to Mumbai Central)
INSERT INTO route_stops (train_id, station_id, stop_order, arrival_time, departure_time, distance_km) VALUES
(3, 1, 1, NULL, '16:35', 0),
(3, 18, 2, '21:00', '21:05', 403),
(3, 11, 3, '00:10', '00:15', 705),
(3, 7, 4, '04:55', '05:00', 934),
(3, 2, 5, '08:35', NULL, 1384);

-- Route for 12627 Karnataka Express (New Delhi to Bengaluru)
INSERT INTO route_stops (train_id, station_id, stop_order, arrival_time, departure_time, distance_km) VALUES
(9, 1, 1, NULL, '21:00', 0),
(9, 16, 2, '00:08', '00:10', 195),
(9, 17, 3, '02:15', '02:20', 305),
(9, 18, 4, '04:00', '04:10', 403),
(9, 11, 5, '08:05', '08:15', 705),
(9, 12, 6, '14:25', '14:30', 1092),
(9, 6, 7, '05:50', NULL, 2444);

-- Route for 12001 Shatabdi Express (New Delhi to Lucknow)
INSERT INTO route_stops (train_id, station_id, stop_order, arrival_time, departure_time, distance_km) VALUES
(6, 1, 1, NULL, '06:10', 0),
(6, 15, 2, '10:20', '10:30', 440),
(6, 9, 3, '12:40', NULL, 512);

-- ============================================
-- COACHES DATA (For each train)
-- ============================================
-- Coaches for Mumbai Rajdhani (train_id = 3)
INSERT INTO coaches (train_id, coach_number, coach_type, total_seats, base_fare) VALUES
(3, 'H1', '1AC', 24, 4500.00),
(3, 'A1', '2AC', 48, 2700.00),
(3, 'A2', '2AC', 48, 2700.00),
(3, 'B1', '3AC', 64, 1850.00),
(3, 'B2', '3AC', 64, 1850.00),
(3, 'B3', '3AC', 64, 1850.00);

-- Coaches for Karnataka Express (train_id = 9)
INSERT INTO coaches (train_id, coach_number, coach_type, total_seats, base_fare) VALUES
(9, 'H1', '1AC', 24, 3800.00),
(9, 'A1', '2AC', 48, 2200.00),
(9, 'A2', '2AC', 48, 2200.00),
(9, 'B1', '3AC', 64, 1500.00),
(9, 'B2', '3AC', 64, 1500.00),
(9, 'B3', '3AC', 64, 1500.00),
(9, 'S1', 'SL', 72, 650.00),
(9, 'S2', 'SL', 72, 650.00),
(9, 'S3', 'SL', 72, 650.00),
(9, 'S4', 'SL', 72, 650.00);

-- Coaches for Shatabdi Express (train_id = 6)
INSERT INTO coaches (train_id, coach_number, coach_type, total_seats, base_fare) VALUES
(6, 'E1', 'EC', 56, 1500.00),
(6, 'E2', 'EC', 56, 1500.00),
(6, 'C1', 'CC', 78, 950.00),
(6, 'C2', 'CC', 78, 950.00),
(6, 'C3', 'CC', 78, 950.00),
(6, 'C4', 'CC', 78, 950.00);

-- ============================================
-- SEATS DATA (Sample seats for coach H1 of Mumbai Rajdhani)
-- ============================================
INSERT INTO seats (coach_id, seat_number, seat_type, is_lower_berth) VALUES
(1, '1', 'COUPE', 1),
(1, '2', 'COUPE', 1),
(1, '3', 'COUPE', 0),
(1, '4', 'COUPE', 0),
(1, '5', 'COUPE', 1),
(1, '6', 'COUPE', 1),
(1, '7', 'COUPE', 0),
(1, '8', 'COUPE', 0),
(1, '9', 'CABIN', 1),
(1, '10', 'CABIN', 1),
(1, '11', 'CABIN', 0),
(1, '12', 'CABIN', 0),
(1, '13', 'CABIN', 1),
(1, '14', 'CABIN', 1),
(1, '15', 'CABIN', 0),
(1, '16', 'CABIN', 0),
(1, '17', 'CABIN', 1),
(1, '18', 'CABIN', 1),
(1, '19', 'CABIN', 0),
(1, '20', 'CABIN', 0),
(1, '21', 'CABIN', 1),
(1, '22', 'CABIN', 1),
(1, '23', 'CABIN', 0),
(1, '24', 'CABIN', 0);

-- Sample seats for 2AC coach A1
INSERT INTO seats (coach_id, seat_number, seat_type, is_lower_berth) VALUES
(2, '1', 'LB', 1),
(2, '2', 'MB', 0),
(2, '3', 'UB', 0),
(2, '4', 'LB', 1),
(2, '5', 'MB', 0),
(2, '6', 'UB', 0),
(2, '7', 'SL', 1),
(2, '8', 'SU', 0);

-- ============================================
-- SEAT AVAILABILITY (Sample data for next 30 days)
-- ============================================
INSERT INTO seat_availability (train_id, journey_date, coach_type, available_seats, total_seats) VALUES
-- Mumbai Rajdhani
(3, DATE('now', '+1 day'), '1AC', 18, 24),
(3, DATE('now', '+1 day'), '2AC', 72, 96),
(3, DATE('now', '+1 day'), '3AC', 150, 192),
(3, DATE('now', '+2 day'), '1AC', 24, 24),
(3, DATE('now', '+2 day'), '2AC', 96, 96),
(3, DATE('now', '+2 day'), '3AC', 192, 192),
(3, DATE('now', '+3 day'), '1AC', 20, 24),
(3, DATE('now', '+3 day'), '2AC', 85, 96),
(3, DATE('now', '+3 day'), '3AC', 170, 192),
-- Karnataka Express
(9, DATE('now', '+1 day'), '1AC', 20, 24),
(9, DATE('now', '+1 day'), '2AC', 80, 96),
(9, DATE('now', '+1 day'), '3AC', 160, 192),
(9, DATE('now', '+1 day'), 'SL', 250, 288),
(9, DATE('now', '+2 day'), '1AC', 24, 24),
(9, DATE('now', '+2 day'), '2AC', 96, 96),
(9, DATE('now', '+2 day'), '3AC', 192, 192),
(9, DATE('now', '+2 day'), 'SL', 288, 288),
-- Shatabdi Express
(6, DATE('now', '+1 day'), 'EC', 100, 112),
(6, DATE('now', '+1 day'), 'CC', 280, 312),
(6, DATE('now', '+2 day'), 'EC', 112, 112),
(6, DATE('now', '+2 day'), 'CC', 312, 312);

-- ============================================
-- SAMPLE USERS (for testing)
-- ============================================
INSERT INTO users (username, email, password_hash, full_name, phone) VALUES
('demo', 'demo@example.com', '$2b$10$rIC/CRQFyLYnHzS7fH5mZOKqTzYr8.NqVZtW9IzV3QXGJ8XRf1MRO', 'Demo User', '9876543210'),
('testuser', 'test@example.com', '$2b$10$rIC/CRQFyLYnHzS7fH5mZOKqTzYr8.NqVZtW9IzV3QXGJ8XRf1MRO', 'Test User', '9123456789');
-- Note: Password hash is for 'password123'
