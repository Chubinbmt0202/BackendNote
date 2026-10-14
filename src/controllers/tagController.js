const tagModel = require('../models/tagModel');

const getAllTags = async (req, res) => {
    try {
        const { data, error } = await tagModel.getAllNotes();

        if (error) throw error;
        res.status(200).json({
            status: 'success',
            data: data
        });
    } catch (error) {
        console.error("Lỗi Controller:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
}

module.exports = { getAllTags }