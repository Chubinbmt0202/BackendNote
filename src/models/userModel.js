const supabase = require('../config/supabase');
const { createSupabaseAdmin } = require('../config/supabaseAdmin');

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

const createDesktopAuthTicket = async (ticket) => {
    const admin = createSupabaseAdmin();
    const { error: cleanupError } = await admin
        .from('desktop_auth_tickets')
        .delete()
        .lt('expires_at', new Date().toISOString());
    if (cleanupError) return { error: cleanupError };

    const { error } = await admin.from('desktop_auth_tickets').insert({
        ticket_hash: ticket.ticketHash,
        state_hash: ticket.stateHash,
        code_challenge: ticket.codeChallenge,
        email: ticket.email,
        display_name: ticket.displayName,
        photo_url: ticket.photoURL,
        expires_at: ticket.expiresAt
    });
    return { error };
};

const consumeDesktopAuthTicket = async ({ ticketHash, stateHash, codeChallenge }) => {
    const admin = createSupabaseAdmin();
    const { data, error } = await admin
        .from('desktop_auth_tickets')
        .delete()
        .eq('ticket_hash', ticketHash)
        .eq('state_hash', stateHash)
        .eq('code_challenge', codeChallenge)
        .gt('expires_at', new Date().toISOString())
        .select('email, display_name, photo_url')
        .maybeSingle();
    return { data, error };
};

module.exports = {
    getAllUsers,
    signInWithGoogle,
    createDesktopAuthTicket,
    consumeDesktopAuthTicket
};