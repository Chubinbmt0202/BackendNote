const trashModel = require('../models/trashModel');

// Lấy danh sách thùng rác
const getAllTrash = async (req, res) => {
    try {
        const { data, error } = await trashModel.getAllTrash(req.query);
        if (error) throw error;

        res.status(200).json({
            status: 'success',
            data: data
        });
    } catch (error) {
        console.error("Lỗi Controller getAllTrash:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Lấy chi tiết 1 mục trong thùng rác
const getTrashById = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await trashModel.getTrashById(id);
        if (error) throw error;

        if (!data) {
            return res.status(404).json({
                status: 'error',
                message: 'Không tìm thấy mục trong thùng rác'
            });
        }

        res.status(200).json({
            status: 'success',
            data: data
        });
    } catch (error) {
        console.error("Lỗi Controller getTrashById:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Khôi phục mục từ thùng rác
const restoreItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await trashModel.restoreTrashItem(id);
        if (error) throw error;

        res.status(200).json({
            status: 'success',
            message: 'Đã khôi phục thành công',
            data: data
        });
    } catch (error) {
        console.error("Lỗi Controller restoreItem:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Xóa vĩnh viễn 1 mục khỏi thùng rác
const deleteItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await trashModel.deleteTrashItem(id);
        if (error) throw error;

        res.status(200).json({
            status: 'success',
            message: 'Đã xóa vĩnh viễn mục khỏi thùng rác',
            data: data
        });
    } catch (error) {
        console.error("Lỗi Controller deleteItem:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Làm rỗng toàn bộ thùng rác
const emptyTrash = async (req, res) => {
    try {
        const userId = req.query.user_id || null;
        const { data, error } = await trashModel.emptyTrash(userId);
        if (error) throw error;

        res.status(200).json({
            status: 'success',
            message: 'Đã dọn sạch thùng rác',
            data: data
        });
    } catch (error) {
        console.error("Lỗi Controller emptyTrash:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

module.exports = {
    getAllTrash,
    getTrashById,
    restoreItem,
    deleteItem,
    emptyTrash
};
