export const SQL_SCHEMA = `-- La Prima Casa della Tuscia — tavole per Supabase.
-- Si esegue una volta sola, nel SQL Editor del progetto. Nessun account.
-- Chi possiede la chiave di una campagna la legge e la scrive; chi non l'ha,
-- non arriva alla tavola in alcun modo.

create extension if not exists pgcrypto;

create table if not exists public.campagne (
  id            uuid primary key,
  nome          text not null,
  dati          jsonb not null,
  chiave        text not null unique default encode(gen_random_bytes(16), 'hex'),
  aggiornata_il timestamptz not null default now()
);

-- Regola per riga accesa e nessuna regola scritta: la tavola non e'
-- raggiungibile direttamente. Si passa dalle quattro funzioni qui sotto, che
-- esigono la chiave.
alter table public.campagne enable row level security;

create or replace function public.apri_campagna(p_dati jsonb)
returns text language plpgsql security definer set search_path = public as $$
declare k text;
begin
  insert into public.campagne (id, nome, dati)
  values ((p_dati->>'id')::uuid, coalesce(p_dati->>'nome', 'senza nome'), p_dati)
  returning chiave into k;
  return k;
end $$;

create or replace function public.leggi_campagne(p_chiavi text[])
returns setof jsonb language sql security definer stable set search_path = public as $$
  select dati from public.campagne
   where chiave = any(p_chiavi)
   order by aggiornata_il desc
$$;

create or replace function public.scrivi_campagna(p_chiave text, p_dati jsonb)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.campagne
     set dati = p_dati,
         nome = coalesce(p_dati->>'nome', nome),
         aggiornata_il = now()
   where chiave = p_chiave;
  if not found then raise exception 'Chiave sconosciuta'; end if;
end $$;

create or replace function public.cancella_campagna(p_chiave text)
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from public.campagne where chiave = p_chiave;
  if not found then raise exception 'Chiave sconosciuta'; end if;
end $$;

grant execute on function public.apri_campagna(jsonb)        to anon, authenticated;
grant execute on function public.leggi_campagne(text[])      to anon, authenticated;
grant execute on function public.scrivi_campagna(text,jsonb) to anon, authenticated;
grant execute on function public.cancella_campagna(text)     to anon, authenticated;
`
