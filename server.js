const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
    console.log(err);
    console.log('UNCAUGHT EXCEPTION! Shutting down....');
    process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
    console.log(`App running on Port ${port}`);
});

process.on('unHandledRejection', (err) => {
    console.log(err.name, err.message);
    console.log('UNHANDLER REJECTION! Shutting down....');
    server.close(() => {
        process.exit(1);
    });
});