const express = require('express');
const router = express.Router();
const trashController = require('../controllers/trashController');

// Lấy danh sách các mục trong thùng rác (?user_id=...&item_type=note)
router.get('/', trashController.getAllTrash);

// Xóa rỗng toàn bộ thùng rác
router.delete('/empty', trashController.emptyTrash);

// Lấy chi tiết 1 mục trong thùng rác
router.get('/:id', trashController.getTrashById);

// Khôi phục mục từ thùng rác
router.post('/:id/restore', trashController.restoreItem);

// Xóa vĩnh viễn 1 mục khỏi thùng rác
router.delete('/:id', trashController.deleteItem);

module.exports = router;
