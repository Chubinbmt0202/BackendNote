const supabase = require('../config/supabase');

const getAllNote = async () => {
    const { data, error } = await supabase
        .from('notes')
        .select(`
            *,
            tag:tags (*) 
        `)
        .eq('is_trashed', false)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

    return { data, error };
};

const getNoteByTagId = async (tagId) => {
    const { data, error } = await supabase
        .from('notes')
        .select(`
            *,
            tag:tags (*)
        `)
        .eq('is_trashed', false) // Bỏ qua ghi chú trong thùng rác
        .eq('tag_id', tagId)     // <--- LỌC THEO TAG_ID TẠI ĐÂY
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

    return { data, error };
}


module.exports = { getAllNote, getNoteByTagId };