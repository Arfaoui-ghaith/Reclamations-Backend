const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN});
}

exports.signup = catchAsync(async(req, res, next) => {
    const newUser = await User.create(req.body);

    const token = signToken(newUser._id);

    res.status(201).json({
        status: 'success',
        token,
        user: newUser
    });
});


exports.login = catchAsync( async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    if(!email || !password){
        return next(new AppError('Please provide email and password', 400));
    }

    const user = await User.findOne({email});
    const correct = await user.schema.methods.correctPassword(password, user.password);


    if(!correct || !user){
        return next(new AppError('Incorrect email or password', 401));
    }

    const token = signToken(user._id);
    res.status(200).json({
        status: 'success',
        token
    });
});

exports.protect = catchAsync(async (req, res, next) => {

    let token;
    if( req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
        token = req.headers.authorization.split(' ')[1];
    }

    if(!token){
        return next(new AppError('You not logged in! Please log in to get access.', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const freshUser = await User.findById(decoded.id);
    if(!freshUser){
        return next(new AppError('The user belonging to this token does no longer exit.', 401));
    }

    /*if(freshUser.changedPasswordAfter(decoded.iat)){
        return next(
            new AppError('User recently changed password! Please log in again.', 401)
        );
    }*/

    req.user = freshUser;
    next();
});


exports.restrictTo = (...roles) => {

    return (req, res, next) => {
        if(!roles.includes(req.user.role)) {
            console.log('restrictTo loading...');
            return next(new AppError('You do not have permission to perform this action', 403));
        }

        next();
    }
}