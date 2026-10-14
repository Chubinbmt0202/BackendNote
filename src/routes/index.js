const express = require('express');
const router = express.Router();
const noteRoutes = require('./noteRoutes');
const userRoutes = require('./userRoutes');

// Gom các router con tại đây
router.use('/users', userRoutes);
router.use('/notes', noteRoutes);

module.exports = router;