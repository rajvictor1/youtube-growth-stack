alter table public.ingestion_runs
  add column job_type text not null default 'apify_youtube_enrichment'
    check (job_type in ('apify_youtube_enrichment')),
  add column approved_at timestamptz,
  add column approved_by uuid,
  add column attempt_count integer not null default 0 check (attempt_count >= 0),
  add column max_attempts integer not null default 3 check (max_attempts between 1 and 10),
  add column available_at timestamptz not null default timezone('utc', now()),
  add column lease_owner text,
  add column lease_expires_at timestamptz,
  add column last_heartbeat_at timestamptz,
  add column provider_run_id text,
  add column provider_dataset_id text,
  add column provider_status text,
  add column error_retryable boolean,
  add column updated_at timestamptz not null default timezone('utc', now());

alter table public.ingestion_runs
  add constraint ingestion_runs_approval_required
    check (status = 'cancelled' or (approved_at is not null and approved_by is not null))
    not valid,
  add constraint ingestion_runs_lease_consistency
    check (
      (status = 'running' and lease_owner is not null and lease_expires_at is not null)
      or
      (status <> 'running' and lease_owner is null and lease_expires_at is null)
    ) not valid;

create index ingestion_runs_claim_idx
  on public.ingestion_runs (available_at, created_at)
  where status = 'queued';

create index ingestion_runs_expired_lease_idx
  on public.ingestion_runs (lease_expires_at)
  where status = 'running';

create trigger ingestion_runs_set_updated_at before update on public.ingestion_runs
for each row execute function public.set_updated_at();

drop policy "ingestion_runs_owner_all" on public.ingestion_runs;

create policy "ingestion_runs_owner_select" on public.ingestion_runs
for select using (public.owns_project(project_id));

create or replace function public.claim_ingestion_run(
  worker_id text,
  lease_seconds integer default 3600
)
returns setof public.ingestion_runs
language plpgsql
security definer
set search_path = public
as $$
declare
  claimed_id uuid;
begin
  if worker_id is null or char_length(btrim(worker_id)) = 0 then
    raise exception 'worker_id is required';
  end if;

  if lease_seconds < 30 or lease_seconds > 3600 then
    raise exception 'lease_seconds must be between 30 and 3600';
  end if;

  update public.ingestion_runs
  set status = 'failed',
      error_code = 'LEASE_EXPIRED',
      error_message = 'The worker lease expired after the final attempt.',
      error_retryable = false,
      completed_at = timezone('utc', now()),
      lease_owner = null,
      lease_expires_at = null
  where status = 'running'
    and lease_expires_at <= timezone('utc', now())
    and attempt_count >= max_attempts;

  select id into claimed_id
  from public.ingestion_runs
  where approved_at is not null
    and approved_by is not null
    and attempt_count < max_attempts
    and (
      (status = 'queued' and available_at <= timezone('utc', now()))
      or
      (status = 'running' and lease_expires_at <= timezone('utc', now()))
    )
  order by available_at, created_at
  for update skip locked
  limit 1;

  if claimed_id is null then
    return;
  end if;

  return query
  update public.ingestion_runs
  set status = 'running',
      attempt_count = attempt_count + 1,
      lease_owner = btrim(worker_id),
      lease_expires_at = timezone('utc', now()) + make_interval(secs => lease_seconds),
      last_heartbeat_at = timezone('utc', now()),
      started_at = coalesce(started_at, timezone('utc', now())),
      completed_at = null,
      error_code = null,
      error_message = null,
      error_retryable = null
  where id = claimed_id
  returning *;
end;
$$;

revoke all on function public.claim_ingestion_run(text, integer) from public;
revoke all on function public.claim_ingestion_run(text, integer) from anon;
revoke all on function public.claim_ingestion_run(text, integer) from authenticated;
grant execute on function public.claim_ingestion_run(text, integer) to service_role;

comment on function public.claim_ingestion_run(text, integer) is
  'Atomically claims one approved due ingestion job. Trusted service-role workers only.';
