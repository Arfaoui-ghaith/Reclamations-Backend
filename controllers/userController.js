const { PrismaClient } = require('@prisma/client');
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const prisma = new PrismaClient();

exports.getUsers = catchAsync(async (req,res,next) => {
    const users = await prisma.user.findMany({
        where: {
            role: "USER"
        }
    });



    res.status(200).json({
        status: 'success',
        users: users.filter(el => el.id != req.user.id)
    })
})