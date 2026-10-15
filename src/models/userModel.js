const supabase = require('../config/supabase');

const getAllUsers = async () => {
    // Tên bảng trong supabase của bạn là 'user'
    const { data, error } = await supabase
        .from('user')
        .select('*');

    return { data, error };
};

const signInWithGoogle = async (email, displayName, photoURL) => {
    // thêm dữ liệu vào bảng 'user' trong supabase
    const payload = {
        email: email,
        displayName: displayName,
        photoURL: photoURL,
    };
    const { data, error } = await supabase
        .from('user')
        .insert([payload]);


    return { data, error };
};

module.exports = { getAllUsers, signInWithGoogle };