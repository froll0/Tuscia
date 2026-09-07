/** fasc. 05 § 6 — il combattere di persona. */

export const ARMI = [
  { nome: 'Pugni, calci', danno: 0 },
  { nome: 'Bastone, sasso, sgabello', danno: 1 },
  { nome: 'Pugnale, stiletto', danno: 1 },
  { nome: 'Spada, spiedo, roncola', danno: 2 },
  { nome: 'Spadone, lancia, azza, partigiana', danno: 3 },
  { nome: 'Balestra', danno: 3 },
  { nome: 'Archibugio', danno: 4 },
]
export const ARMATURE = [
  { nome: 'Nessuna: veste e farsetto', riparo: 0 },
  { nome: 'Giaco di maglia sotto la veste', riparo: 1 },
  { nome: 'Corsaletto, celata', riparo: 2 },
  { nome: 'Armatura completa da uomo d’arme', riparo: 3 },
]

export type GradoColpo = 0 | 1 | 2

export function gradoColpo(margine: number): { grado: GradoColpo; nome: string } {
  if (margine <= 0) return { grado: 0, nome: 'Nessuno: a parità nessuno colpisce' }
  if (margine <= 2) return { grado: 0, nome: 'Colpo di striscio' }
  if (margine <= 5) return { grado: 1, nome: 'Colpo pieno' }
  return { grado: 2, nome: 'Colpo grave' }
}

export interface Colpo {
  margine: number; grado: GradoColpo; nomeGrado: string
  danno: number; riparo: number; ferite: number; scomposto: boolean; passa: boolean
}

export function risolviColpo(margine: number, danno: number, riparo: number, alleGiunture = false): Colpo {
  const g = gradoColpo(margine)
  const riparoEffettivo = alleGiunture ? Math.max(0, riparo - 2) : riparo
  const ferite = margine <= 0 ? 0 : Math.max(0, g.grado + danno - riparoEffettivo)
  return {
    margine, grado: g.grado, nomeGrado: g.nome, danno, riparo: riparoEffettivo,
    ferite, passa: ferite > 0, scomposto: margine > 0 && ferite === 0,
  }
}

/** fasc. 05 § 6.6 — vincere senza ferire. */
export const ESITI_SENZA_FERITE = [
  { margine: 1, esito: 'Scostare l’avversario e disimpegnarsi' },
  { margine: 3, esito: 'Disarmarlo' },
  { margine: 3, esito: 'Atterrarlo' },
  { margine: 3, esito: 'Sospingerlo dove si vuole' },
  { margine: 6, esito: 'Afferrarlo e tenerlo' },
  { margine: 6, esito: 'Costringerlo alla resa (se ha già Ferite pari a metà del Corpo)' },
]

export function statoDelFerito(ferite: number, corpo: number): { stato: string; penalita: number; aTerra: boolean } {
  if (ferite >= corpo) return { stato: 'A terra, fuori di combattimento', penalita: 0, aTerra: true }
  if (ferite >= corpo / 2) return { stato: 'Ferito: −1 a ogni azione, si perde sangue', penalita: -1, aTerra: false }
  return { stato: 'Illeso o quasi', penalita: 0, aTerra: false }
}
