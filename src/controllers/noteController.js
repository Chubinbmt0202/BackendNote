const noteModel = require('../models/noteModel');

// Lấy danh sách ghi chú (hỗ trợ query filter: tag_id, is_trashed, search)
const getAllNotes = async (req, res) => {
    try {
        const userId = req.query.user_id !== undefined ? req.query.user_id : req.query.userId;
        if (userId !== undefined && (typeof userId !== 'string' || !/^[1-9]\d*$/.test(userId))) {
            return res.status(400).json({
                status: 'error',
                message: 'user_id phải là số nguyên dương'
            });
        }

        const { data, error } = await noteModel.getAllNote({
            ...req.query,
            user_id: userId
        });
        if (error) throw error;
        res.status(200).json({
            status: 'success',
            data: data
        });
    } catch (error) {
        console.error("Lỗi Controller getAllNotes:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Lấy chi tiết 1 ghi chú theo ID
const getNoteById = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await noteModel.getNoteById(id);
        if (error) throw error;

        if (!data) {
            return res.status(404).json({
                status: 'error',
                message: 'Không tìm thấy ghi chú'
            });
        }

        res.status(200).json({
            status: 'success',
            data: data
        });
    } catch (error) {
        console.error("Lỗi Controller getNoteById:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Lấy danh sách ghi chú theo tagId
const getAllNoteByTagId = async (req, res) => {
    try {
        const { tagId } = req.params;
        const userId = req.query.user_id !== undefined ? req.query.user_id : req.query.userId;
        if (userId !== undefined && (typeof userId !== 'string' || !/^[1-9]\d*$/.test(userId))) {
            return res.status(400).json({
                status: 'error',
                message: 'user_id phải là số nguyên dương'
            });
        }

        const { data, error } = await noteModel.getNoteByTagId(tagId, userId);
        if (error) throw error;
        res.status(200).json({
            status: 'success',
            data: data
        });
    } catch (error) {
        console.error("Lỗi Controller getAllNoteByTagId:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Thêm mới ghi chú
const createNote = async (req, res) => {
    try {
        const body = req.body || {};
        const { title } = body;
        if (!title || !title.trim()) {
            return res.status(400).json({
                status: 'error',
                message: 'Tiêu đề ghi chú (title) không được để trống'
            });
        }

        const { data, error } = await noteModel.createNote(body);
        if (error) throw error;

        res.status(201).json({
            status: 'success',
            message: 'Tạo ghi chú thành công',
            data: data
        });
    } catch (error) {
        console.error("Lỗi Controller createNote:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Cập nhật thông tin ghi chú
const updateNote = async (req, res) => {
    try {
        const { id } = req.params;
        const body = req.body || {};
        const { data, error } = await noteModel.updateNote(id, body);
        if (error) throw error;

        if (!data) {
            return res.status(404).json({
                status: 'error',
                message: 'Không tìm thấy ghi chú để cập nhật'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Cập nhật ghi chú thành công',
            data: data
        });
    } catch (error) {
        console.error("Lỗi Controller updateNote:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Đưa vào thùng rác / Khôi phục ghi chú
const trashNote = async (req, res) => {
    try {
        const { id } = req.params;
        const body = req.body || {};

        // Nhận is_trashed từ body hoặc query, mặc định là true nếu không truyền
        let isTrashed = true;
        if (body.is_trashed !== undefined) {
            isTrashed = body.is_trashed === true || body.is_trashed === 'true';
        } else if (req.query && req.query.is_trashed !== undefined) {
            isTrashed = req.query.is_trashed === true || req.query.is_trashed === 'true';
        }

        const { data, error } = await noteModel.trashNote(id, isTrashed);
        if (error) throw error;

        res.status(200).json({
            status: 'success',
            message: isTrashed ? 'Đã chuyển ghi chú vào thùng rác' : 'Đã khôi phục ghi chú',
            data: data
        });
    } catch (error) {
        console.error("Lỗi Controller trashNote:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Xóa vĩnh viễn ghi chú
const deleteNote = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await noteModel.deleteNote(id);
        if (error) throw error;

        res.status(200).json({
            status: 'success',
            message: 'Xóa ghi chú thành công',
            data: data
        });
    } catch (error) {
        console.error("Lỗi Controller deleteNote:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

module.exports = {
    getAllNotes,
    getNoteById,
    getAllNoteByTagId,
    createNote,
    updateNote,
    trashNote,
    deleteNote
};