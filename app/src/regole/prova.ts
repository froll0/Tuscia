/** fasc. 05 — la Prova: 2d6 + Qualità + Arte + modificatori contro un Contrasto. */
import { GRADI_ESITO } from './tavole'
import type { Sorte } from './dado'

export type Grado = 0 | 1 | 2 | 3

export interface RisultatoProva {
  dadi: [number, number]
  somma: number
  bonus: number
  totale: number
  contrasto: number
  grado: Grado
  nome: string
  glossa: string
  colpoDiFortuna: boolean
  tracollo: boolean
}

export function gradoDi(totale: number, contrasto: number): Grado {
  if (totale >= contrasto + 5) return 3
  if (totale >= contrasto) return 2
  if (totale >= contrasto - 3) return 1
  return 0
}

export function valutaProva(dadi: [number, number], bonus: number, contrasto: number): RisultatoProva {
  const [a, b] = dadi
  const somma = a + b
  const totale = somma + bonus
  let grado = gradoDi(totale, contrasto)
  const tracollo = a === 1 && b === 1
  const colpoDiFortuna = a === 6 && b === 6
  if (tracollo) grado = 0
  else if (colpoDiFortuna) grado = Math.min(3, grado + 1) as Grado

  const scheda = GRADI_ESITO[grado]
  let nome: string = scheda.nome
  let glossa: string = scheda.glossa
  if (tracollo) {
    nome = 'Tracollo'
    glossa = 'Fallisce comunque, e accade inoltre qualcosa di rovinoso.'
  } else if (colpoDiFortuna) {
    nome = `Colpo di fortuna — ${scheda.nome}`
    glossa = `${scheda.glossa} Accade inoltre qualcosa di favorevole che non si era cercato.`
  }
  return { dadi, somma, bonus, totale, contrasto, grado, nome, glossa, colpoDiFortuna, tracollo }
}

export function tiraProva(s: Sorte, bonus: number, contrasto: number): RisultatoProva {
  return valutaProva(s.d2d6(), bonus, contrasto)
}

/** fasc. 05 § 3 — la Contesa: vince il totale maggiore; a parità, chi difende. */
export interface RisultatoContesa {
  assalitore: number; difensore: number; margine: number; vince: 'assalitore' | 'difensore' | 'parita'
}
export function valutaContesa(totaleAssalitore: number, totaleDifensore: number): RisultatoContesa {
  const margine = Math.abs(totaleAssalitore - totaleDifensore)
  const vince = totaleAssalitore > totaleDifensore ? 'assalitore'
    : totaleAssalitore < totaleDifensore ? 'difensore' : 'parita'
  return { assalitore: totaleAssalitore, difensore: totaleDifensore, margine, vince }
}
