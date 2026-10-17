const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/login', userController.login);
router.post('/desktop-auth/tickets', userController.createDesktopAuthTicket);
router.post('/desktop-auth/redeem', userController.redeemDesktopAuthTicket);
router.get('/', userController.getUsers);

module.exports = router;