/** Il dominio del gioco. I nomi seguono il manuale, non l'uso informatico. */

export type Stagione = 'primavera' | 'estate' | 'autunno' | 'inverno'
export const STAGIONI: Stagione[] = ['primavera', 'estate', 'autunno', 'inverno']

export type Fase = 'nuove' | 'consiglio' | 'scene' | 'armi' | 'banco' | 'casa'
export const FASI: Fase[] = ['nuove', 'consiglio', 'scene', 'armi', 'banco', 'casa']

export type Epoca = 'bilancia' | 'calate' | 'principi'

export type NomeQualita = 'vigore' | 'destrezza' | 'ingegno' | 'animo' | 'grazia'
export const QUALITA: NomeQualita[] = ['vigore', 'destrezza', 'ingegno', 'animo', 'grazia']
export type Qualita = Record<NomeQualita, number>

export type Arti = Record<string, number>

export type Ceto =
  | 'grandi' | 'gentiluomini' | 'popolani-grassi' | 'popolani-mediocri' | 'forestieri'

export type Tenore = 'stretto' | 'onorevole' | 'splendido' | 'magnifico' | 'principesco'

export type SortaTerra =
  | 'podere' | 'casa-pigione' | 'bottega-affitto' | 'fondaco' | 'mulino' | 'gualchiera'
  | 'villa' | 'villa-grande' | 'castello' | 'terra-murata' | 'citta' | 'pieve'
  | 'approdo' | 'cava' | 'miniera' | 'gregge' | 'gabella'

export type TitoloTerra = 'allodio' | 'livello' | 'enfiteusi' | 'feudo' | 'appalto'
export type ManieraMura = 'vecchia' | 'moderna'

/** `anno` è l'anno in cui fu costruita; `dalAnno` quello dal quale comincia a rendere. */
export interface Miglioria {
  id: string; nome: string; anno: number; dalAnno: number; costo: number; resa: number
}

export interface RigaRegistroTerra {
  anno: number; raccolto: number | null; fedelta: number; riscosso: number; note: string
}

export interface Terra {
  id: string
  nome: string
  luogo: string
  sorta: SortaTerra
  fuochi: number
  renditaBase: number
  fedelta: number          // 0–10
  mura: number             // 0–5
  maniera: ManieraMura
  titolo: TitoloTerra
  contesa: string
  presidio: string
  vettovaglie: number      // mesi
  migliorie: Miglioria[]
  registro: RigaRegistroTerra[]
  guastata: boolean        // rendita dimezzata per l'anno in corso
}

export type SortaImpresa =
  | 'lana' | 'seta' | 'tintoria' | 'banco-minuto' | 'bottega-minore' | 'fondaco-panni' | 'banco'

export interface Impresa {
  id: string
  nome: string
  sorta: SortaImpresa
  fondo: number
  depositi: number          // solo per il banco
  utileUltimoAnno: number
  chiLaGoverna: string
}

export interface Traffico {
  id: string
  descrizione: string
  capitale: number
  rotta: 'toscana' | 'italia' | 'ponente' | 'levante'
  assicurato: boolean
  partitoIl: { anno: number; stagione: Stagione }
  ritornoAtteso: number | null
}

export interface Beneficio {
  id: string; nome: string; chiLoTiene: string; rendita: number
}

export interface Debito {
  id: string; verso: string; quanto: number; interesse: number; scadenza: string
}

export type PostoInCasa =
  | 'capo' | 'consorte' | 'fratello' | 'rampollo' | 'cadetto' | 'figlia'
  | 'vedova-reggente' | 'maritata-fuori' | 'zio' | 'cugino' | 'bastardo'

export type StatoCongiunto =
  | 'in-casa' | 'studio' | 'bottega' | 'chiesa' | 'a-soldo' | 'ambasceria'
  | 'in-ufficio' | 'in-bando' | 'prigione' | 'infermo' | 'maritata' | 'monacata' | 'morto'

export interface Ufficio { id: string; nome: string; anno: number; frutto: string }
export interface Relazione { id: string; persona: string; cheCosaE: string; cheVuole: string }

export interface Congiunto {
  id: string
  nome: string
  patronimico: string
  eta: number
  sesso: 'm' | 'f'
  posto: PostoInCasa
  stato: StatoCongiunto
  dove: string
  qualita: Qualita
  arti: Arti
  pregio: string
  difetto: string
  fortuna: number
  ferite: number
  uffici: Ufficio[]
  relazioni: Relazione[]
  finePartcolare: string      // segreto al solo giocatore
  giocatore: string | null    // chi lo interpreta
  note: string
}

