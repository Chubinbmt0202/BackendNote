const express = require('express');
const router = express.Router();
const noteRoutes = require('./noteRoutes');
const userRoutes = require('./userRoutes');
const tagRoutes = require('./tagRoutes');
// Gom các router con tại đây
router.use('/users', userRoutes);
router.use('/notes', noteRoutes);
router.use('/tags', tagRoutes);
module.exports = router;