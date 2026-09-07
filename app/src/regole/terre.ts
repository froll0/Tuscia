/** fasc. 07 — rendite delle terre. L'ordine del computo non cambia mai. */
import { SCALA_FEDELTA, RACCOLTO, SORTE_TERRA } from './tavole'
import type { Terra, SortaTerra } from '../modello/tipi'

/** fasc. 07 — queste rendite entrano un quarto per stagione, non tutte in autunno. */
export const RENDITA_TRIMESTRALE = new Set<SortaTerra>([
  'casa-pigione', 'bottega-affitto', 'fondaco', 'gabella',
])

/** Solo queste sorte dipendono dall'annata agraria. */
const SOGGETTE_AL_RACCOLTO = new Set<SortaTerra>([
  'podere', 'villa', 'villa-grande', 'castello', 'terra-murata', 'citta', 'pieve', 'mulino', 'gregge',
])

export function fattoreFedelta(fedelta: number): number {
  const riga = SCALA_FEDELTA.find((r) => fedelta >= r.min && fedelta <= r.max)
  return riga ? riga.fattore : 1
}

export function etichettaFedelta(fedelta: number): string {
  const riga = SCALA_FEDELTA.find((r) => fedelta >= r.min && fedelta <= r.max)
  return riga ? riga.etichetta : '—'
}

export interface ComputoRendita {
  base: number
  migliorie: number
  conMigliorie: number
  fattoreFedelta: number
  dopoFedelta: number
  fattoreRaccolto: number
  dopoRaccolto: number
  guastata: boolean
  finale: number
  passaggi: string[]
}

/**
 * @param raccolto il 2d6 dell'annata, oppure null se non ancora tirato
 */
export function computaRendita(t: Terra, anno: number, raccolto: number | null): ComputoRendita {
  const mature = t.migliorie.filter((m) => m.dalAnno <= anno)
  const migliorie = mature.reduce((s, m) => s + m.resa, 0)
  const conMigliorie = t.renditaBase + migliorie
  const ff = fattoreFedelta(t.fedelta)
  const dopoFedelta = conMigliorie * ff
  const soggetta = SOGGETTE_AL_RACCOLTO.has(t.sorta)
  const fr = raccolto !== null && soggetta ? (RACCOLTO[raccolto]?.fattore ?? 1) : 1
  const dopoRaccolto = dopoFedelta * fr
  const finale = Math.round(t.guastata ? dopoRaccolto / 2 : dopoRaccolto)

  const passaggi: string[] = [
    `Rendita base ${t.renditaBase} fl` + (migliorie ? ` più migliorie ${migliorie} fl = ${conMigliorie} fl` : ''),
    `Fedeltà ${t.fedelta} (${etichettaFedelta(t.fedelta)}): × ${ff.toFixed(2)} = ${Math.round(dopoFedelta)} fl`,
  ]
  if (raccolto !== null && soggetta) {
    passaggi.push(`Raccolto ${raccolto} (${RACCOLTO[raccolto]?.etichetta}): × ${fr} = ${Math.round(dopoRaccolto)} fl`)
  } else if (raccolto !== null) {
    passaggi.push('Sorta non soggetta all’annata agraria: il raccolto non si applica')
  }
  if (t.guastata) passaggi.push(`Terra guastata: la rendita dell’anno si dimezza = ${finale} fl`)

  return { base: t.renditaBase, migliorie, conMigliorie, fattoreFedelta: ff, dopoFedelta,
           fattoreRaccolto: fr, dopoRaccolto, guastata: t.guastata, finale, passaggi }
}

export function renditaAnnuaTerre(terre: Terra[], anno: number, raccolti: Record<string, number>, regionePerTerra: (t: Terra) => string): number {
  return terre.reduce((s, t) => s + computaRendita(t, anno, raccolti[regionePerTerra(t)] ?? null).finale, 0)
}

export function terraNuova(sorta: SortaTerra, nome: string, luogo: string, id: string): Terra {
  const s = SORTE_TERRA[sorta]
  return {
    id, nome, luogo, sorta, fuochi: 0, renditaBase: s.rendita, fedelta: 5, mura: 0,
    maniera: 'vecchia', titolo: 'allodio', contesa: '', presidio: '', vettovaglie: 3,
    migliorie: [], registro: [], guastata: false,
  }
}
