const express = require('express');
const path = require('path');

const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const passport = require('./config/passport');

const authRoutes = require('./routes/auth.routes');
const employeeRoutes = require('./routes/employee.routes');
const payrollRoutes = require('./routes/payroll.routes');

const app = express();

app.set('trust proxy', 1);

app.use(helmet());

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());

// Passport
app.use(passport.initialize());

// Frontend
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/employee', employeeRoutes);
app.use('/api/v1/payroll', payrollRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({
    message: 'Route not found'
  });
});

module.exports = app;