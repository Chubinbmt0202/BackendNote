const supabase = require('../config/supabase');

const getAllUsers = async () => {
    // Tên bảng trong supabase của bạn là 'user'
    const { data, error } = await supabase
        .from('user')
        .select('*');

    return { data, error };
};

const signInWithGoogle = async ({ email, displayName, photoURL }) => {
    const { data: existingUser, error: lookupError } = await supabase
        .from('user')
        .select('id')
        .eq('email', email)
        .maybeSingle();

    if (lookupError) return { data: null, error: lookupError };

    const payload = { email, displayName, photoURL };
    const query = existingUser
        ? supabase.from('user').update(payload).eq('id', existingUser.id)
        : supabase.from('user').insert([payload]);

    const { data, error } = await query.select().single();
    return { data, error };
};

module.exports = { getAllUsers, signInWithGoogle };