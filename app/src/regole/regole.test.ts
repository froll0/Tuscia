import { describe, it, expect } from 'vitest'
import { valutaProva, gradoDi } from './prova'
import { computaRendita, terraNuova } from './terre'
import { risolviColpo, gradoColpo, statoDelFerito } from './combattimento'
import { contoPuntiDiCasa, contoPersonaggio, qualitaVuote, modificatoriEta } from './creazione'
import { numeriTrama, passiPerStagione } from './trame'
import { bilancioStagione, azioniDisponibili } from './bilancio'
import { speseAnnueDiCasa, doteAttesa, sogliaFertilita, sogliaMortalita, corpoDi } from './casa'
import { creaSorte } from './dado'
import type { Casato, Congiunto, Terra } from '../modello/tipi'

/* ------------------------------------------------------------ fasc. 05 */
describe('La Prova', () => {
  it('legge i quattro gradi ai loro confini', () => {
    expect(gradoDi(15, 10)).toBe(3)   // C+5
    expect(gradoDi(14, 10)).toBe(2)
    expect(gradoDi(10, 10)).toBe(2)   // C esatto
    expect(gradoDi(9, 10)).toBe(1)    // C−1
    expect(gradoDi(7, 10)).toBe(1)    // C−3
    expect(gradoDi(6, 10)).toBe(0)    // C−4
  })

  it('il doppio sei alza di un grado; il doppio asso fa comunque fallire', () => {
    const fortuna = valutaProva([6, 6], 0, 14)     // totale 12, sarebbe Esito dubbio
    expect(fortuna.colpoDiFortuna).toBe(true)
    expect(fortuna.grado).toBe(2)
    const tracollo = valutaProva([1, 1], 20, 6)    // totale 22, sarebbe Successo pieno
    expect(tracollo.tracollo).toBe(true)
    expect(tracollo.grado).toBe(0)
  })

  it('la sorte seminata è riproducibile', () => {
    const a = creaSorte(1234), b = creaSorte(1234)
    expect([a.d2d6(), a.d2d6()]).toEqual([b.d2d6(), b.d2d6()])
  })
})

/* ------------------- fasc. 18: le prove dell'esempio di gioco tornano */
describe("L'esempio di gioco del fascicolo 18", () => {
  it('il seguito di Filippo: 6 sui dadi + 5 + 1 contro 10 dà Successo', () => {
    const r = valutaProva([4, 2], 5 + 1, 10)
    expect(r.totale).toBe(12)
    expect(r.nome).toBe('Successo')
  })
  it('il parentado di monna Ginevra: 6 + 6 − 2 − 1 contro 11 dà Esito dubbio', () => {
    const r = valutaProva([3, 3], 6 - 2 - 1, 11)
    expect(r.totale).toBe(9)
    expect(r.nome).toBe('Esito dubbio')
  })
  it('la trama di ser Goro: 5 + 6 contro Guardia 11 dà Successo, un Passo', () => {
    const r = valutaProva([2, 3], 6, 11)
    expect(r.totale).toBe(11)
    expect(r.grado).toBe(2)
    expect(passiPerStagione(r).passi).toBe(1)
  })
})

/* --------------------------------- fasc. 05 § 6.8: i quattro scambi */
describe("L'esempio di combattimento del fascicolo 05", () => {
  it('primo scambio: margine 2, spada contro corsaletto, il colpo non passa', () => {
    const c = risolviColpo(2, 2, 2)
    expect(c.nomeGrado).toBe('Colpo di striscio')
    expect(c.ferite).toBe(0)
    expect(c.scomposto).toBe(true)
  })
  it('secondo scambio: margine 3, spada contro giaco, due Ferite', () => {
    expect(risolviColpo(3, 2, 1).ferite).toBe(2)
  })
  it('terzo scambio: alle giunture, il corsaletto non ripara, tre Ferite', () => {
    const c = risolviColpo(3, 2, 2, true)
    expect(c.riparo).toBe(0)
    expect(c.ferite).toBe(3)
  })
  it('quarto scambio: margine 7 è colpo grave, due Ferite attraverso il corsaletto', () => {
    const c = risolviColpo(7, 2, 2)
    expect(c.grado).toBe(2)
    expect(c.ferite).toBe(2)
  })
  it('a parità nessuno colpisce', () => {
    expect(gradoColpo(0).nome).toContain('parità')
    expect(risolviColpo(0, 3, 0).ferite).toBe(0)
  })
  it('la spada non passa l’armatura completa se non con colpo grave', () => {
    expect(risolviColpo(4, 2, 3).ferite).toBe(0)   // pieno: 1+2−3
    expect(risolviColpo(6, 2, 3).ferite).toBe(1)   // grave: 2+2−3
  })
  it('l’archibugio passa l’armatura completa', () => {
    expect(risolviColpo(4, 4, 3).ferite).toBe(2)
  })
  it('lo stato del ferito segue il Corpo', () => {
    const corpo = corpoDi({ qualita: { vigore: 3, destrezza: 2, ingegno: 2, animo: 2, grazia: 2 } })
    expect(corpo).toBe(6)
    expect(statoDelFerito(2, corpo).penalita).toBe(0)
    expect(statoDelFerito(3, corpo).penalita).toBe(-1)
    expect(statoDelFerito(6, corpo).aTerra).toBe(true)
  })
})

