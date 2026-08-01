create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 120),
  niche text,
  target_audience text,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.competitors (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  youtube_channel_id text,
  channel_url text not null,
  channel_name text,
  status text not null default 'pending' check (status in ('pending', 'active', 'failed')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (project_id, channel_url)
);

create table public.videos (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  competitor_id uuid references public.competitors(id) on delete set null,
  youtube_video_id text not null,
  title text not null,
  description text,
  published_at timestamptz,
  thumbnail_url text,
  source_url text not null,
  duration_seconds integer check (duration_seconds is null or duration_seconds >= 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (project_id, youtube_video_id)
);

create table public.video_metrics (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  video_id uuid not null references public.videos(id) on delete cascade,
  view_count bigint check (view_count is null or view_count >= 0),
  like_count bigint check (like_count is null or like_count >= 0),
  comment_count bigint check (comment_count is null or comment_count >= 0),
  outlier_score numeric check (outlier_score is null or outlier_score >= 0),
  captured_at timestamptz not null default timezone('utc', now()),
  unique (video_id, captured_at)
);

create table public.transcripts (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  video_id uuid not null references public.videos(id) on delete cascade,
  provider text not null,
  language text,
  transcript text not null,
  segments jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  unique (video_id, provider, language)
);

create table public.research_sources (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  provider text not null check (provider in ('youtube', 'apify', 'firecrawl', 'manual')),
  source_url text not null,
  title text,
  content_markdown text,
  source_metadata jsonb not null default '{}'::jsonb,
  fetched_at timestamptz not null default timezone('utc', now()),
  unique (project_id, source_url)
);

create table public.ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  requested_by uuid references auth.users(id) on delete set null,
  status text not null default 'queued' check (status in ('queued', 'running', 'completed', 'failed', 'cancelled')),
  provider text,
  input jsonb not null default '{}'::jsonb,
  result jsonb,
  error_code text,
  error_message text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.insights (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  ingestion_run_id uuid references public.ingestion_runs(id) on delete set null,
  kind text not null check (kind in ('outlier', 'pattern', 'content_gap', 'title_pattern', 'format_pattern')),
  title text not null,
  summary text not null,
  confidence numeric check (confidence is null or (confidence >= 0 and confidence <= 1)),
  evidence jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.ideas (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  angle text not null,
  status text not null default 'suggested' check (status in ('suggested', 'saved', 'drafting', 'published', 'archived')),
  score numeric check (score is null or (score >= 0 and score <= 100)),
  evidence jsonb not null default '[]'::jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'tool')),
  content text not null,
  message_metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create table public.tool_runs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete set null,
  tool_name text not null,
  status text not null check (status in ('pending_approval', 'running', 'completed', 'rejected', 'failed')),
  input jsonb not null default '{}'::jsonb,
  output jsonb,
  approved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  completed_at timestamptz
);

create index projects_owner_id_idx on public.projects(owner_id);
create index competitors_project_id_idx on public.competitors(project_id);
create index videos_project_id_idx on public.videos(project_id);
create index videos_competitor_id_idx on public.videos(competitor_id);
create index video_metrics_video_id_captured_at_idx on public.video_metrics(video_id, captured_at desc);
create index research_sources_project_id_idx on public.research_sources(project_id);
create index ingestion_runs_project_id_created_at_idx on public.ingestion_runs(project_id, created_at desc);
create index insights_project_id_created_at_idx on public.insights(project_id, created_at desc);
create index ideas_project_id_status_idx on public.ideas(project_id, status);
create index messages_conversation_id_created_at_idx on public.messages(conversation_id, created_at);

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();
create trigger projects_set_updated_at before update on public.projects
for each row execute function public.set_updated_at();
create trigger competitors_set_updated_at before update on public.competitors
for each row execute function public.set_updated_at();
create trigger videos_set_updated_at before update on public.videos
for each row execute function public.set_updated_at();
create trigger ideas_set_updated_at before update on public.ideas
for each row execute function public.set_updated_at();
create trigger conversations_set_updated_at before update on public.conversations
for each row execute function public.set_updated_at();

create or replace function public.owns_project(target_project_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.projects
    where projects.id = target_project_id
      and projects.owner_id = auth.uid()
  );
$$;

revoke all on function public.owns_project(uuid) from public;
grant execute on function public.owns_project(uuid) to authenticated;

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.competitors enable row level security;
alter table public.videos enable row level security;
alter table public.video_metrics enable row level security;
alter table public.transcripts enable row level security;
alter table public.research_sources enable row level security;
alter table public.ingestion_runs enable row level security;
alter table public.insights enable row level security;
alter table public.ideas enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.tool_runs enable row level security;

create policy "profiles_select_own" on public.profiles
for select using (id = auth.uid());
create policy "profiles_update_own" on public.profiles
for update using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles_insert_own" on public.profiles
for insert with check (id = auth.uid());

create policy "projects_owner_all" on public.projects
for all using (owner_id = auth.uid()) with check (owner_id = auth.uid());

create policy "competitors_owner_all" on public.competitors
for all using (public.owns_project(project_id)) with check (public.owns_project(project_id));
create policy "videos_owner_all" on public.videos
for all using (public.owns_project(project_id)) with check (public.owns_project(project_id));
create policy "video_metrics_owner_all" on public.video_metrics
for all using (public.owns_project(project_id)) with check (public.owns_project(project_id));
create policy "transcripts_owner_all" on public.transcripts
for all using (public.owns_project(project_id)) with check (public.owns_project(project_id));
create policy "research_sources_owner_all" on public.research_sources
for all using (public.owns_project(project_id)) with check (public.owns_project(project_id));
create policy "ingestion_runs_owner_all" on public.ingestion_runs
for all using (public.owns_project(project_id)) with check (public.owns_project(project_id));
create policy "insights_owner_all" on public.insights
for all using (public.owns_project(project_id)) with check (public.owns_project(project_id));
create policy "ideas_owner_all" on public.ideas
for all using (public.owns_project(project_id)) with check (public.owns_project(project_id));
create policy "conversations_owner_all" on public.conversations
for all using (public.owns_project(project_id)) with check (public.owns_project(project_id));
create policy "messages_owner_all" on public.messages
for all using (public.owns_project(project_id)) with check (public.owns_project(project_id));
create policy "tool_runs_owner_all" on public.tool_runs
for all using (public.owns_project(project_id)) with check (public.owns_project(project_id));

comment on table public.messages is
  'Stores text conversation history only. Raw microphone audio is not persisted by default.';
