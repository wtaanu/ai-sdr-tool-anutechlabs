create table if not exists public.learning_videos (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  about text not null,
  tag text,
  youtube_url text not null,
  youtube_video_id text not null,
  embed_url text not null,
  is_published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists learning_videos_published_created_idx
  on public.learning_videos (is_published, created_at desc);
