const supabase = require('../config/supabase');

const getAllNote = async () => {
    const { data, error } = await supabase
        .from('notes')
        .select(`
            *,
            tags:note_tags (
                tag:tags (*)
            )
        `)
        .eq('is_trashed', false) // Chỉ lấy các note chưa vào thùng rác
        .order('is_pinned', { ascending: false }) // Ưu tiên note được ghim (true) lên trước
        .order('created_at', { ascending: false }); // Note mới nhất lên trước

    // Format lại dữ liệu một chút để Frontend dễ sử dụng hơn
    // (Supabase trả về mảng lồng nhau cho quan hệ Nhiều-Nhiều)
    const formattedData = data?.map(note => ({
        ...note,
        tags: note.tags.map(t => t.tag) // Phẳng hóa (flatten) mảng tags
    }));

    return { data: formattedData, error };
};


module.exports = { getAllNote };