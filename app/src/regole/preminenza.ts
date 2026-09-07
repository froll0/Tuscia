/** fasc. 15 — il computo della Preminenza. */
import { PESI_PREMINENZA as P } from './tavole'
import { computaRendita } from './terre'
import type { Casato } from '../modello/tipi'

export interface VocePreminenza { gruppo: string; nome: string; punti: number }
export interface Preminenza { voci: VocePreminenza[]; totale: number }

export function computaPreminenza(casato: Casato, anno: number): Preminenza {
  const v: VocePreminenza[] = []
  const agg = (gruppo: string, nome: string, punti: number) => { if (punti) v.push({ gruppo, nome, punti }) }

  const rendita = casato.terre.reduce((s, t) => s + computaRendita(t, anno, null).finale, 0)
    + casato.imprese.reduce((s, i) => s + i.utileUltimoAnno, 0)
    + casato.benefici.reduce((s, b) => s + b.rendita, 0)
  agg('Sostanze', 'Rendita annua', Math.floor(rendita / P.renditaOgni))
  agg('Sostanze', 'Patrimonio', Math.floor(casato.patrimonio / P.patrimonioOgni))
  const debiti = casato.debiti.reduce((s, d) => s + d.quanto, 0)
  agg('Sostanze', 'Debiti', -Math.floor(debiti / P.debitoOgni))

  for (const t of casato.terre) {
    if (t.sorta === 'villa' || t.sorta === 'villa-grande') agg('Terre', t.nome, P.villa)
    else if (t.sorta === 'castello') agg('Terre', t.nome, P.castello)
    else if (t.sorta === 'terra-murata') agg('Terre', t.nome, P.terraMurata)
    else if (t.sorta === 'citta') agg('Terre', t.nome, P.citta)
    if (t.titolo === 'feudo') agg('Terre', `${t.nome}: feudo riconosciuto`, P.feudo)
  }

  const uffici = casato.congiunti.reduce((s, c) => s + c.uffici.length, 0)
  agg('Uffici', 'Uffici maggiori tenuti', Math.min(8, uffici))
  const seguito = casato.seguiti.reduce((s, g) => s + g.valore, 0)
  agg('Uffici', 'Seguito', Math.floor(seguito / P.seguitoOgni))
  for (const g of casato.seguiti) {
    if (g.posizione === 'reggimento') agg('Uffici', `Del reggimento in ${g.citta}`, P.delReggimento)
  }

  agg('Chiesa', 'Benefici', Math.min(4, casato.benefici.length) * P.beneficioMinore)

  const maschi = casato.congiunti.filter((c) => c.sesso === 'm' && c.eta >= 16 && c.stato !== 'morto').length
  agg('Sangue', 'Maschi adulti che portano il nome', maschi * P.maschioAdulto)
  const parentadi = casato.legami.filter((l) => l.sorta === 'parentado').length
  agg('Sangue', 'Parentadi in essere', parentadi * P.legameGiocante)
  if (maschi === 0) agg('Sangue', 'Casato estinto in linea maschile', P.estinto)

  agg('Fama', 'Onore', casato.onore * P.onore)
  agg('Fama', 'Magnificenza', casato.magnificenza * P.magnificenza)
  agg('Fama', 'Sospetto', -Math.floor(casato.sospetto / P.sospettoOgni))

  const banditi = casato.congiunti.filter((c) => c.stato === 'in-bando').length
  agg('Rovesci', 'Congiunti in bando', banditi * P.congiuntoInBando)

  return { voci: v, totale: v.reduce((s, x) => s + x.punti, 0) }
}