/* ------------------------------------------------------------ fasc. 07 */
describe('Le rendite delle terre', () => {
  const villa = (): Terra => ({
    ...terraNuova('villa', 'Pontassieve', 'Valdarno', 't1'),
    fedelta: 7,
    migliorie: [{ id: 'm1', nome: 'Mulino', anno: 1465, dalAnno: 1466, costo: 400, resa: 35 }],
  })

  it("l'esempio del fascicolo 07 torna: 140 + 35, Fedeltà 7, raccolto 5 → 154 fl", () => {
    const c = computaRendita(villa(), 1467, 5)
    expect(c.conMigliorie).toBe(175)
    expect(Math.round(c.dopoFedelta)).toBe(193)
    expect(c.finale).toBe(154)
  })

  it("con Fedeltà 3 la medesima terra rende 119 fl", () => {
    const c = computaRendita({ ...villa(), fedelta: 3 }, 1467, 5)
    expect(c.finale).toBe(119)
  })

  it('una miglioria non ancora matura non rende', () => {
    const t = { ...villa(), migliorie: [{ id: 'm', nome: 'Oliveto', anno: 1467, dalAnno: 1475, costo: 250, resa: 35 }] }
    expect(computaRendita(t, 1467, null).migliorie).toBe(0)
    expect(computaRendita(t, 1475, null).migliorie).toBe(35)
  })

  it('la ribellione azzera la rendita e il guasto la dimezza', () => {
    expect(computaRendita({ ...villa(), fedelta: 0 }, 1467, null).finale).toBe(0)
    expect(computaRendita({ ...villa(), guastata: true }, 1467, null).finale).toBe(96)
  })

  it('le case da pigione non dipendono dall’annata', () => {
    const casa = terraNuova('casa-pigione', 'Casa in Oltrarno', 'Firenze', 't2')
    expect(computaRendita(casa, 1467, 2).finale).toBe(18)
  })
})

/* ------------------------------------------------------------ fasc. 03 */
describe('I Punti di Casa', () => {
  const vuota = {
    gradoPatrimonio: 0, puntiInTerre: 0, seguito: 0, onore: 2, gradoArmi: 0,
    congiuntiOltre: 0, figliOltre: 0, magnificenza: 0, amici: 0, polizze: 0,
    beneficiPc: 0, macchie: [] as string[],
  }

  it('parte da ventiquattro punti', () => {
    expect(contoPuntiDiCasa(vuota).disponibili).toBe(24)
    expect(contoPuntiDiCasa(vuota).spesi).toBe(0)
  })

  it('il casato dei Bencivenni alla creazione spende ventiquattro punti esatti', () => {
    // capo, consorte, due figli e un congiunto adulto sono gratuiti: i cinque
    // Bencivenni ci stanno dentro senza spesa aggiuntiva.
    const c = contoPuntiDiCasa({
      ...vuota, gradoPatrimonio: 2, puntiInTerre: 4, seguito: 3, onore: 5,
      gradoArmi: 1, magnificenza: 1,
    })
    expect(c.spesi).toBe(6 + 4 + 6 + 3 + 3 + 2)
    expect(c.spesi).toBe(24)
    expect(c.restanti).toBe(0)
    expect(c.errori).toEqual([])
    expect(c.patrimonioFiorini).toBe(1500)
    expect(c.renditaFiorini).toBe(240)
  })

  it('le Macchie rendono punti ma non oltre otto', () => {
    const c = contoPuntiDiCasa({ ...vuota, macchie: ['A specchio', 'Debito', 'Infamia'] })
    expect(c.guadagnati).toBe(10)
    expect(c.errori[0]).toContain('non possono rendere più di 8')
  })

  it('vieta il Seguito superiore all’Onore + 2', () => {
    const c = contoPuntiDiCasa({ ...vuota, onore: 2, seguito: 5 })
    expect(c.errori.some((e) => e.includes('Onore + 2'))).toBe(true)
  })
})

