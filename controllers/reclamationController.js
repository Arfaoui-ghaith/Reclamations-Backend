const { PrismaClient } = require('@prisma/client');
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const prisma = new PrismaClient();

const {encrypt, decrypt} = require("../utils/cypher");


exports.addReclaamtion = catchAsync(async(req, res, next) => {
    let { content, subject, sendTo } = req.body;
    if(!content || !subject || !sendTo){
        return next(new AppError('Please provide the reclamation subject and content', 400));
    }

    const userTarget = await prisma.user.findUnique({
        where: {
            id: sendTo
        }
    });

    if(!userTarget){
        return next(new AppError('Target id not exists', 400));
    }

    const cryptedData = encrypt(subject,content);

    console.log(req.user)
    const reclamation = await prisma.reclamation.create({
        data: {
            sendBy: {
                connect: {
                    id: req.user.id
                }
            },
            sendTo: {
                connect: {
                    id: sendTo
                }
            },
            content: cryptedData.content,
            subject: cryptedData.subject,
            ivData: cryptedData.ivData,
            salt: cryptedData.salt
        }
    });

    res.status(201).json({
        status: 'success',
        reclamation
    });
});

exports.getReclamations = catchAsync(async(req, res, next) => {
    let reclamations = await prisma.reclamation.findMany({
        include: { sendBy: true, sendTo: true }
    });


    reclamations = reclamations.map( el => {
        const decryptedData = decrypt({
            subject: el.subject,
            content: el.content,
            ivData: el.ivData,
            salt: el.salt
        });
        return {...el, content: decryptedData.content, subject: decryptedData.subject}
    });

    req.reclamations = reclamations;
    next();
});

exports.filterReclamations = catchAsync(async(req, res, next) => {
    if(req.user.role === "USER"){
        req.reclamations = req.reclamations.filter(el => el.sendBy.id === req.user.id)
    }

    res.status(200).json({
        status: 'success',
        reclamations: req.reclamations
    });
});

exports.deleteReclamation = catchAsync(async(req, res, next) => {
    let reclamation = await prisma.reclamation.delete({
        where: { id: req.params.id }
    });

    res.status(203).json({
        status: 'success'
    });
});

exports.updateReclamation = catchAsync(async(req, res, next) => {

    let reclamation = await prisma.reclamation.update({
        where: { id: req.params.id },
        data: req.body
    });

    res.status(201).json({
        status: 'success',
        reclamation
    });
});