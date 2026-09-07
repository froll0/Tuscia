/** fasc. 06 Fase V — il bilancio della stagione. */
import { MANTENIMENTO_ARMI } from './tavole'
import { speseAnnueDiCasa } from './casa'
import { computaRendita, RENDITA_TRIMESTRALE } from './terre'
import type { Casato, Stagione } from '../modello/tipi'

export interface Voce { nome: string; computo: string; fiorini: number }
export interface Bilancio {
  entrate: Voce[]; uscite: Voce[]
  totaleEntrate: number; totaleUscite: number
  saldo: number; patrimonioFinale: number
}

const quarto = (n: number) => Math.round(n / 4)

export function bilancioStagione(
  casato: Casato,
  stagione: Stagione,
  anno: number,
  raccolti: Record<string, number>,
  regionePerTerra: (idTerra: string) => string,
  spesaDelleAzioni = 0,
): Bilancio {
  const entrate: Voce[] = []
  const uscite: Voce[] = []

  /* --- entrate --- */
  const agrarie = casato.terre.filter((t) => !RENDITA_TRIMESTRALE.has(t.sorta))
  const urbane = casato.terre.filter((t) => RENDITA_TRIMESTRALE.has(t.sorta))
  const renditaAgraria = agrarie.reduce(
    (s, t) => s + computaRendita(t, anno, raccolti[regionePerTerra(t.id)] ?? null).finale, 0)
  entrate.push({
    nome: 'Rendita delle terre',
    computo: stagione === 'autunno' ? 'tutta in autunno, dopo il raccolto' : 'entra in autunno',
    fiorini: stagione === 'autunno' ? renditaAgraria : 0,
  })
  const renditaUrbana = urbane.reduce((s, t) => s + computaRendita(t, anno, null).finale, 0)
  if (renditaUrbana) {
    entrate.push({ nome: 'Pigioni, fondachi e appalti', computo: `${renditaUrbana} ÷ 4`, fiorini: quarto(renditaUrbana) })
  }
  const utili = casato.imprese.reduce((s, i) => s + i.utileUltimoAnno, 0)
  entrate.push({ nome: 'Utili di botteghe e banco', computo: `${utili} ÷ 4`, fiorini: quarto(utili) })
  const benefici = casato.benefici.reduce((s, b) => s + b.rendita, 0)
  if (benefici) entrate.push({ nome: 'Benefici ecclesiastici', computo: `${benefici} ÷ 4`, fiorini: quarto(benefici) })

  /* --- uscite --- */
  const spese = speseAnnueDiCasa(casato)
  uscite.push({ nome: `Spese di casa (tenore ${casato.tenore})`, computo: `${spese.tenore} ÷ 4`, fiorini: quarto(spese.tenore) })
  if (spese.congiunti) uscite.push({ nome: 'Congiunti oltre il quarto', computo: `${spese.congiunti} ÷ 4`, fiorini: quarto(spese.congiunti) })
  if (spese.famigli) uscite.push({ nome: `Famigli (${casato.famigli})`, computo: `${spese.famigli} ÷ 4`, fiorini: quarto(spese.famigli) })

  const salari = casato.faccendieri.reduce((s, f) => s + f.salario, 0)
  if (salari) uscite.push({ nome: 'Salari dei faccendieri', computo: `${salari} ÷ 4`, fiorini: quarto(salari) })

  const armi = MANTENIMENTO_ARMI[casato.gradoArmi]?.spesa ?? 0
  if (armi) uscite.push({ nome: `Mantenimento delle Armi (grado ${casato.gradoArmi})`, computo: 'per stagione', fiorini: armi })

  const interessi = casato.debiti.reduce((s, d) => s + d.quanto * d.interesse, 0)
  if (interessi) uscite.push({ nome: 'Interessi dei debiti', computo: `${Math.round(interessi)} ÷ 4`, fiorini: quarto(interessi) })

  if (spesaDelleAzioni) uscite.push({ nome: 'Spese delle Azioni della stagione', computo: 'dichiarate nel Consiglio', fiorini: spesaDelleAzioni })

  const totaleEntrate = entrate.reduce((s, v) => s + v.fiorini, 0)
  const totaleUscite = uscite.reduce((s, v) => s + v.fiorini, 0)
  const saldo = totaleEntrate - totaleUscite
  return { entrate, uscite, totaleEntrate, totaleUscite, saldo, patrimonioFinale: casato.patrimonio + saldo }
}

/** Quante Azioni ha il casato: tanti quanti gli Uomini di Casa idonei (fasc. 03 § 8). */
export function uominiIdonei(casato: Casato): { nome: string; perche: string }[] {
  const fuori = new Set(['studio', 'bottega', 'in-bando', 'prigione', 'infermo', 'morto', 'monacata', 'maritata'])
  const lista: { nome: string; perche: string }[] = []
  for (const c of casato.congiunti) {
    if (c.eta < 16) continue
    if (c.eta > 65) continue
    if (fuori.has(c.stato)) continue
    lista.push({ nome: `${c.nome} ${c.patronimico}`.trim(), perche: c.posto })
  }
  for (const f of casato.faccendieri) lista.push({ nome: f.nome, perche: `faccendiere (${f.mestiere})` })
  return lista
}

export function azioniDisponibili(casato: Casato): number {
  return Math.max(1, Math.min(5, uominiIdonei(casato).length))
}
