/** Costruttori delle entità vuote. */
import type {
  Campagna, Casato, Congiunto, Faccendiere, Epoca, Qualita, Rete,
} from './tipi'
import { RETI } from './tipi'
import { EPOCHE } from '../regole/tavole'
import { qualitaVuote } from '../regole/creazione'

export const nuovoId = (): string =>
  (globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2)}`)

export function campagnaNuova(nome: string, epoca: Epoca, citta: string, arbitro: string): Campagna {
  const e = EPOCHE[epoca]!
  const ora = new Date().toISOString()
  return {
    id: nuovoId(), nome, epoca, cittaPrincipale: citta,
    anno: e.consigliato, stagione: 'primavera', fase: 'nuove', arbitro,
    casati: [], caseNonGiocanti: [], trame: [], giornale: [],
    gettoniNeutri: 10,
    anniSquittinio: [e.consigliato + 1, e.consigliato + 6, e.consigliato + 11],
    prezzoGrano: 18, raccolti: {},
    creataIl: ora, aggiornataIl: ora, versione: 0,
  }
}

export function casatoNuovo(nome: string, citta: string): Casato {
  return {
    id: nuovoId(), nome, arme: '', motto: '', citta, ceto: 'popolani-grassi',
    inCittaDal: '', radice: 'Lana', patrimonio: 0, tenore: 'onorevole',
    onore: 2, sospetto: 0, magnificenza: 0, gradoArmi: 0,
    seguiti: [{ citta, valore: 0, polizze: 0, posizione: 'esclusi', divieto: 0, aSpecchio: false }],
    terre: [], imprese: [], traffici: [], benefici: [], debiti: [],
    congiunti: [], faccendieri: [], legami: [], macchie: [], amici: [],
    famigli: 0, giocatori: [], ricordanze: '',
  }
}

export function congiuntoNuovo(nome = '', qualita: Qualita = qualitaVuote()): Congiunto {
  return {
    id: nuovoId(), nome, patronimico: '', eta: 30, sesso: 'm', posto: 'capo',
    stato: 'in-casa', dove: '', qualita, arti: {}, pregio: '', difetto: '',
    fortuna: 3, ferite: 0, uffici: [], relazioni: [], finePartcolare: '',
    giocatore: null, note: '',
  }
}

export function faccendiereNuovo(nome = ''): Faccendiere {
  const zero = RETI.reduce((o, r) => { o[r] = 0; return o }, {} as Record<Rete, number>)
  const falso = RETI.reduce((o, r) => { o[r] = false; return o }, {} as Record<Rete, boolean>)
  return {
    id: nuovoId(), nome, eta: 35, origine: '', mestiere: 'notaio',
    qualita: qualitaVuote(), arti: {}, reti: { ...zero }, retiUsate: { ...falso },
    pregio: '', difetto: '', fortuna: 3, ferite: 0, patronoId: null, salario: 45,
    credito: 3, mandato: '', fedelta: 3, ambizione: '', secondoMandato: '',
    saputo: '', giocatore: null,
  }
}
