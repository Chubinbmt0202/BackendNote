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


module.exports = { getAllNote };