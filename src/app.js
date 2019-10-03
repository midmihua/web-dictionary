require('dotenv-extended').load();
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
// Requests logging in case of non-test env
const file_name = (process.env.NODE_ENV == 'test') ? 'access.local.log' : 'access.log';
const accessLogStream = fs.createWriteStream(
    path.join(__dirname, file_name),
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
mongoose
    .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log(`mongodb resource connected to: ${process.env.MONGO_URI}`))
    .catch((err) => console.log(`Error occured: ${err}`));

/////////////////////////////////////////////////////////////
// Start app
const port = process.env.HTTP_PORT;
const server = app.listen(port, () => console.log(`Server is running on ${port}`));

/////////////////////////////////////////////////////////////
// Shutdown
const stopHandler = () => {
    server && server.close(() => {
        console.log(`Server is stopped on ${port}`)
    });
    mongoose && mongoose.connection.close(() => {
        console.log(`mongodb resource is closed: ${process.env.MONGO_URI}`)
    });
};

/////////////////////////////////////////////////////////////
process.on('SIGTERM', stopHandler);
process.on('SIGINT', stopHandler);

/////////////////////////////////////////////////////////////
// For testing
module.exports = {
    app,
    stopHandler
};