describe('La creazione dei personaggi', () => {
  it("l'età sposta i punti di Arti e le Qualità del corpo", () => {
    expect(modificatoriEta(18).artiExtra).toBe(-3)
    expect(modificatoriEta(30).artiExtra).toBe(0)
    expect(modificatoriEta(44).artiExtra).toBe(3)
    expect(modificatoriEta(60)).toMatchObject({ artiExtra: 6, vigore: -1, destrezza: -1 })
    expect(modificatoriEta(70)).toMatchObject({ artiExtra: 8, vigore: -2, destrezza: -2 })
  })

  it('Filippo Bencivenni, 44 anni, sta nei punti', () => {
    const q = { ...qualitaVuote(), ingegno: 4, animo: 3, grazia: 3 }
    const arti = { Computo: 3, Manifattura: 2, Legge: 2, Cerimoniale: 2, Retorica: 1 }
    const c = contoPersonaggio(q, arti, 44)
    expect(c.puntiQualitaUsati).toBe(4)
    expect(c.puntiArtiUsati).toBe(10)
    expect(c.puntiArtiDisponibili).toBe(15)
    expect(c.errori).toEqual([])
  })

  it('rifiuta una Qualità a 5 alla creazione', () => {
    const q = { ...qualitaVuote(), ingegno: 5 }
    expect(contoPersonaggio(q, {}, 30).errori.some((e) => e.includes('supera 4'))).toBe(true)
  })
})

/* ------------------------------------------------------------ fasc. 13 */
describe('Le trame', () => {
  it("l'esempio del fascicolo 13: Rovinare per via di denaro dà 5 Passi e soglia 6", () => {
    expect(numeriTrama('rovinare', 'denaro')).toMatchObject({ passiRichiesti: 5, soglia: 6 })
  })
  it('il ferro è rapido e si scopre presto', () => {
    expect(numeriTrama('uccidere', 'ferro')).toMatchObject({ passiRichiesti: 3, soglia: 1 })
  })
  it('ogni congiurato oltre il primo affretta la trama e ne abbassa la soglia', () => {
    const solo = numeriTrama('congiurare', 'ferro', 1)
    const in4 = numeriTrama('congiurare', 'ferro', 4)
    expect(in4.soglia).toBe(Math.max(1, solo.soglia - 3))
    // 10 contro Contrasto 8 è Successo, non Successo pieno: un Passo più i tre congiurati
    expect(passiPerStagione(valutaProva([5, 5], 0, 8), 4).passi).toBe(1 + 3)
  })
  it("l'esito dubbio dà un Passo e un Sospetto", () => {
    const r = valutaProva([3, 3], 2, 10)   // totale 8, C10 → dubbio
    expect(passiPerStagione(r)).toEqual({ passi: 1, sospetto: 1 })
  })
})

