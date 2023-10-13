const { PrismaClient } = require('@prisma/client');
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const prisma = new PrismaClient();

exports.getUsers = catchAsync(async (req,res,next) => {
    const users = await prisma.user.findMany({
        where: {
            role: "USER", NOT: { id: req.user.id }
        }
    });



    res.status(200).json({
        status: 'success',
        users
    })
})