export const SQL_SCHEMA = `-- La Prima Casa della Tuscia — tavole per Supabase.
-- Si può eseguire più volte senza danno: ogni istruzione è ripetibile.

create extension if not exists pgcrypto;

create table if not exists public.campagne (
  id            uuid primary key,
  proprietario  uuid references auth.users on delete set null,
  nome          text not null,
  dati          jsonb not null,
  codice        text unique default encode(gen_random_bytes(4), 'hex'),
  aggiornata_il timestamptz not null default now()
);

create table if not exists public.membri (
  campagna_id uuid references public.campagne on delete cascade,
  utente      uuid references auth.users on delete cascade,
  ruolo       text not null default 'giocatore',
  primary key (campagna_id, utente)
);

-- Il proprietario lo pone la base di dati, non il programma: chi apre una
-- campagna ne è il padrone, e nessuna scrittura successiva può cambiarlo.
alter table public.campagne alter column proprietario set default auth.uid();
alter table public.campagne alter column codice set default encode(gen_random_bytes(4), 'hex');
update public.campagne set codice = encode(gen_random_bytes(4), 'hex') where codice is null;

create or replace function public.proprietario_immutabile() returns trigger
language plpgsql as $$
begin
  new.proprietario := old.proprietario;
  return new;
end $$;

drop trigger if exists campagne_proprietario_immutabile on public.campagne;
create trigger campagne_proprietario_immutabile
  before update on public.campagne
  for each row execute function public.proprietario_immutabile();

alter table public.campagne enable row level security;
alter table public.membri   enable row level security;

create or replace function public.e_membro(c uuid) returns boolean
language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.membri m where m.campagna_id = c and m.utente = auth.uid())
$$;

drop policy if exists "leggere le proprie campagne" on public.campagne;
create policy "leggere le proprie campagne" on public.campagne for select
  using (proprietario = auth.uid() or public.e_membro(id));

drop policy if exists "aprire una campagna" on public.campagne;
create policy "aprire una campagna" on public.campagne for insert
  with check (proprietario = auth.uid());

drop policy if exists "mutare la campagna" on public.campagne;
create policy "mutare la campagna" on public.campagne for update
  using (proprietario = auth.uid() or public.e_membro(id))
  with check (proprietario = auth.uid() or public.e_membro(id));

drop policy if exists "chiudere la campagna" on public.campagne;
create policy "chiudere la campagna" on public.campagne for delete
  using (proprietario = auth.uid());

drop policy if exists "vedere i membri" on public.membri;
create policy "vedere i membri" on public.membri for select
  using (utente = auth.uid()
         or exists (select 1 from public.campagne c where c.id = campagna_id and c.proprietario = auth.uid()));

drop policy if exists "uscire dalla campagna" on public.membri;
create policy "uscire dalla campagna" on public.membri for delete
  using (utente = auth.uid()
         or exists (select 1 from public.campagne c where c.id = campagna_id and c.proprietario = auth.uid()));

-- Un giocatore entra nella campagna col codice che l'Arbitro gli ha dato.
create or replace function public.entra_con_codice(il_codice text) returns uuid
language plpgsql security definer set search_path = public as $$
declare c uuid;
begin
  if auth.uid() is null then raise exception 'Bisogna essere entrati'; end if;
  select id into c from public.campagne where codice = il_codice;
  if c is null then raise exception 'Codice sconosciuto'; end if;
  insert into public.membri (campagna_id, utente) values (c, auth.uid())
    on conflict do nothing;
  return c;
end $$;

grant execute on function public.entra_con_codice(text) to authenticated;

-- Perché la sincronia in tempo reale funzioni:
do $$
begin
  alter publication supabase_realtime add table public.campagne;
exception when duplicate_object then null;
end $$;
`
