const supabase = require('../config/supabase');

// Lấy danh sách ghi chú (hỗ trợ lọc theo user_id, tag_id, is_trashed, search)
const getAllNote = async (filters = {}) => {
    const { user_id, tag_id, is_trashed, search } = filters;

    let query = supabase
        .from('notes')
        .select(`
            *,
            tag:tags (*) 
        `);

    // Lọc theo người dùng (bảng notes có user_id bigint NOT NULL)
    if (user_id) {
        query = query.eq('user_id', user_id);
    }

    // Lọc theo trạng thái thùng rác (mặc định lấy ghi chú chưa chuyển vào thùng rác)
    if (is_trashed !== undefined) {
        query = query.eq('is_trashed', is_trashed === 'true' || is_trashed === true);
    } else {
        query = query.eq('is_trashed', false);
    }

    // Lọc theo tag
    if (tag_id) {
        query = query.eq('tag_id', tag_id);
    }

    // Tìm kiếm từ khóa theo title hoặc content
    if (search) {
        query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    query = query
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

    const { data, error } = await query;
    return { data, error };
};

// Lấy chi tiết 1 ghi chú theo ID
const getNoteById = async (id) => {
    const { data, error } = await supabase
        .from('notes')
        .select(`
            *,
            tag:tags (*)
        `)
        .eq('id', id)
        .single();

    return { data, error };
};

// Lấy danh sách ghi chú theo tagId
const getNoteByTagId = async (tagId, userId = null) => {
    let query = supabase
        .from('notes')
        .select(`
            *,
            tag:tags (*)
        `)
        .eq('is_trashed', false)
        .eq('tag_id', tagId);

    if (userId) {
        query = query.eq('user_id', userId);
    }

    query = query
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

    const { data, error } = await query;
    return { data, error };
};

// Tạo mới ghi chú
const createNote = async (data) => {
    // Chuẩn hóa dữ liệu theo đúng schema DB
    const payload = {
        user_id: data.user_id || 1, // user_id bigint NOT NULL
        title: data.title,          // title text NOT NULL
        content: data.content !== undefined ? data.content : null,
        // Nếu truyền tag_id là chuỗi rỗng "" thì ép về null để không bị lỗi UUID syntax
        tag_id: data.tag_id && data.tag_id.trim() !== '' ? data.tag_id : null
    };

    if (data.category) payload.category = data.category; // default 'General'
    if (data.is_pinned !== undefined) payload.is_pinned = data.is_pinned; // default false
    if (data.is_trashed !== undefined) payload.is_trashed = data.is_trashed; // default false

    const { data: newNote, error } = await supabase
        .from('notes')
        .insert([payload])
        .select(`
            *,
            tag:tags (*)
        `)
        .single();

    return { data: newNote, error };
};

// Cập nhật ghi chú theo ID
const updateNote = async (id, data) => {
    const payload = {
        ...data,
        updated_at: new Date().toISOString()
    };

    // Loại bỏ id nếu vô tình truyền lên
    delete payload.id;
    delete payload.created_at;

    // Chuẩn hóa tag_id nếu là chuỗi rỗng
    if (payload.tag_id !== undefined) {
        payload.tag_id = payload.tag_id && payload.tag_id.trim() !== '' ? payload.tag_id : null;
    }

    const { data: updatedNote, error } = await supabase
        .from('notes')
        .update(payload)
        .eq('id', id)
        .select(`
            *,
            tag:tags (*)
        `)
        .single();

    return { data: updatedNote, error };
};

// Chuyển ghi chú vào/ra thùng rác và đồng bộ với bảng trash
const trashNote = async (id, isTrashed = true) => {
    const now = new Date().toISOString();

    // 1. Cập nhật trạng thái trong bảng notes
    const updatePayload = {
        is_trashed: isTrashed,
        trashed_at: isTrashed ? now : null,
        updated_at: now
    };

    const { data: updatedNote, error } = await supabase
        .from('notes')
        .update(updatePayload)
        .eq('id', id)
        .select(`
            *,
            tag:tags (*)
        `)
        .single();

    if (error) return { data: null, error };

    // 2. Đồng bộ hóa với bảng trash theo đúng schema
    try {
        if (isTrashed && updatedNote) {
            // Kiểm tra xem đã có trong bảng trash chưa
            const { data: existingTrash } = await supabase
                .from('trash')
                .select('id')
                .eq('item_id', id)
                .maybeSingle();

            if (!existingTrash) {
                // Thêm vào bảng trash
                await supabase.from('trash').insert([{
                    user_id: updatedNote.user_id,
                    item_type: 'note',
                    item_id: updatedNote.id,
                    title: updatedNote.title,
                    original_data: updatedNote,
                    trashed_at: now
                    // expires_at sẽ tự động tính = now + 30 days nhờ DEFAULT trong DB
                }]);
            }
        } else {
            // Khi khôi phục: xóa khỏi bảng trash
            await supabase
                .from('trash')
                .delete()
                .eq('item_id', id);
        }
    } catch (trashErr) {
        console.warn('Lỗi đồng bộ bảng trash:', trashErr);
    }

    return { data: updatedNote, error: null };
};

// Xóa vĩnh viễn ghi chú theo ID (xóa trong notes và xóa cả trong bảng trash)
const deleteNote = async (id) => {
    // 1. Xóa trong bảng trash nếu có
    await supabase
        .from('trash')
        .delete()
        .eq('item_id', id);

    // 2. Xóa trong bảng notes
    const { data, error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .select();

    return { data, error };
};

module.exports = {
    getAllNote,
    getAllNotes: getAllNote,
    getNoteById,
    getNoteByTagId,
    createNote,
    updateNote,
    trashNote,
    deleteNote
};