/* ------------------------------------------------------------ fasc. 06/10 */
function casatoDiProva(): Casato {
  const c: Congiunto = {
    id: 'c1', nome: 'Filippo', patronimico: 'di Antonio', eta: 44, sesso: 'm', posto: 'capo',
    stato: 'in-casa', dove: 'Firenze', qualita: { vigore: 2, destrezza: 2, ingegno: 4, animo: 3, grazia: 3 },
    arti: {}, pregio: '', difetto: '', fortuna: 3, ferite: 0, uffici: [], relazioni: [],
    finePartcolare: '', giocatore: null, note: '',
  }
  return {
    id: 'k1', nome: 'Bencivenni', arme: '', motto: '', citta: 'Firenze', ceto: 'popolani-grassi',
    inCittaDal: '1347', radice: 'Lana', patrimonio: 1900, tenore: 'onorevole', onore: 5,
    sospetto: 1, magnificenza: 1, gradoArmi: 1,
    seguiti: [{ citta: 'Firenze', valore: 3, polizze: 2, posizione: 'aderenti', divieto: 0, aSpecchio: false }],
    terre: [
      { ...terraNuova('villa', 'Pontassieve', 'Valdarno', 't1') },
      { ...terraNuova('casa-pigione', 'Casa in Oltrarno', 'Firenze', 't2'), renditaBase: 36 },
    ],
    imprese: [{ id: 'i1', nome: 'Bottega di Lana', sorta: 'lana', fondo: 1500, depositi: 0, utileUltimoAnno: 150, chiLaGoverna: 'Bartolomeo' }],
    traffici: [], benefici: [], debiti: [],
    congiunti: [c, { ...c, id: 'c2', nome: 'Ginevra', sesso: 'f', posto: 'consorte', eta: 38 },
                { ...c, id: 'c3', nome: 'Bartolomeo', posto: 'fratello', eta: 39 },
                { ...c, id: 'c4', nome: 'Neri', posto: 'rampollo', eta: 19, stato: 'studio' },
                { ...c, id: 'c5', nome: 'Caterina', sesso: 'f', posto: 'figlia', eta: 13 }],
    faccendieri: [{
      id: 'f1', nome: 'ser Goro da Empoli', eta: 35, origine: 'Empoli', mestiere: 'notaio',
      qualita: { vigore: 2, destrezza: 2, ingegno: 3, animo: 2, grazia: 3 }, arti: {},
      reti: { palazzo: 2, mercato: 1, chiesa: 1, contado: 0, malavita: 0, fuori: 0 },
      retiUsate: { palazzo: false, mercato: false, chiesa: false, contado: false, malavita: false, fuori: false },
      pregio: '', difetto: '', fortuna: 3, ferite: 0, patronoId: 'k1', salario: 45, credito: 4,
      mandato: '', fedelta: 3, ambizione: '', secondoMandato: '', saputo: '', giocatore: null,
    }],
    legami: [], macchie: [], amici: [], famigli: 3, giocatori: [], ricordanze: '',
  }
}

describe('Il bilancio e le Azioni', () => {
  it('conta gli Uomini di Casa idonei come il fascicolo 18', () => {
    // Filippo, Ginevra, Bartolomeo e ser Goro: Neri è allo Studio, Caterina ha 13 anni
    expect(azioniDisponibili(casatoDiProva())).toBe(4)
  })

  it('in primavera la rendita delle terre non entra, le pigioni sì', () => {
    const b = bilancioStagione(casatoDiProva(), 'primavera', 1467, {}, () => 'Valdarno')
    expect(b.entrate.find((v) => v.nome === 'Rendita delle terre')!.fiorini).toBe(0)
    expect(b.entrate.find((v) => v.nome.startsWith('Pigioni'))!.fiorini).toBe(9)
    expect(b.entrate.find((v) => v.nome.startsWith('Utili'))!.fiorini).toBe(38)
    expect(b.totaleEntrate).toBe(47)
  })

  it('in autunno entra la rendita delle terre, secondo il raccolto', () => {
    const b = bilancioStagione(casatoDiProva(), 'autunno', 1467, { Valdarno: 5 }, () => 'Valdarno')
    expect(b.entrate.find((v) => v.nome === 'Rendita delle terre')!.fiorini).toBe(112) // 140 × 0,8
  })

  it('le uscite di stagione comprendono tenore, famigli, salari e Armi', () => {
    const b = bilancioStagione(casatoDiProva(), 'primavera', 1467, {}, () => 'Valdarno')
    const u = (n: string) => b.uscite.find((v) => v.nome.startsWith(n))!.fiorini
    expect(u('Spese di casa')).toBe(38)      // 150 ÷ 4
    expect(u('Congiunti oltre')).toBe(3)     // 12 ÷ 4
    expect(u('Famigli')).toBe(8)             // 30 ÷ 4
    expect(u('Salari')).toBe(11)             // 45 ÷ 4
    expect(u('Mantenimento delle Armi')).toBe(25)
    expect(b.totaleUscite).toBe(85)
  })

  it('le spese annue di casa seguono il tenore', () => {
    expect(speseAnnueDiCasa(casatoDiProva())).toMatchObject({ tenore: 150, congiunti: 12, famigli: 30, totale: 192 })
  })
})

describe('La casa', () => {
  it('le doti crescono del due per cento l’anno', () => {
    const a = doteAttesa(2, 1450), b = doteAttesa(2, 1470)
    expect(a.min).toBe(1500)
    expect(b.min).toBeGreaterThan(2200)
  })
  it('la fertilità cala con l’età e cessa a quarantotto anni', () => {
    expect(sogliaFertilita(22)).toBe(6)
    expect(sogliaFertilita(38)).toBe(9)
    expect(sogliaFertilita(50)).toBe(99)
  })
  it('la mortalità cresce con l’età', () => {
    expect(sogliaMortalita(25)).toBe(2)
    expect(sogliaMortalita(60)).toBe(10)
    expect(sogliaMortalita(80)).toBe(30)
  })
})
