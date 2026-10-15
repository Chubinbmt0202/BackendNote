const express = require('express');
const router = express.Router();
const tagController = require('../controllers/tagController');

// Lấy tất cả tags
router.get('/', tagController.getAllTags);

// Lấy chi tiết tag theo ID
router.get('/:id', tagController.getTagById);

// Thêm tag mới
router.post('/', tagController.createTag);

// Cập nhật tag (hỗ trợ cả PUT và PATCH)
router.put('/:id', tagController.updateTag);
router.patch('/:id', tagController.updateTag);

// Xóa tag theo ID
router.delete('/:id', tagController.deleteTag);

module.exports = router;