const express = require('express');
const cors = require('cors');
const app = express();

const authRoutes = require('./routes/authRoutes');

app.use(express.json());

ap.use(
    cors({
        origin: 'http://localhost:5173',
        credentials: true,
    })
)

app.use('/api/auth', authRoutes);

module.exports = app;