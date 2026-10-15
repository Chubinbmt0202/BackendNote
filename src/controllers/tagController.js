const tagModel = require('../models/tagModel');

// Lấy tất cả tags
const getAllTags = async (req, res) => {
    try {
        const { user_id } = req.query;

        if (user_id !== undefined && !/^[1-9]\d*$/.test(user_id)) {
            return res.status(400).json({
                status: 'error',
                message: 'user_id phải là số nguyên dương'
            });
        }

        const { data, error } = await tagModel.getAllTags({ user_id });
        if (error) throw error;

        res.status(200).json({
            status: 'success',
            data: data
        });
    } catch (error) {
        console.error("Lỗi Controller getAllTags:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Lấy thông tin 1 tag theo ID
const getTagById = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await tagModel.getTagById(id);
        if (error) throw error;

        if (!data) {
            return res.status(404).json({
                status: 'error',
                message: 'Không tìm thấy tag'
            });
        }

        res.status(200).json({
            status: 'success',
            data: data
        });
    } catch (error) {
        console.error("Lỗi Controller getTagById:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Thêm tag mới
const createTag = async (req, res) => {
    try {
        const body = req.body || {};
        const { name } = body;
        if (!name || !name.trim()) {
            return res.status(400).json({
                status: 'error',
                message: 'Tên tag (name) không được để trống'
            });
        }

        const { data, error } = await tagModel.createTag(body);
        if (error) throw error;

        res.status(201).json({
            status: 'success',
            message: 'Tạo tag thành công',
            data: data
        });
    } catch (error) {
        console.error("Lỗi Controller createTag:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Cập nhật tag theo ID
const updateTag = async (req, res) => {
    try {
        const { id } = req.params;
        const body = req.body || {};
        const { data, error } = await tagModel.updateTag(id, body);
        if (error) throw error;

        if (!data) {
            return res.status(404).json({
                status: 'error',
                message: 'Không tìm thấy tag để cập nhật'
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Cập nhật tag thành công',
            data: data
        });
    } catch (error) {
        console.error("Lỗi Controller updateTag:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

// Xóa tag theo ID
const deleteTag = async (req, res) => {
    try {
        const { id } = req.params;
        const { data, error } = await tagModel.deleteTag(id);
        if (error) throw error;

        res.status(200).json({
            status: 'success',
            message: 'Xóa tag thành công',
            data: data
        });
    } catch (error) {
        console.error("Lỗi Controller deleteTag:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};

module.exports = {
    getAllTags,
    getTagById,
    createTag,
    updateTag,
    deleteTag
};