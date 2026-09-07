/** fasc. 13 — le trame: Passi contro Sospetto. */
import { OBIETTIVI_TRAMA, METODI_TRAMA } from './tavole'
import type { ObiettivoTrama, MetodoTrama, Trama } from '../modello/tipi'
import type { RisultatoProva } from './prova'

export interface NumeriTrama { passiRichiesti: number; soglia: number; spesaAPasso: number; prova: string }

export function numeriTrama(o: ObiettivoTrama, m: MetodoTrama, congiurati = 1): NumeriTrama {
  const ob = OBIETTIVI_TRAMA[o]
  const me = METODI_TRAMA[m]
  const oltreIlPrimo = Math.max(0, congiurati - 1)
  return {
    passiRichiesti: Math.max(1, ob.passi + me.passi),
    soglia: Math.max(1, ob.soglia + me.soglia - oltreIlPrimo),
    spesaAPasso: me.spesa,
    prova: me.prova,
  }
}

/** Ciascun congiurato oltre il primo dà +1 Passo per stagione. */
export function passiPerStagione(esito: RisultatoProva, congiurati = 1): { passi: number; sospetto: number } {
  const extra = Math.max(0, congiurati - 1)
  if (esito.tracollo) return { passi: 0, sospetto: 2 }
  switch (esito.grado) {
    case 3: return { passi: 2 + extra, sospetto: 0 }
    case 2: return { passi: 1 + extra, sospetto: 0 }
    case 1: return { passi: 1 + extra, sospetto: 1 }
    default: return { passi: 0, sospetto: 1 }
  }
}

export function avanzaTrama(t: Trama, esito: RisultatoProva): Trama {
  const n = numeriTrama(t.obiettivo, t.metodo, t.congiurati)
  const passo = passiPerStagione(esito, t.congiurati)
  const passi = t.passi + passo.passi
  const sospetto = t.sospetto + passo.sospetto
  let stato = t.stato
  if (sospetto >= n.soglia) stato = 'scoperta'
  else if (passi >= n.passiRichiesti) stato = 'compiuta'
  return { ...t, passi, sospetto, stato }
}

/** Quanto il bersaglio capisce, una volta scoperta la trama (2d6). */
export const SCOPERTA = [
  { min: 11, testo: 'Tutto: obiettivo, metodo, mandante, esecutore. Ha le prove.' },
  { min: 8, testo: 'Sa che si trama contro di lui e da parte di chi. Non ha prove.' },
  { min: 5, testo: 'Sa che qualcosa si muove; sospetta la casa sbagliata.' },
  { min: 3, testo: 'Non capisce nulla, ma rafforza la Guardia (+1 stabile).' },
  { min: 2, testo: 'Crede che sia stato un terzo, e si volge contro di lui.' },
]
export function cheCosaHaCapito(tiro: number): string {
  return SCOPERTA.find((s) => tiro >= s.min)?.testo ?? SCOPERTA[SCOPERTA.length - 1]!.testo
}
