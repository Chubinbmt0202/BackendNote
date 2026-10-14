const supabase = require('../config/supabase');

const getAllUsers = async () => {
    // Tên bảng trong supabase của bạn là 'user'
    const { data, error } = await supabase
        .from('user')
        .select('*');

    return { data, error };
};

module.exports = { getAllUsers };