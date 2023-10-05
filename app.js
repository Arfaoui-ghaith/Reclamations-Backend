const express = require('express');
const app = express();

const userRouter = require('./routes/userRoutes');
const reclamationRouter = require('./routes/reclamationRoutes');

const globalErrorHandler = require('./controllers/errorController.js');
const AppError = require('./utils/appError');

app.use(express.json());

app.use('/api/users', userRouter);
app.use('/api/reclamations', reclamationRouter);

app.all('*', (req, res, next) => {
    next(new AppError(`can't find ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);

module.exports = app;