const express = require('express');
const router = express.Router();
const authController = require('./../controllers/authContoller');
const userController = require('./../controllers/userController');

router.route('/signup').post(authController.signup);
router.route('/signin').post(authController.login);

router.route('/').get(userController.getUsers);

module.exports = router;