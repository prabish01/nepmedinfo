-- Nepal Med Info: content schema for the CMS.
-- Run in the Supabase SQL editor (or `supabase db push`). Safe to run once on a fresh project.

create extension if not exists pg_trgm;

-- ---------------------------------------------------------------------------
-- Staff profiles. Every auth user gets a profile; only role admin/editor can write content.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'none' check (role in ('admin', 'editor', 'none')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data ->> 'full_name', ''))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'editor'));
$$;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- ---------------------------------------------------------------------------
-- Authors and medical reviewers (E-E-A-T). Localised text lives in jsonb {"en": "...", "ne": "..."}.
-- ---------------------------------------------------------------------------
create table if not exists public.authors (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name jsonb not null default '{}'::jsonb,
  credentials text,                       -- e.g. "MBBS, MD (Internal Medicine)"
  job_title jsonb not null default '{}'::jsonb,
  bio jsonb not null default '{}'::jsonb,
  avatar_url text,
  avatar_alt jsonb not null default '{}'::jsonb,
  nmc_number text,                        -- Nepal Medical Council registration, shown on reviewer pages
  same_as text[] not null default '{}',   -- profile URLs for schema.org sameAs
  is_reviewer boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Article categories.
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name jsonb not null default '{}'::jsonb,
  description jsonb not null default '{}'::jsonb,
  sort integer not null default 0,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Media library. Alt text is required per language and reused wherever the image is placed.
-- ---------------------------------------------------------------------------
create table if not exists public.media (
  id uuid primary key default gen_random_uuid(),
  path text not null unique,
  url text not null,
  alt jsonb not null default '{}'::jsonb,
  caption jsonb not null default '{}'::jsonb,
  credit text,
  width integer,
  height integer,
  mime text,
  size_bytes integer,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Entries: one row per article / disease / drug. Language versions live in entry_translations.
-- ---------------------------------------------------------------------------
create table if not exists public.entries (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('article', 'disease', 'drug')),
  status text not null default 'draft' check (status in ('draft', 'review', 'published', 'archived')),
  category_id uuid references public.categories (id) on delete set null,
  author_id uuid references public.authors (id) on delete set null,
  reviewer_id uuid references public.authors (id) on delete set null,
  cover_url text,
  cover_width integer,
  cover_height integer,
  cover_credit text,
  featured boolean not null default false,
  published_at timestamptz,
  reviewed_at date,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists entries_type_status_idx on public.entries (type, status, published_at desc);

-- array_to_string() is only STABLE, which a generated column rejects; this wrapper is safe to mark IMMUTABLE for text[].
create or replace function public.entry_search_vector(title text, excerpt text, aka text[])
returns tsvector language sql immutable parallel safe as $$
  select to_tsvector('simple'::regconfig, coalesce(title, '') || ' ' || coalesce(excerpt, '') || ' ' || coalesce(array_to_string(aka, ' '), ''));
$$;

create table if not exists public.entry_translations (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null references public.entries (id) on delete cascade,
  locale text not null check (locale in ('en', 'ne')),
  slug text not null,
  title text not null,
  excerpt text not null default '',
  body_html text not null default '',
  key_points text[] not null default '{}',
  faqs jsonb not null default '[]'::jsonb,       -- [{ "q": "...", "a": "..." }]
  sources jsonb not null default '[]'::jsonb,    -- [{ "title": "...", "url": "...", "publisher": "..." }]
  also_known_as text[] not null default '{}',    -- alternate names (schema.org alternateName, search)
  meta_title text,
  meta_description text,
  focus_keyword text,
  og_title text,
  og_description text,
  og_image_url text,
  cover_alt text,
  canonical_url text,
  noindex boolean not null default false,
  is_ready boolean not null default true,       -- a language version can stay hidden while the entry is live
  word_count integer not null default 0,
  search_text tsvector generated always as (public.entry_search_vector(title, excerpt, also_known_as)) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (entry_id, locale),
  unique (locale, slug)
);
create index if not exists entry_translations_search_idx on public.entry_translations using gin (search_text);
create index if not exists entry_translations_title_trgm on public.entry_translations using gin (title gin_trgm_ops);

-- Keep updated_at honest.
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

drop trigger if exists entries_touch on public.entries;
create trigger entries_touch before update on public.entries for each row execute function public.touch_updated_at();
drop trigger if exists entry_translations_touch on public.entry_translations;
create trigger entry_translations_touch before update on public.entry_translations for each row execute function public.touch_updated_at();
drop trigger if exists authors_touch on public.authors;
create trigger authors_touch before update on public.authors for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------------
-- Row level security
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.authors enable row level security;
alter table public.categories enable row level security;
alter table public.media enable row level security;
alter table public.entries enable row level security;
alter table public.entry_translations enable row level security;

drop policy if exists "profiles read own" on public.profiles;
create policy "profiles read own" on public.profiles for select using (id = auth.uid() or public.is_admin());
drop policy if exists "profiles admin write" on public.profiles;
create policy "profiles admin write" on public.profiles for update using (public.is_admin()) with check (public.is_admin());

-- Public read for reference tables.
drop policy if exists "authors public read" on public.authors;
create policy "authors public read" on public.authors for select using (true);
drop policy if exists "categories public read" on public.categories;
create policy "categories public read" on public.categories for select using (true);
drop policy if exists "media public read" on public.media;
create policy "media public read" on public.media for select using (true);

-- Published entries are public; staff see everything.
drop policy if exists "entries public read" on public.entries;
create policy "entries public read" on public.entries for select
  using ((status = 'published' and published_at <= now()) or public.is_staff());
drop policy if exists "translations public read" on public.entry_translations;
create policy "translations public read" on public.entry_translations for select
  using (
    public.is_staff()
    or (is_ready and exists (
      select 1 from public.entries e
      where e.id = entry_id and e.status = 'published' and e.published_at <= now()
    ))
  );

-- Staff write access.
do $$
declare t text;
begin
  foreach t in array array['authors', 'categories', 'media', 'entries', 'entry_translations'] loop
    execute format('drop policy if exists "%1$s staff insert" on public.%1$s', t);
    execute format('create policy "%1$s staff insert" on public.%1$s for insert with check (public.is_staff())', t);
    execute format('drop policy if exists "%1$s staff update" on public.%1$s', t);
    execute format('create policy "%1$s staff update" on public.%1$s for update using (public.is_staff()) with check (public.is_staff())', t);
    execute format('drop policy if exists "%1$s staff delete" on public.%1$s', t);
    execute format('create policy "%1$s staff delete" on public.%1$s for delete using (public.is_staff())', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Storage bucket for uploaded images (public read, staff write).
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif', 'image/svg+xml'])
on conflict (id) do update set public = true;

drop policy if exists "media bucket public read" on storage.objects;
create policy "media bucket public read" on storage.objects for select using (bucket_id = 'media');
drop policy if exists "media bucket staff insert" on storage.objects;
create policy "media bucket staff insert" on storage.objects for insert with check (bucket_id = 'media' and public.is_staff());
drop policy if exists "media bucket staff update" on storage.objects;
create policy "media bucket staff update" on storage.objects for update using (bucket_id = 'media' and public.is_staff());
drop policy if exists "media bucket staff delete" on storage.objects;
create policy "media bucket staff delete" on storage.objects for delete using (bucket_id = 'media' and public.is_staff());

-- ---------------------------------------------------------------------------
-- Flat read model for the public site. security_invoker keeps RLS in force.
-- ---------------------------------------------------------------------------
create or replace view public.published_entries with (security_invoker = true) as
select
  t.id as translation_id, t.entry_id, e.type, t.locale, t.slug, t.title, t.excerpt, t.cover_alt,
  t.also_known_as, t.word_count, t.noindex, t.updated_at as translation_updated_at,
  e.cover_url, e.cover_width, e.cover_height, e.featured, e.published_at, e.updated_at,
  e.reviewed_at, e.category_id, e.author_id, e.reviewer_id
from public.entry_translations t
join public.entries e on e.id = t.entry_id
where e.status = 'published' and e.published_at <= now() and t.is_ready;

grant select on public.published_entries to anon, authenticated;

-- ---------------------------------------------------------------------------
-- Site search across published translations of one language.
-- ---------------------------------------------------------------------------
create or replace function public.search_entries(q text, lang text, max_results int default 30)
returns table (entry_id uuid, type text, slug text, title text, excerpt text, rank real)
language sql stable as $$
  select t.entry_id, e.type, t.slug, t.title, t.excerpt,
    greatest(
      ts_rank(t.search_text, websearch_to_tsquery('simple', q)),
      similarity(t.title, q)
    )::real as rank
  from public.entry_translations t
  join public.entries e on e.id = t.entry_id
  where t.locale = lang
    and t.is_ready
    and e.status = 'published' and e.published_at <= now()
    and (
      t.search_text @@ websearch_to_tsquery('simple', q)
      or t.title ilike '%' || q || '%'
      or similarity(t.title, q) > 0.2
      or exists (select 1 from unnest(t.also_known_as) a where a ilike '%' || q || '%')
    )
  order by rank desc
  limit max_results;
$$;

-- After creating your first user in Authentication > Users, make them an admin:
--   update public.profiles set role = 'admin' where email = 'you@example.com';
