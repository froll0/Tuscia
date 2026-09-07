/** fasc. 03 e 04 — la creazione del casato e dei personaggi, coi conti fatti. */
import {
  PUNTI_DI_CASA, COSTO_PATRIMONIO, VALORE_PATRIMONIO, RENDITA_PER_PUNTO, COSTO_SEGUITO,
  COSTO_ONORE, ONORE_BASE, COSTO_ARMI, COSTO_CONGIUNTO, COSTO_FIGLIO, COSTO_MAGNIFICENZA,
  COSTO_AMICO, COSTO_POLIZZA, MAX_MACCHIE_PC, MACCHIE,
} from './tavole'
import type { NomeQualita, Qualita, Arti } from '../modello/tipi'
import { QUALITA } from '../modello/tipi'

/* ------------------------------------------------------------------ casato */

export interface SceltaCasato {
  gradoPatrimonio: number
  puntiInTerre: number
  seguito: number
  onore: number
  gradoArmi: number
  congiuntiOltre: number
  figliOltre: number
  magnificenza: number
  amici: number
  polizze: number
  beneficiPc: number
  macchie: string[]
}

export interface VoceConto { nome: string; punti: number; nota?: string }
export interface ContoCasato {
  voci: VoceConto[]
  spesi: number
  guadagnati: number
  disponibili: number
  restanti: number
  errori: string[]
  patrimonioFiorini: number
  renditaFiorini: number
}

export function contoPuntiDiCasa(s: SceltaCasato): ContoCasato {
  const voci: VoceConto[] = []
  const errori: string[] = []

  voci.push({ nome: `Patrimonio, grado ${s.gradoPatrimonio}`, punti: s.gradoPatrimonio * COSTO_PATRIMONIO,
              nota: `${VALORE_PATRIMONIO[s.gradoPatrimonio] ?? 0} fiorini` })
  voci.push({ nome: 'Terre', punti: s.puntiInTerre, nota: `${s.puntiInTerre * RENDITA_PER_PUNTO} fl di rendita annua` })
  voci.push({ nome: `Seguito ${s.seguito}`, punti: s.seguito * COSTO_SEGUITO })
  voci.push({ nome: `Onore ${s.onore}`, punti: Math.max(0, s.onore - ONORE_BASE) * COSTO_ONORE,
              nota: `parte da ${ONORE_BASE} senza spesa` })
  voci.push({ nome: `Armi, grado ${s.gradoArmi}`, punti: s.gradoArmi * COSTO_ARMI })
  voci.push({ nome: 'Congiunti adulti oltre i gratuiti', punti: s.congiuntiOltre * COSTO_CONGIUNTO })
  voci.push({ nome: 'Figli impuberi oltre i gratuiti', punti: s.figliOltre * COSTO_FIGLIO })
  voci.push({ nome: `Magnificenza ${s.magnificenza}`, punti: s.magnificenza * COSTO_MAGNIFICENZA })
  voci.push({ nome: 'Amici e clienti', punti: s.amici * COSTO_AMICO })
  voci.push({ nome: 'Polizze già imborsate', punti: s.polizze * COSTO_POLIZZA })
  voci.push({ nome: 'Benefici ecclesiastici', punti: s.beneficiPc })

  const spesi = voci.reduce((t, v) => t + v.punti, 0)
  const guadagnati = s.macchie.reduce((t, n) => t + (MACCHIE.find((m) => m.nome === n)?.pc ?? 0), 0)
  const disponibili = PUNTI_DI_CASA + guadagnati
  const restanti = disponibili - spesi

  if (guadagnati > MAX_MACCHIE_PC) errori.push(`Le Macchie non possono rendere più di ${MAX_MACCHIE_PC} punti: ne rendono ${guadagnati}.`)
  if (restanti < 0) errori.push(`Punti spesi in eccesso: ne mancano ${-restanti}.`)
  if (s.onore > 6) errori.push('Alla creazione l’Onore non può superare 6.')
  if (s.seguito > 5) errori.push('Alla creazione il Seguito non può superare 5.')
  if (s.seguito > s.onore + 2) errori.push('Il Seguito non può superare l’Onore + 2.')
  if (s.gradoPatrimonio > 5 || s.gradoPatrimonio < 0) errori.push('Il Patrimonio va da 0 a 5.')
  if (s.gradoArmi > 5 || s.gradoArmi < 0) errori.push('Le Armi vanno da 0 a 5.')
  if (s.magnificenza > 3) errori.push('Alla creazione la Magnificenza non può superare 3.')

  return {
    voci: voci.filter((v) => v.punti !== 0), spesi, guadagnati, disponibili, restanti, errori,
    patrimonioFiorini: VALORE_PATRIMONIO[s.gradoPatrimonio] ?? 0,
    renditaFiorini: s.puntiInTerre * RENDITA_PER_PUNTO,
  }
}

