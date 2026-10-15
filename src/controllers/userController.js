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

const login = async (req, res) => {
    try {
        const body = req.body || {};
        console.log('Request body:', body);
        const { email, displayName, photoURL } = body;

        if (!email || !displayName || !photoURL) {
            return res.status(400).json({
                status: 'error',
                message: 'Thiếu thông tin đăng nhập'
            });
        }

        const { data, error } = await userModel.signInWithGoogle({ email, displayName, photoURL });

        if (error) throw error;

        return res.status(200).json({
            status: 'success',
            message: 'Đăng nhập thành công',
            data: data
        });
    } catch (error) {
        console.error('Lỗi Controller login:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Không thể đăng nhập lúc này'
        });
    }
};

module.exports = { getUsers, login };