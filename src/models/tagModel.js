const supabase = require('../config/supabase');

const getAllNotes = async () => {
    const { data, error } = await supabase
        .from('tags')
        .select('*');
    return { data, error };
}

module.exports = { getAllNotes };