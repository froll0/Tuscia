import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { Campagna } from '../modello/tipi'
import { apriDeposito, depositoLocale, leggiConfig, scriviConfig } from './deposito'
import type { ConfigDeposito, Deposito } from './deposito'

interface Contesto {
  deposito: Deposito
  config: ConfigDeposito
  mutaConfig: (c: ConfigDeposito) => void
  campagne: Campagna[]
  caricando: boolean
  errore: string | null
  ricarica: () => Promise<void>
  salva: (c: Campagna) => Promise<void>
  cancella: (id: string) => Promise<void>
  utente: string | null
  scordaErrore: () => void
}

const Ctx = createContext<Contesto | null>(null)

export function ProvvedeDati({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<ConfigDeposito>(() => leggiConfig())
  const [deposito, setDeposito] = useState<Deposito>(depositoLocale)
  const [campagne, setCampagne] = useState<Campagna[]>([])
  const [caricando, setCaricando] = useState(true)
  const [errore, setErrore] = useState<string | null>(null)
  const [utente, setUtente] = useState<string | null>(null)
  const vivo = useRef(true)

  useEffect(() => () => { vivo.current = false }, [])

  useEffect(() => {
    let annullato = false
    setCaricando(true)
    apriDeposito(config).then(async (d) => {
      if (annullato) return
      setDeposito(d)
      try {
        setUtente(d.utente ? await d.utente() : null)
        setCampagne(await d.elenca())
        setErrore(null)
      } catch (e) {
        setErrore(e instanceof Error ? e.message : String(e))
        setCampagne([])
      } finally {
        if (!annullato) setCaricando(false)
      }
    })
    return () => { annullato = true }
  }, [config])

  const ricarica = useCallback(async () => {
    try {
      setCampagne(await deposito.elenca())
      setUtente(deposito.utente ? await deposito.utente() : null)
      setErrore(null)
    } catch (e) { setErrore(e instanceof Error ? e.message : String(e)) }
  }, [deposito])

  const salva = useCallback(async (c: Campagna) => {
    const aggiornata: Campagna = { ...c, aggiornataIl: new Date().toISOString(), versione: c.versione + 1 }
    try {
      await deposito.scrivi(aggiornata)
    } catch (e) {
      setErrore(e instanceof Error ? e.message : String(e))
      throw e
    }
    setErrore(null)
    setCampagne((v) => {
      const i = v.findIndex((x) => x.id === aggiornata.id)
      return i < 0 ? [aggiornata, ...v] : v.map((x) => (x.id === aggiornata.id ? aggiornata : x))
    })
  }, [deposito])

  const cancella = useCallback(async (id: string) => {
    try {
      await deposito.cancella(id)
    } catch (e) {
      setErrore(e instanceof Error ? e.message : String(e))
      throw e
    }
    setCampagne((v) => v.filter((c) => c.id !== id))
  }, [deposito])

  const scordaErrore = useCallback(() => setErrore(null), [])

  const mutaConfig = useCallback((c: ConfigDeposito) => { scriviConfig(c); setConfig(c) }, [])

  const valore = useMemo<Contesto>(() => ({
    deposito, config, mutaConfig, campagne, caricando, errore, ricarica, salva, cancella, utente,
    scordaErrore,
  }), [deposito, config, mutaConfig, campagne, caricando, errore, ricarica, salva, cancella, utente,
       scordaErrore])

  return <Ctx.Provider value={valore}>{children}</Ctx.Provider>
}

export function usaDati(): Contesto {
  const c = useContext(Ctx)
  if (!c) throw new Error('usaDati fuori dal suo provveditore')
  return c
}

export function usaCampagna(id: string | undefined): Campagna | null {
  const { campagne } = usaDati()
  return useMemo(() => campagne.find((c) => c.id === id) ?? null, [campagne, id])
}

/**
 * Muta la campagna e la salva nel deposito.
 * Non rigetta mai: l'errore è già registrato nel contesto e appare in capo alla
 * pagina, sicché chiamarla con `void` resta sicuro.
 */
export function usaMutaCampagna(id: string | undefined) {
  const { campagne, salva } = usaDati()
  return useCallback(async (opera: (c: Campagna) => Campagna) => {
    const c = campagne.find((x) => x.id === id)
    if (!c) return
    try { await salva(opera(c)) } catch { /* registrato nel contesto */ }
  }, [campagne, id, salva])
}
