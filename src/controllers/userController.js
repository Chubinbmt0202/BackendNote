const userModel = require('../models/userModel');

const getUsers = async (req, res) => {
    try {
        const { data, error } = await userModel.getAllUsers();

        if (error) throw error;

        res.status(200).json({
            status: 'success',
            data: data
        });
    } catch (error) {
        console.error("Lỗi Controller:", error); // Log lỗi ra terminal để dễ debug
        res.status(500).json({ status: 'error', message: error.message });
    }
};

module.exports = { getUsers };