/* ------------------------------------------------------------- personaggio */

export const QUALITA_BASE = 2
export const PUNTI_QUALITA = 5
export const MAX_QUALITA_CREAZIONE = 4
export const PUNTI_ARTI = 12
export const MAX_ARTE_CREAZIONE = 3

export interface ModificatoriEta {
  etichetta: string; artiExtra: number; qualitaExtra: number; vigore: number; destrezza: number
}

export function modificatoriEta(eta: number): ModificatoriEta {
  if (eta <= 20) return { etichetta: '16–20', artiExtra: -3, qualitaExtra: 1, vigore: 0, destrezza: 0 }
  if (eta <= 35) return { etichetta: '21–35', artiExtra: 0, qualitaExtra: 0, vigore: 0, destrezza: 0 }
  if (eta <= 50) return { etichetta: '36–50', artiExtra: 3, qualitaExtra: 0, vigore: 0, destrezza: 0 }
  if (eta <= 65) return { etichetta: '51–65', artiExtra: 6, qualitaExtra: 0, vigore: -1, destrezza: -1 }
  return { etichetta: '66 e oltre', artiExtra: 8, qualitaExtra: 0, vigore: -2, destrezza: -2 }
}

export interface ContoPersonaggio {
  puntiQualitaUsati: number; puntiQualitaDisponibili: number
  puntiArtiUsati: number; puntiArtiDisponibili: number
  errori: string[]; avvisi: string[]
}

export function contoPersonaggio(qualita: Qualita, arti: Arti, eta: number): ContoPersonaggio {
  const m = modificatoriEta(eta)
  const errori: string[] = []
  const avvisi: string[] = []

  const puntiQualitaUsati = QUALITA.reduce((t, q) => t + (qualita[q] - QUALITA_BASE), 0)
  const puntiQualitaDisponibili = PUNTI_QUALITA + m.qualitaExtra
  const puntiArtiUsati = Object.values(arti).reduce((t, v) => t + v, 0)
  const puntiArtiDisponibili = PUNTI_ARTI + m.artiExtra

  if (puntiQualitaUsati > puntiQualitaDisponibili)
    errori.push(`Punti di Qualità in eccesso: ${puntiQualitaUsati} su ${puntiQualitaDisponibili}.`)
  if (puntiArtiUsati > puntiArtiDisponibili)
    errori.push(`Punti di Arti in eccesso: ${puntiArtiUsati} su ${puntiArtiDisponibili}.`)
  if (puntiQualitaUsati < puntiQualitaDisponibili)
    avvisi.push(`Restano ${puntiQualitaDisponibili - puntiQualitaUsati} punti di Qualità da spendere.`)
  if (puntiArtiUsati < puntiArtiDisponibili)
    avvisi.push(`Restano ${puntiArtiDisponibili - puntiArtiUsati} punti di Arti da spendere.`)

  for (const q of QUALITA) {
    if (qualita[q] > MAX_QUALITA_CREAZIONE)
      errori.push(`${q}: alla creazione nessuna Qualità supera ${MAX_QUALITA_CREAZIONE}.`)
    if (qualita[q] < 1) errori.push(`${q}: nessuna Qualità scende sotto 1.`)
  }
  for (const [nome, v] of Object.entries(arti)) {
    if (v > MAX_ARTE_CREAZIONE) errori.push(`${nome}: alla creazione nessuna Arte supera ${MAX_ARTE_CREAZIONE}.`)
    if (v < 0) errori.push(`${nome}: le Arti non sono negative.`)
  }
  return { puntiQualitaUsati, puntiQualitaDisponibili, puntiArtiUsati, puntiArtiDisponibili, errori, avvisi }
}

export function qualitaVuote(): Qualita {
  return QUALITA.reduce((o, q) => { o[q] = QUALITA_BASE; return o }, {} as Record<NomeQualita, number>)
}

export function applicaModificatoriEta(q: Qualita, eta: number): Qualita {
  const m = modificatoriEta(eta)
  return { ...q, vigore: Math.max(1, q.vigore + m.vigore), destrezza: Math.max(1, q.destrezza + m.destrezza) }
}
