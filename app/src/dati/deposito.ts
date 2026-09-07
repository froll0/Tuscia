/**
 * Dove vivono le campagne.
 * Due depositi: il browser di chi gioca, e un progetto Supabase che il tavolo
 * condivide. Le chiavi di Supabase le inserisce l'utente: questo programma è
 * un sito statico e non contiene alcun segreto.
 */
import type { Campagna } from '../modello/tipi'

export type ConfigDeposito =
  | { sorta: 'locale' }
  | { sorta: 'supabase'; url: string; chiave: string }

export interface Deposito {
  sorta: 'locale' | 'supabase'
  descrizione: string
  elenca(): Promise<Campagna[]>
  leggi(id: string): Promise<Campagna | null>
  scrivi(c: Campagna): Promise<void>
  cancella(id: string): Promise<void>
  utente?(): Promise<string | null>
  entra?(email: string): Promise<void>
  esci?(): Promise<void>
  ascolta?(id: string, quando: (c: Campagna) => void): () => void
}

/* --------------------------------------------------------- deposito locale */

const NOME_BASE = 'tuscia'
const DEPOSITO = 'campagne'

function apriBase(): Promise<IDBDatabase> {
  return new Promise((risolvi, rifiuta) => {
    const richiesta = indexedDB.open(NOME_BASE, 1)
    richiesta.onupgradeneeded = () => {
      const db = richiesta.result
      if (!db.objectStoreNames.contains(DEPOSITO)) db.createObjectStore(DEPOSITO, { keyPath: 'id' })
    }
    richiesta.onsuccess = () => risolvi(richiesta.result)
    richiesta.onerror = () => rifiuta(richiesta.error)
  })
}

function transazione<T>(modo: IDBTransactionMode, opera: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return apriBase().then((db) => new Promise<T>((risolvi, rifiuta) => {
    const t = db.transaction(DEPOSITO, modo)
    const r = opera(t.objectStore(DEPOSITO))
    r.onsuccess = () => risolvi(r.result)
    r.onerror = () => rifiuta(r.error)
    t.oncomplete = () => db.close()
  }))
}

export const depositoLocale: Deposito = {
  sorta: 'locale',
  descrizione: 'Questo browser',
  async elenca() {
    try { return (await transazione<Campagna[]>('readonly', (s) => s.getAll() as IDBRequest<Campagna[]>)) ?? [] }
    catch { return [] }
  },
  async leggi(id) {
    try { return (await transazione<Campagna | undefined>('readonly', (s) => s.get(id) as IDBRequest<Campagna | undefined>)) ?? null }
    catch { return null }
  },
  async scrivi(c) { await transazione('readwrite', (s) => s.put(c) as IDBRequest<IDBValidKey>) },
  async cancella(id) { await transazione('readwrite', (s) => s.delete(id) as IDBRequest<undefined>) },
}

/* ------------------------------------------------------ deposito Supabase */

const TAVOLA = 'campagne'

export async function creaDepositoSupabase(url: string, chiave: string): Promise<Deposito> {
  const { createClient } = await import('@supabase/supabase-js')
  const sb = createClient(url, chiave, { auth: { persistSession: true, autoRefreshToken: true } })

  const daRiga = (r: { dati: Campagna }) => r.dati

  return {
    sorta: 'supabase',
    descrizione: new URL(url).host,
    async utente() {
      const { data } = await sb.auth.getUser()
      return data.user?.email ?? null
    },
    async entra(email: string) {
      const { error } = await sb.auth.signInWithOtp({
        email, options: { emailRedirectTo: window.location.href },
      })
      if (error) throw new Error(error.message)
    },
    async esci() { await sb.auth.signOut() },
    async elenca() {
      const { data, error } = await sb.from(TAVOLA).select('dati').order('aggiornata_il', { ascending: false })
      if (error) throw new Error(error.message)
      return (data ?? []).map(daRiga as never)
    },
    async leggi(id) {
      const { data, error } = await sb.from(TAVOLA).select('dati').eq('id', id).maybeSingle()
      if (error) throw new Error(error.message)
      return data ? daRiga(data as never) : null
    },
    async scrivi(c) {
      const { data: u } = await sb.auth.getUser()
      const { error } = await sb.from(TAVOLA).upsert({
        id: c.id, nome: c.nome, dati: c, aggiornata_il: new Date().toISOString(),
        proprietario: u.user?.id ?? null,
      })
      if (error) throw new Error(error.message)
    },
    async cancella(id) {
      const { error } = await sb.from(TAVOLA).delete().eq('id', id)
      if (error) throw new Error(error.message)
    },
    ascolta(id, quando) {
      const canale = sb.channel(`campagna:${id}`)
        .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: TAVOLA, filter: `id=eq.${id}` },
          (m) => { const r = m.new as { dati?: Campagna }; if (r.dati) quando(r.dati) })
        .subscribe()
      return () => { void sb.removeChannel(canale) }
    },
  }
}

/* ------------------------------------------------------------- preferenze */

const CHIAVE_CONFIG = 'tuscia:deposito'

export function leggiConfig(): ConfigDeposito {
  try {
    const s = localStorage.getItem(CHIAVE_CONFIG)
    if (s) return JSON.parse(s) as ConfigDeposito
  } catch { /* archiviazione negata: si resta in locale */ }
  return { sorta: 'locale' }
}

export function scriviConfig(c: ConfigDeposito): void {
  try { localStorage.setItem(CHIAVE_CONFIG, JSON.stringify(c)) } catch { /* pazienza */ }
}

export async function apriDeposito(c: ConfigDeposito): Promise<Deposito> {
  if (c.sorta === 'supabase') {
    try { return await creaDepositoSupabase(c.url, c.chiave) }
    catch { return depositoLocale }
  }
  return depositoLocale
}
