const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');

// Lấy danh sách tất cả ghi chú (hỗ trợ query ?tag_id=...&is_trashed=...&search=...)
router.get('/', noteController.getAllNotes);

// Lấy danh sách ghi chú theo tagId
router.get('/tag/:tagId', noteController.getAllNoteByTagId);

// Lấy chi tiết 1 ghi chú theo id
router.get('/:id', noteController.getNoteById);

// Thêm mới ghi chú
router.post('/', noteController.createNote);

// Chuyển vào thùng rác hoặc khôi phục ghi chú
router.patch('/:id/trash', noteController.trashNote);

// Cập nhật ghi chú (hỗ trợ cả PUT và PATCH)
router.put('/:id', noteController.updateNote);
router.patch('/:id', noteController.updateNote);

// Xóa vĩnh viễn ghi chú
router.delete('/:id', noteController.deleteNote);

module.exports = router;