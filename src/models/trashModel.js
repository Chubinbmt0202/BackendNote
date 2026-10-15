const supabase = require('../config/supabase');

// Lấy danh sách các mục trong thùng rác
const getAllTrash = async (filters = {}) => {
    const { user_id, item_type } = filters;

    let query = supabase
        .from('trash')
        .select('*');

    if (user_id) {
        query = query.eq('user_id', user_id);
    }

    if (item_type) {
        query = query.eq('item_type', item_type);
    }

    query = query.order('trashed_at', { ascending: false });

    const { data, error } = await query;
    return { data, error };
};

// Lấy chi tiết mục trong thùng rác theo id
const getTrashById = async (id) => {
    const { data, error } = await supabase
        .from('trash')
        .select('*')
        .eq('id', id)
        .single();

    return { data, error };
};

// Khôi phục mục từ thùng rác
const restoreTrashItem = async (trashId) => {
    // 1. Lấy thông tin bản ghi trong trash
    const { data: trashItem, error: fetchErr } = await supabase
        .from('trash')
        .select('*')
        .eq('id', trashId)
        .single();

    if (fetchErr || !trashItem) {
        return { data: null, error: fetchErr || new Error('Không tìm thấy mục trong thùng rác') };
    }

    // 2. Khôi phục lại bản ghi gốc tương ứng theo item_type
    if (trashItem.item_type === 'note') {
        const { error: noteErr } = await supabase
            .from('notes')
            .update({
                is_trashed: false,
                trashed_at: null,
                updated_at: new Date().toISOString()
            })
            .eq('id', trashItem.item_id);

        if (noteErr) return { data: null, error: noteErr };
    } else if (trashItem.item_type === 'calendar_event') {
        // Dự phòng nếu có sự kiện lịch
        await supabase
            .from('calendar_events')
            .update({ is_trashed: false })
            .eq('id', trashItem.item_id);
    }

    // 3. Xóa bản ghi khỏi bảng trash
    const { data, error } = await supabase
        .from('trash')
        .delete()
        .eq('id', trashId)
        .select()
        .single();

    return { data: trashItem, error };
};

// Xóa vĩnh viễn 1 mục khỏi thùng rác
const deleteTrashItem = async (trashId) => {
    // 1. Lấy thông tin bản ghi để biết item_id và item_type
    const { data: trashItem, error: fetchErr } = await supabase
        .from('trash')
        .select('*')
        .eq('id', trashId)
        .single();

    if (fetchErr || !trashItem) {
        return { data: null, error: fetchErr || new Error('Không tìm thấy mục trong thùng rác') };
    }

    // 2. Xóa khỏi bảng gốc (notes, calendar_events)
    if (trashItem.item_type === 'note') {
        await supabase
            .from('notes')
            .delete()
            .eq('id', trashItem.item_id);
    } else if (trashItem.item_type === 'calendar_event') {
        await supabase
            .from('calendar_events')
            .delete()
            .eq('id', trashItem.item_id);
    }

    // 3. Xóa khỏi bảng trash
    const { data, error } = await supabase
        .from('trash')
        .delete()
        .eq('id', trashId)
        .select()
        .single();

    return { data, error };
};

// Dọn sạch toàn bộ thùng rác (xóa tất cả item trong trash và bảng gốc)
const emptyTrash = async (userId = null) => {
    let query = supabase.from('trash').select('*');
    if (userId) query = query.eq('user_id', userId);

    const { data: items, error: fetchErr } = await query;
    if (fetchErr) return { error: fetchErr };

    if (items && items.length > 0) {
        const noteIds = items.filter(i => i.item_type === 'note').map(i => i.item_id);
        if (noteIds.length > 0) {
            await supabase.from('notes').delete().in('id', noteIds);
        }

        let delQuery = supabase.from('trash').delete();
        if (userId) delQuery = delQuery.eq('user_id', userId);
        else delQuery = delQuery.neq('id', '00000000-0000-0000-0000-000000000000'); // delete all

        await delQuery;
    }

    return { data: { count: items ? items.length : 0 }, error: null };
};

module.exports = {
    getAllTrash,
    getTrashById,
    restoreTrashItem,
    deleteTrashItem,
    emptyTrash
};
