# 🚂 IRCTC Clone - Railway Ticket Booking System

A fully functional IRCTC (Indian Railway Catering and Tourism Corporation) clone built as a DBMS mini-project. This web application allows users to search trains, book tickets, check PNR status, and manage bookings.

![Node.js](https://img.shields.io/badge/Node.js-v18+-green)
![SQLite](https://img.shields.io/badge/Database-SQLite-blue)
![Express](https://img.shields.io/badge/Express-v4.18-lightgrey)
![License](https://img.shields.io/badge/License-ISC-yellow)

## ✨ Features

- **User Authentication** - Secure registration and login with bcrypt password hashing
- **Train Search** - Search trains by source, destination, and date with station autocomplete
- **Real-time Availability** - Check seat availability across different coach classes
- **Multi-Passenger Booking** - Book tickets for up to 6 passengers with berth preferences
- **Payment Simulation** - Multiple payment options (UPI, Card, Net Banking, Wallet)
- **PNR Status** - Check booking status using 10-digit PNR number
- **Booking History** - View all past and upcoming bookings
- **Ticket Cancellation** - Cancel bookings with automatic refund calculation (75% refund)
- **E-Ticket** - View and print tickets with passenger details

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Backend | Node.js + Express.js |
| Database | SQLite (sql.js) |
| Frontend | HTML5, CSS3, Vanilla JavaScript |
| Authentication | bcryptjs + express-session |

## 📦 Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm (comes with Node.js)

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/irctc-clone.git
   cd irctc-clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   npm start
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

That's it! The database will be automatically created and populated with sample data on first run.

## 👤 Demo Credentials

| Username | Password |
|----------|----------|
| demo | password123 |
| testuser | test1234 |

## 📁 Project Structure

```
irctc-clone/
├── database/
│   ├── schema.sql          # Database schema (12 tables)
│   ├── seed.sql            # Sample data
│   └── irctc.db            # SQLite database (auto-generated)
├── server/
│   ├── index.js            # Express server entry point
│   ├── db.js               # Database connection module
│   ├── middleware/
│   │   └── auth.js         # Authentication middleware
│   └── routes/
│       ├── auth.js         # Auth endpoints
│       ├── trains.js       # Train search/details
│       ├── bookings.js     # Booking management
│       └── stations.js     # Station autocomplete
├── public/
│   ├── index.html          # Home page
│   ├── login.html          # Login page
│   ├── register.html       # Registration page
│   ├── trains.html         # Search results
│   ├── booking.html        # Passenger details
│   ├── payment.html        # Payment page
│   ├── ticket.html         # E-ticket display
│   ├── pnr-status.html     # PNR status check
│   ├── history.html        # Booking history
│   ├── css/styles.css      # Styling
│   └── js/                 # Frontend scripts
├── package.json
└── README.md
```

## 🗄️ Database Schema

The project uses 12 normalized SQL tables:

- **Users** - User accounts and authentication
- **Stations** - 25 major Indian railway stations
- **Trains** - 15 popular trains with schedules
- **Route_Stops** - Train route information
- **Coaches** - Coach types (1AC, 2AC, 3AC, SL, etc.)
- **Seats** - Individual seat records
- **Seat_Availability** - Date-wise availability
- **Bookings** - Ticket bookings
- **Passengers** - Passenger details
- **Payments** - Payment records
- **Waitlist** - Waitlisted bookings
- **Cancellations** - Cancelled bookings

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/auth/status` | Check auth status |
| GET | `/api/trains/search` | Search trains |
| GET | `/api/trains/:id` | Get train details |
| GET | `/api/stations` | Station autocomplete |
| POST | `/api/bookings` | Create booking |
| GET | `/api/bookings/pnr/:pnr` | Get PNR status |
| GET | `/api/bookings` | User booking history |
| POST | `/api/bookings/:pnr/pay` | Complete payment |
| POST | `/api/bookings/:pnr/cancel` | Cancel booking |

## 🎨 Screenshots

The application features a modern, responsive design with:
- Glassmorphism effects
- IRCTC-inspired color scheme (orange & blue)
- Mobile-friendly layouts
- Smooth animations

## 📝 Sample Data

The database comes pre-loaded with:
- **25 major Indian stations** (New Delhi, Mumbai, Chennai, Kolkata, etc.)
- **15 popular trains** (Rajdhani, Shatabdi, Duronto, etc.)
- **Coach configurations** for each train
- **Route information** with realistic timings
- **30 days of seat availability**

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- Inspired by [IRCTC](https://www.irctc.co.in/)
- Built as a DBMS Mini Project
- Icons from [Font Awesome](https://fontawesome.com/)

---

Made with ❤️ for learning purposes
