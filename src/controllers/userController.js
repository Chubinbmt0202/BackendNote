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
        const body = req.body && typeof req.body === 'object' ? req.body : {};
        const { email, displayName, photoURL } = body;

        if (typeof email !== 'string' || !email.trim()) {
            return res.status(400).json({
                status: 'error',
                message: 'Email không được để trống'
            });
        }

        if (displayName !== undefined && displayName !== null && typeof displayName !== 'string') {
            return res.status(400).json({
                status: 'error',
                message: 'displayName phải là chuỗi hoặc null'
            });
        }

        if (photoURL !== undefined && photoURL !== null && typeof photoURL !== 'string') {
            return res.status(400).json({
                status: 'error',
                message: 'photoURL phải là chuỗi hoặc null'
            });
        }

        const { data, error } = await userModel.signInWithGoogle({
            email: email.trim(),
            displayName: typeof displayName === 'string' ? displayName.trim() || null : null,
            photoURL: typeof photoURL === 'string' ? photoURL.trim() || null : null
        });

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