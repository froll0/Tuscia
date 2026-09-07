/**
 * Dove vivono le campagne.
 *
 * Due depositi soltanto, e nessun account.
 *  - il browser di chi gioca (IndexedDB), che non richiede nulla;
 *  - un progetto Supabase, dove ogni campagna ha una chiave segreta: chi la
 *    possiede legge e scrive, chi non l'ha non arriva alla tavola.
 *
 * Questo programma è un sito statico e non contiene alcun segreto: l'indirizzo
 * del progetto e la chiave pubblica li inserisce chi gioca, e restano nel suo
 * browser.
 */
import type { Campagna } from '../modello/tipi'
import { chiaviNote, chiaveDi, ricorda, scorda } from './chiavi'

export type ConfigDeposito =
  | { sorta: 'locale' }
  | { sorta: 'supabase'; url: string; chiave: string }

export interface Esito { prova: string; bene: boolean; dettaglio: string }

export interface Deposito {
  sorta: 'locale' | 'supabase'
  descrizione: string
  elenca(): Promise<Campagna[]>
  leggi(id: string): Promise<Campagna | null>
  scrivi(c: Campagna): Promise<void>
  cancella(id: string): Promise<void>
  /** Solo Supabase: la chiave da dare agli altri giocatori. */
  chiaveDiCampagna?(id: string): string | null
  /** Solo Supabase: sedersi a un tavolo altrui con la chiave ricevuta. */
  entraConChiave?(chiave: string): Promise<Campagna>
  verifica?(): Promise<Esito[]>
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

export async function creaDepositoSupabase(url: string, chiavePubblica: string): Promise<Deposito> {
  const { createClient } = await import('@supabase/supabase-js')
  const sb = createClient(url, chiavePubblica, { auth: { persistSession: false } })

  const guasto = (m: string): Error => {
    if (/function .*(apri_campagna|leggi_campagne|scrivi_campagna).*(does not exist)|schema cache|Could not find the function/i.test(m)) {
      return new Error('Il progetto non conosce ancora le funzioni del gioco: '
        + 'eseguite il testo SQL che trovate qui sotto, nel SQL Editor del progetto.')
    }
    return new Error(m)
  }

  return {
    sorta: 'supabase',
    descrizione: new URL(url).host,

    chiaveDiCampagna: (id) => chiaveDi(id),

    async elenca() {
      const chiavi = chiaviNote().map((k) => k.chiave)
      if (chiavi.length === 0) return []
      const { data, error } = await sb.rpc('leggi_campagne', { p_chiavi: chiavi })
      if (error) throw guasto(error.message)
      return (data ?? []) as Campagna[]
    },

    async leggi(id) {
      const k = chiaveDi(id)
      if (!k) return null
      const { data, error } = await sb.rpc('leggi_campagne', { p_chiavi: [k] })
      if (error) throw guasto(error.message)
      return ((data ?? []) as Campagna[])[0] ?? null
    },

    async scrivi(c) {
      const k = chiaveDi(c.id)
      if (!k) {
        // Prima scrittura: si apre la campagna e si riceve la sua chiave.
        const { data, error } = await sb.rpc('apri_campagna', { p_dati: c })
        if (error) throw guasto(error.message)
        ricorda({ id: c.id, nome: c.nome, chiave: String(data) })
        return
      }
      const { error } = await sb.rpc('scrivi_campagna', { p_chiave: k, p_dati: c })
      if (error) throw guasto(error.message)
      ricorda({ id: c.id, nome: c.nome, chiave: k })
    },

    async cancella(id) {
      const k = chiaveDi(id)
      if (!k) return
      const { error } = await sb.rpc('cancella_campagna', { p_chiave: k })
      if (error) throw guasto(error.message)
      scorda(k)
    },

    async entraConChiave(chiave) {
      const k = chiave.trim()
      const { data, error } = await sb.rpc('leggi_campagne', { p_chiavi: [k] })
      if (error) throw guasto(error.message)
      const c = ((data ?? []) as Campagna[])[0]
      if (!c) throw new Error('Nessuna campagna risponde a questa chiave. Controllatela: si copia e si incolla intera.')
      ricorda({ id: c.id, nome: c.nome, chiave: k })
      return c
    },

    async verifica() {
      const esiti: Esito[] = []
      const { error } = await sb.rpc('leggi_campagne', { p_chiavi: [] })
      esiti.push(error
        ? { prova: 'Il progetto', bene: false, dettaglio: guasto(error.message).message }
        : { prova: 'Il progetto', bene: true, dettaglio: 'risponde, e conosce le funzioni del gioco' })
      const n = chiaviNote().length
      esiti.push({
        prova: 'Chiavi in questo browser', bene: true,
        dettaglio: n === 0 ? 'nessuna: aprite una campagna, oppure entrate con una chiave ricevuta'
                           : `${n} ${n === 1 ? 'campagna conosciuta' : 'campagne conosciute'}`,
      })
      return esiti
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

/**
 * Apre il deposito scelto. Se il progetto non si apre, GETTA: tornare in
 * silenzio al deposito locale farebbe credere che i dati siano condivisi
 * mentre non lo sono.
 */
export async function apriDeposito(c: ConfigDeposito): Promise<Deposito> {
  if (c.sorta === 'supabase') return creaDepositoSupabase(c.url, c.chiave)
  return depositoLocale
}
