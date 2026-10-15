const supabase = require('../config/supabase');

// Lấy tất cả tags (hỗ trợ lọc theo user_id)
const getAllTags = async (filters = {}) => {
    let query = supabase
        .from('tags')
        .select('*');

    if (filters.user_id) {
        query = query.eq('user_id', filters.user_id);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;
    return { data, error };
};

// Lấy chi tiết tag theo ID
const getTagById = async (id) => {
    const { data, error } = await supabase
        .from('tags')
        .select('*')
        .eq('id', id)
        .single();

    return { data, error };
};

// Tạo mới tag (tuân thủ schema: user_id bigint NOT NULL, name varchar NOT NULL, color varchar DEFAULT '#3b82f6')
const createTag = async (data) => {
    const payload = {
        user_id: data.user_id || 1, // user_id bigint NOT NULL
        name: data.name             // name character varying NOT NULL
    };

    // Nếu người dùng cung cấp color thì lưu, nếu không để PostgreSQL sử dụng DEFAULT '#3b82f6'
    if (data.color && data.color.trim() !== '') {
        payload.color = data.color.trim();
    }

    const { data: newTag, error } = await supabase
        .from('tags')
        .upsert([payload], { onConflict: 'user_id,name' })
        .select('*')
        .single();

    return { data: newTag, error };
};

const getOrCreateTag = async (userId, name) => {
    const { data, error } = await supabase
        .from('tags')
        .upsert([{ user_id: userId, name }], { onConflict: 'user_id,name' })
        .select('*')
        .single();

    return { data, error };
};

// Cập nhật thông tin tag
const updateTag = async (id, data) => {
    const payload = {};
    if (data.name !== undefined) payload.name = data.name;
    if (data.color !== undefined) payload.color = data.color;

    const { data: updatedTag, error } = await supabase
        .from('tags')
        .update(payload)
        .eq('id', id)
        .select('*')
        .single();

    return { data: updatedTag, error };
};

// Xóa tag theo ID
// Lưu ý: bảng notes có CONSTRAINT notes_tag_id_fkey FOREIGN KEY (tag_id) REFERENCES public.tags(id)
// Do không có ON DELETE CASCADE hay ON DELETE SET NULL trong schema DDL,
// ta cần set tag_id = null cho các note đang gắn tag này trước để tránh vi phạm khóa ngoại.
const deleteTag = async (id) => {
    await supabase
        .from('notes')
        .update({ tag_id: null })
        .eq('tag_id', id);

    const { data, error } = await supabase
        .from('tags')
        .delete()
        .eq('id', id)
        .select();

    return { data, error };
};

module.exports = {
    getAllTags,
    getAllNotes: getAllTags,
    getTagById,
    createTag,
    getOrCreateTag,
    updateTag,
    deleteTag
};