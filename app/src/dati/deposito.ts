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

/** Esito di una singola verifica del collegamento. */
export interface Esito { prova: string; bene: boolean; dettaglio: string }

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
  codiceDi?(id: string): Promise<string | null>
  entraConCodice?(codice: string): Promise<string>
  verifica?(): Promise<Esito[]>
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
      // Senza sessione la riga non ha proprietario, e la regola per riga la
      // rifiuta con un messaggio oscuro. Meglio dirlo qui, e in italiano.
      const { data: s } = await sb.auth.getSession()
      if (!s.session) {
        throw new Error(
          'Non siete entrato nel progetto Supabase: nulla si può scrivere. ' +
          'Andate alla pagina Deposito e fatevi mandare il collegamento per posta.')
      }
      // Il proprietario non si manda mai dal programma: alla prima scrittura lo
      // pone la base di dati (default auth.uid()), e in seguito non si muta.
      const { error } = await sb.from(TAVOLA).upsert({
        id: c.id, nome: c.nome, dati: c, aggiornata_il: new Date().toISOString(),
      })
      if (error) {
        if (/row-level security/i.test(error.message)) {
          throw new Error(
            'Il progetto Supabase ha rifiutato la scrittura. Di regola significa che le ' +
            'tavole sono state create con una versione precedente del testo SQL: si ' +
            'riesegua quello che la pagina Deposito mostra ora. Messaggio del server: ' +
            error.message)
        }
        throw new Error(error.message)
      }
    },
    async cancella(id) {
      const { error } = await sb.from(TAVOLA).delete().eq('id', id)
      if (error) throw new Error(error.message)
    },
    async codiceDi(id) {
      const { data, error } = await sb.from(TAVOLA).select('codice').eq('id', id).maybeSingle()
      if (error) return null
      return (data as { codice?: string } | null)?.codice ?? null
    },
    async entraConCodice(codice) {
      const { data: s } = await sb.auth.getSession()
      if (!s.session) throw new Error('Entrate prima nel progetto, poi adoperate il codice.')
      const { data, error } = await sb.rpc('entra_con_codice', { il_codice: codice.trim() })
      if (error) throw new Error(error.message)
      return String(data)
    },
    async verifica() {
      const esiti: Esito[] = []
      const { data: s } = await sb.auth.getSession()
      esiti.push(s.session
        ? { prova: 'Sessione', bene: true, dettaglio: `entrati come ${s.session.user.email ?? 'utente senza posta'}` }
        : { prova: 'Sessione', bene: false, dettaglio: 'non siete entrato: fatevi mandare il collegamento per posta' })

      const { error: eSel } = await sb.from(TAVOLA).select('id').limit(1)
      if (!eSel) {
        esiti.push({ prova: 'Tavola «campagne»', bene: true, dettaglio: 'esiste e si può leggere' })
      } else if (/does not exist|schema cache|relation/i.test(eSel.message)) {
        esiti.push({ prova: 'Tavola «campagne»', bene: false,
          dettaglio: 'non esiste: eseguite il testo SQL qui sotto nel SQL Editor del progetto' })
      } else {
        esiti.push({ prova: 'Tavola «campagne»', bene: false, dettaglio: eSel.message })
      }

      const { error: eRpc } = await sb.rpc('entra_con_codice', { il_codice: '' })
      const mancante = eRpc && /could not find|does not exist|schema cache/i.test(eRpc.message)
      esiti.push(mancante
        ? { prova: 'Invito per codice', bene: false, dettaglio: 'la funzione manca: rieseguite il testo SQL' }
        : { prova: 'Invito per codice', bene: true, dettaglio: 'la funzione risponde' })

      return esiti
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

/**
 * Apre il deposito scelto. Se il progetto Supabase non si apre, questa funzione
 * GETTA: chi la chiama deve dirlo a chi gioca. Tornare in silenzio al deposito
 * locale farebbe credere che i dati siano condivisi mentre non lo sono.
 */
export async function apriDeposito(c: ConfigDeposito): Promise<Deposito> {
  if (c.sorta === 'supabase') return creaDepositoSupabase(c.url, c.chiave)
  return depositoLocale
}