export type Rete = 'palazzo' | 'mercato' | 'chiesa' | 'contado' | 'malavita' | 'fuori'
export const RETI: Rete[] = ['palazzo', 'mercato', 'chiesa', 'contado', 'malavita', 'fuori']

export interface Faccendiere {
  id: string
  nome: string
  eta: number
  origine: string
  mestiere: string
  qualita: Qualita
  arti: Arti
  reti: Record<Rete, number>
  retiUsate: Record<Rete, boolean>
  pregio: string
  difetto: string
  fortuna: number
  ferite: number
  patronoId: string | null    // id del casato servito
  salario: number
  credito: number             // noto a entrambi
  mandato: string
  fedelta: number             // SEGRETO: solo il giocatore che lo regge
  ambizione: string           // SEGRETO
  secondoMandato: string      // SEGRETO
  saputo: string              // SEGRETO
  giocatore: string | null
}

export interface Seguito {
  citta: string
  valore: number              // 0–10
  polizze: number
  posizione: 'reggimento' | 'aderenti' | 'esclusi' | 'nemici'
  divieto: number             // tratte da saltare
  aSpecchio: boolean
}

export interface Legame {
  id: string
  conCasato: string           // id o nome se casa non giocante
  sorta: 'parentado' | 'credito' | 'compagnia' | 'ruggine' | 'offesa' | 'obbligo' | 'inimicizia'
  descrizione: string
}

export interface Casato {
  id: string
  nome: string
  arme: string
  motto: string
  citta: string
  ceto: Ceto
  inCittaDal: string
  radice: string
  patrimonio: number
  tenore: Tenore
  onore: number
  sospetto: number
  magnificenza: number
  gradoArmi: number           // 0–5
  seguiti: Seguito[]
  terre: Terra[]
  imprese: Impresa[]
  traffici: Traffico[]
  benefici: Beneficio[]
  debiti: Debito[]
  congiunti: Congiunto[]
  faccendieri: Faccendiere[]
  legami: Legame[]
  macchie: string[]
  amici: string[]
  famigli: number
  giocatori: string[]         // chi regge questo casato
  ricordanze: string
}

export type ObiettivoTrama =
  | 'sapere' | 'volgere' | 'guastare' | 'infamare' | 'prendere'
  | 'rovinare' | 'sbandire' | 'uccidere' | 'congiurare'

export type MetodoTrama =
  | 'spionaggio' | 'corruzione' | 'seduzione' | 'falsificazione' | 'legge'
  | 'voce' | 'chiesa' | 'denaro' | 'veleno' | 'ferro'

export interface RigaTrama {
  anno: number; stagione: Stagione; tiro: number; totale: number
  esito: string; passi: number; sospetto: number; spesa: number
}

export interface Trama {
  id: string
  casatoMandante: string
  esecutore: string
  bersaglio: string
  obiettivo: ObiettivoTrama
  metodo: MetodoTrama
  guardiaBersaglio: number
  congiurati: number
  passi: number
  sospetto: number
  avanzamento: RigaTrama[]
  stato: 'in-corso' | 'compiuta' | 'scoperta' | 'abbandonata'
  descrizione: string
  esito: string
}

export interface VoceGiornale {
  id: string
  anno: number
  stagione: Stagione
  fase: Fase | null
  casatoId: string | null
  testo: string
  quando: string              // ISO
  autore: string
  privata: boolean            // visibile al solo Arbitro e al casato interessato
}

export interface CasaNonGiocante {
  id: string; nome: string; ceto: string; onore: number; seguito: number
  ricchezza: string; capo: string; cheVuole: string; polizze: number
}

export interface Campagna {
  id: string
  nome: string
  epoca: Epoca
  cittaPrincipale: string
  anno: number
  stagione: Stagione
  fase: Fase
  arbitro: string
  casati: Casato[]
  caseNonGiocanti: CasaNonGiocante[]
  trame: Trama[]
  giornale: VoceGiornale[]
  gettoniNeutri: number
  anniSquittinio: number[]
  prezzoGrano: number         // soldi lo staio
  raccolti: Record<string, number>   // regione -> ultimo 2d6
  creataIl: string
  aggiornataIl: string
  versione: number
}
