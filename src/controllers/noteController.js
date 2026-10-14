const noteModel = require('../models/noteModel');

const getAllNotes = async (req, res) => {
    try {
        const { data, error } = await noteModel.getAllNote();
        if (error) throw error;
        res.status(200).json({
            status: 'success',
            data: data
        });
    } catch (error) {
        console.error("Lỗi Controller:", error);
        res.status(500).json({ status: 'error', message: error.message });
    }
};
const getAllNoteByTagId = async (req, res) => {
    try {
        const { tagId } = req.params;
        console.log("'''''TagId'''''''", tagId);
        const { data, error } = await noteModel.getNoteByTagId(tagId);
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
module.exports = { getAllNotes, getAllNoteByTagId };