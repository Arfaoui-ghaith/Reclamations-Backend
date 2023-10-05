const { PrismaClient } = require('@prisma/client');
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const prisma = new PrismaClient();
const rc4 = require('arc4');

// Create an RC4 cipher with a secret key
function createRc4Cipher(secretKey) {
    return rc4('arc4', secretKey);
}

// Encrypt a plaintext string using RC4
function encryptWithRc4(cipher, plaintext) {
    return cipher.encodeString(plaintext, 'utf8', 'hex');
}

// Decrypt a ciphertext string using RC4
function decryptWithRc4(cipher, ciphertext) {
    return cipher.decodeString(ciphertext, 'hex', 'utf8');
}

const secretKey = 'tek-up'; // Replace with your RC4 secret key
const cipher = createRc4Cipher(secretKey);

exports.addReclaamtion = catchAsync(async(req, res, next) => {
    let { text, title, target } = req.body;
    if(!text || !title || !target){
        return next(new AppError('Please provide the reclamation content', 400));
    }

    const userTarget = await prisma.user.findUnique({
        where: {
            id: target
        }
    });

    if(!userTarget){
        return next(new AppError('Target id not exists', 400));
    }

    const reclamation = await prisma.reclamation.create({
        data: {
            user: {
                connect: {
                    id: req.user.id
                }
            },
            text: encryptWithRc4(cipher,text),
            title,
            target
        }
    });

    res.status(201).json({
        status: 'success',
        reclamation
    });
});

exports.getReclamations = catchAsync(async(req, res, next) => {
    let reclamations = await prisma.reclamation.findMany({
        include: { user: true }
    });

    reclamations = await Promise.all(reclamations.map(async el => {
        const targetUser = await prisma.user.findUnique({
            where: {id: el.target}
        });

        return {...el, text: decryptWithRc4(cipher,el.text),targetUser}
    }));

    req.reclamations = reclamations;
    next();
});

exports.filterReclamations = catchAsync(async(req, res, next) => {
    if(req.user.role === "USER"){
        req.reclamations = req.reclamations.filter(el => el.userId === req.user.id)
    }
    res.status(200).json({
        status: 'success',
        reclamations: req.reclamations
    });
});