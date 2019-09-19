const path = require('path');
const fs = require('fs');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');

const authRoutes = require('./routes/api-v1/auth');
const wordRoutes = require('./routes/api-v1/word');

/////////////////////////////////////////////////////////////
// Init app instance
const app = express();

/////////////////////////////////////////////////////////////
// Bodyparser middleware
app.use(bodyParser.json()); // application/json data
// app.use(bodyParser.urlencoded()); // x-www-form-urlencoded <form>

/////////////////////////////////////////////////////////////
// CORS (cross origin resource sharing)
// This middleware must be set up before route configuration
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
// Helmet helps you secure your Express apps by setting various HTTP headers.
app.use(helmet());
// Middleware to compress the traffic (to have a better performance)
app.use(compression());
// Requests logging
const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'access.log'),
    { flags: 'a' }
);
app.use(morgan('combined', { stream: accessLogStream }));
// Use routes
app.use('/apiv1/auth', authRoutes);
app.use('/apiv1/word', wordRoutes);
// 404 route handler
app.use((req, res, next) => {
    res.status(404).json({
        message: 'api does not exist.'
    });
});

/////////////////////////////////////////////////////////////
// Error-handling middleware
app.use((error, req, res, next) => {
    const status = error.statusCode || 500;
    const message = {
        message: error.message,
        array: error.array
    }
    res.status(status).json(message);
});

/////////////////////////////////////////////////////////////
// Mongodb connect
const { mongoURI } = require('./config/keys');
mongoose
    .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('mongodb resource connected'))
    .catch((err) => console.log(`Error occured: ${err}`));

/////////////////////////////////////////////////////////////
// Start app
const { httpPort } = require('./config/keys');
const port = process.env.PORT || httpPort;
const server = app.listen(port, () => console.log(`Server is running on ${port}`));

/////////////////////////////////////////////////////////////
// Shutdown
const stopHandler = () => {
    server && server.close(() => {
        console.log(`Server is stopped on ${port}`)
    });
};

/////////////////////////////////////////////////////////////
process.on('SIGTERM', stopHandler);
process.on('SIGINT', stopHandler);
