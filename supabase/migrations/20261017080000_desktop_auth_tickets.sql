create table if not exists public.desktop_auth_tickets (
    ticket_hash text primary key,
    state_hash text not null,
    code_challenge text not null,
    email text not null,
    display_name text,
    photo_url text,
    expires_at timestamptz not null,
    created_at timestamptz not null default now()
);

create index if not exists desktop_auth_tickets_expires_at_idx
    on public.desktop_auth_tickets (expires_at);

alter table public.desktop_auth_tickets enable row level security;

revoke all on public.desktop_auth_tickets from anon, authenticated;
grant all on public.desktop_auth_tickets to service_role;
