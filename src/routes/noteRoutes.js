const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');

router.get('/', noteController.getAllNotes);
router.get('/:tagId', noteController.getAllNoteByTagId);

module.exports = router;