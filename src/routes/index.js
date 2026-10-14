const express = require('express');
const router = express.Router();

const userRoutes = require('./userRoutes');

// Gom các router con tại đây
router.use('/users', userRoutes);

module.exports = router;