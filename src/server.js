const app = require('./app');
const db = require('./db');

const port = process.env.HTTP_PORT;
let server;
let uri;

// Connect to db and start app
db.connect()
    .then((res, err) => {
        if (err)
            throw new Error(err);
        uri = res.uri;
        server = app.listen(port, () => {
            console.log(`Server running on ${port}`);
            console.log(`ENV: ${process.env.NODE_ENV}`);
            console.log(`MONGO: ${uri}`);
        });
    });

// Shutdown
const stopHandler = () => {
    db && db.close()
        .then((res) => {
            console.log(`MongoDB connection closed on: ${res && res.uri ? res.uri : uri}`);
        });

    server && server.close(() => {
        console.log(`Server stopped on ${port}`)
    });
};

// Exit events listener
process.on('SIGTERM', stopHandler);
process.on('SIGINT', stopHandler);