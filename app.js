const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());

ap.use(
    cors({
        origin: 'http://localhost:5173',
        credentials: true,
    })
)

module.exports = app;