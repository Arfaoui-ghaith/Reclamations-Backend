const express = require('express');
const router = express.Router();
const authController = require('./../controllers/authContoller');
const reclamationController = require('./../controllers/reclamationController');

router.use(authController.protect)

router.route('/')
    .get(reclamationController.getReclamations,reclamationController.filterReclamations)
    .post(reclamationController.addReclaamtion)

router.route('/:id')
    .put(reclamationController.updateReclamation)
    .delete(reclamationController.deleteReclamation)

module.exports = router;