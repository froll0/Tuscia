/**
 * Le tavole del manuale. Questo file è la sola fonte dei numeri:
 * ogni cifra qui dentro rimanda a un fascicolo, e nessun altro file ne inventa.
 */
import type { SortaTerra, Tenore, Ceto, SortaImpresa, ObiettivoTrama, MetodoTrama, NomeQualita } from '../modello/tipi'

/* ---------------------------------------------- fasc. 05: prove e contrasti */
export const CONTRASTI = [
  { valore: 6, nome: 'Agevole', glossa: 'Riesce a chiunque non sia impedito' },
  { valore: 8, nome: 'Ordinario', glossa: 'La difficoltà del mestiere quotidiano' },
  { valore: 10, nome: 'Arduo', glossa: 'Riesce a chi è del mestiere e ci mette cura' },
  { valore: 12, nome: 'Grave', glossa: 'Pochi ci riescono, e non sempre' },
  { valore: 14, nome: 'Gravissimo', glossa: 'Si racconta di chi vi è riuscito' },
  { valore: 16, nome: 'Quasi impossibile', glossa: 'Bisogna essere maestri e fortunati insieme' },
] as const

export const GRADI_ESITO = [
  { grado: 0, nome: 'Fallimento', glossa: 'Non si ottiene, e la situazione peggiora.' },
  { grado: 1, nome: 'Esito dubbio', glossa: 'Si ottiene in parte: al prezzo di un ritardo, di una spesa, di un obbligo o di un testimone.' },
  { grado: 2, nome: 'Successo', glossa: 'Si ottiene ciò che si voleva.' },
  { grado: 3, nome: 'Successo pieno', glossa: 'Si ottiene ciò che si voleva, e qualcosa in più.' },
] as const

/* ---------------------------------------------- fasc. 04: qualità e arti */
export const ETICHETTE_QUALITA: Record<NomeQualita, string> = {
  vigore: 'Vigore', destrezza: 'Destrezza', ingegno: 'Ingegno', animo: 'Animo', grazia: 'Grazia',
}

export const GRUPPI_ARTI: { gruppo: string; arti: string[] }[] = [
  { gruppo: 'Arti della Spada', arti: ['Armi', 'Comando', 'Cavalcare', 'Fortificare', 'Provvedere'] },
  { gruppo: 'Arti del Banco', arti: ['Computo', 'Mercatura', 'Cambio', 'Villa', 'Manifattura'] },
  { gruppo: 'Arti della Corte', arti: ['Diplomazia', 'Legge', 'Retorica', 'Cerimoniale', 'Lettere'] },
  { gruppo: "Arti dell'Ombra", arti: ['Dissimulazione', 'Informazione', 'Sotterfugio', 'Semplici e Veleni', 'Sicariato'] },
  { gruppo: 'Arti comuni', arti: ['Medicina', 'Chiesa', 'Lingue', 'Disegno e Fabbrica', 'Navigazione', 'Caccia'] },
]
export const TUTTE_LE_ARTI = GRUPPI_ARTI.flatMap((g) => g.arti)

/* ---------------------------------------------- fasc. 07: terre */
export interface SchedaSorta {
  etichetta: string; prezzo: number | null; rendita: number; muraMax: number; volatile: boolean
}
export const SORTE_TERRA: Record<SortaTerra, SchedaSorta> = {
  'podere':          { etichetta: 'Podere con casa colonica', prezzo: 300, rendita: 20, muraMax: 0, volatile: false },
  'casa-pigione':    { etichetta: 'Casa da pigione in città', prezzo: 250, rendita: 18, muraMax: 0, volatile: false },
  'bottega-affitto': { etichetta: 'Bottega in città', prezzo: 300, rendita: 24, muraMax: 0, volatile: false },
  'fondaco':         { etichetta: 'Fondaco o magazzino', prezzo: 500, rendita: 40, muraMax: 0, volatile: false },
  'mulino':          { etichetta: 'Mulino su fiume', prezzo: 400, rendita: 35, muraMax: 0, volatile: false },
  'gualchiera':      { etichetta: 'Gualchiera', prezzo: 600, rendita: 50, muraMax: 0, volatile: false },
  'villa':           { etichetta: 'Villa con sei poderi', prezzo: 2000, rendita: 140, muraMax: 1, volatile: false },
  'villa-grande':    { etichetta: 'Villa grande con dodici poderi', prezzo: 4200, rendita: 300, muraMax: 1, volatile: false },
  'castello':        { etichetta: 'Castello con contado', prezzo: 3000, rendita: 220, muraMax: 3, volatile: false },
  'terra-murata':    { etichetta: 'Terra murata (borgo)', prezzo: 9000, rendita: 650, muraMax: 4, volatile: false },
  'citta':           { etichetta: 'Città minore soggetta', prezzo: null, rendita: 1800, muraMax: 5, volatile: false },
  'pieve':           { etichetta: 'Pieve con giuspatronato', prezzo: null, rendita: 40, muraMax: 0, volatile: false },
  'approdo':         { etichetta: 'Approdo o porticciolo', prezzo: 2500, rendita: 200, muraMax: 2, volatile: true },
  'cava':            { etichetta: 'Cava di marmo', prezzo: 3500, rendita: 300, muraMax: 0, volatile: true },
  'miniera':         { etichetta: "Miniera di ferro o vena d'allume", prezzo: 4500, rendita: 400, muraMax: 0, volatile: true },
  'gregge':          { etichetta: 'Gregge di cinquecento pecore', prezzo: 800, rendita: 90, muraMax: 0, volatile: true },
  'gabella':         { etichetta: 'Appalto di gabella o pedaggio', prezzo: null, rendita: 200, muraMax: 0, volatile: true },
}

/** fasc. 07 § 4 — la Fedeltà modifica la rendita */
export const SCALA_FEDELTA = [
  { min: 9, max: 10, etichetta: 'Vi amano; si difenderebbero da sé', fattore: 1.25 },
  { min: 7, max: 8,  etichetta: 'Contenti', fattore: 1.10 },
  { min: 5, max: 6,  etichetta: 'Ordinario', fattore: 1.00 },
  { min: 3, max: 4,  etichetta: 'Malcontenti', fattore: 0.85 },
  { min: 1, max: 2,  etichetta: 'Ostili', fattore: 0.65 },
  { min: 0, max: 0,  etichetta: 'Ribellione', fattore: 0 },
] as const

/** fasc. 07 § 5 — il raccolto, tirato ogni autunno per regione */
export const RACCOLTO: Record<number, { etichetta: string; fattore: number; grano: number }> = {
  2:  { etichetta: 'Carestia grave', fattore: 0.4,  grano: 60 },
  3:  { etichetta: 'Carestia',       fattore: 0.6,  grano: 40 },
  4:  { etichetta: 'Annata scarsa',  fattore: 0.8,  grano: 28 },
  5:  { etichetta: 'Annata scarsa',  fattore: 0.8,  grano: 28 },
  6:  { etichetta: 'Annata comune',  fattore: 1.0,  grano: 18 },
  7:  { etichetta: 'Annata comune',  fattore: 1.0,  grano: 18 },
  8:  { etichetta: 'Annata comune',  fattore: 1.0,  grano: 18 },
  9:  { etichetta: 'Buona annata',   fattore: 1.15, grano: 14 },
  10: { etichetta: 'Buona annata',   fattore: 1.15, grano: 14 },
  11: { etichetta: 'Annata grassa',  fattore: 1.3,  grano: 11 },
  12: { etichetta: 'Abbondanza',     fattore: 1.4,  grano: 8 },
}

export const REGIONI = [
  'Valdarno', 'Chianti e Valdelsa', 'Mugello e Casentino', 'Val di Chiana',
  'Contado senese', 'Maremma', 'Lucchesia', 'Pisano', 'Appennino',
]

export const MIGLIORIE_DISPONIBILI = [
  { nome: 'Casa colonica nuova', costo: 150, anni: 1, resa: 8 },
  { nome: 'Mulino', costo: 400, anni: 1, resa: 35 },
  { nome: 'Gualchiera', costo: 600, anni: 1, resa: 50 },
  { nome: 'Frantoio', costo: 300, anni: 1, resa: 25 },
  { nome: 'Fornace da calce o da mattoni', costo: 250, anni: 1, resa: 20 },
  { nome: 'Impianto di vigna', costo: 200, anni: 4, resa: 30 },
  { nome: "Impianto d'oliveto", costo: 250, anni: 8, resa: 35 },
  { nome: 'Colombaia e peschiere', costo: 120, anni: 1, resa: 10 },
  { nome: 'Bonifica di palude', costo: 1000, anni: 5, resa: 80 },
  { nome: 'Ponte', costo: 500, anni: 2, resa: 25 },
  { nome: 'Fonte pubblica o lavatoio', costo: 200, anni: 1, resa: 0 },
  { nome: 'Chiesa o oratorio', costo: 500, anni: 2, resa: 0 },
  { nome: 'Rocca o torre', costo: 1200, anni: 3, resa: 0 },
  { nome: 'Strada carrabile', costo: 600, anni: 2, resa: 30 },
]

/* ---------------------------------------------- fasc. 06: tenore e spese */
export const TENORI: Record<Tenore, { etichetta: string; spesaAnnua: number; onoreMax: number }> = {
  'stretto':     { etichetta: 'Stretto', spesaAnnua: 60, onoreMax: 2 },
  'onorevole':   { etichetta: 'Onorevole', spesaAnnua: 150, onoreMax: 4 },
  'splendido':   { etichetta: 'Splendido', spesaAnnua: 400, onoreMax: 6 },
  'magnifico':   { etichetta: 'Magnifico', spesaAnnua: 1000, onoreMax: 8 },
  'principesco': { etichetta: 'Principesco', spesaAnnua: 2500, onoreMax: 10 },
}
export const SPESA_CONGIUNTO_OLTRE_QUARTO = 12   // fl l'anno
export const SPESA_FAMIGLIO = 10                 // fl l'anno

/** fasc. 12 § 2 — mantenimento annuo delle Armi di casa, per stagione */
export const MANTENIMENTO_ARMI: Record<number, { spesa: number; glossa: string }> = {
  0: { spesa: 0, glossa: 'Nessuna: due famigli con bastone' },
  1: { spesa: 25, glossa: 'Quattro famigli armati di spada e giaco' },
  2: { spesa: 60, glossa: 'Dieci bravi sotto un caporale' },
  3: { spesa: 150, glossa: 'Venticinque bravi, un caporale di nome, una casa difendibile' },
  4: { spesa: 400, glossa: 'Brigata di cinquanta, o venti lance' },
  5: { spesa: 3000, glossa: 'Condotta in essere di cento lance (di regola la paga il conducente)' },
}

/* ---------------------------------------------- fasc. 08: imprese e traffici */
export const SORTE_IMPRESA: Record<SortaImpresa, { etichetta: string; fondo: number; arte: string }> = {
  'lana':           { etichetta: "Bottega d'Arte della Lana", fondo: 1500, arte: 'Manifattura' },
  'seta':           { etichetta: 'Bottega di Seta', fondo: 2500, arte: 'Manifattura' },
  'tintoria':       { etichetta: 'Tintoria', fondo: 800, arte: 'Manifattura' },
  'banco-minuto':   { etichetta: 'Banco di cambio minuto', fondo: 1000, arte: 'Cambio' },
  'bottega-minore': { etichetta: 'Speziale, orafo, legnaiolo', fondo: 400, arte: 'Manifattura' },
  'fondaco-panni':  { etichetta: 'Fondaco di panni al minuto', fondo: 600, arte: 'Mercatura' },
  'banco':          { etichetta: 'Banco con depositi', fondo: 3000, arte: 'Cambio' },
}

/** 2d6 + Ingegno + Arte → utile in frazione del fondo */
export const RESA_BOTTEGA = [
  { min: 14, resa: 0.18 }, { min: 11, resa: 0.12 }, { min: 9, resa: 0.08 },
  { min: 7, resa: 0.04 }, { min: 5, resa: 0 }, { min: -99, resa: -0.10 },
] as const

export const RESA_BANCO = [
  { min: 13, resa: 0.16 }, { min: 10, resa: 0.12 }, { min: 8, resa: 0.09 },
  { min: 6, resa: 0.06 }, { min: -99, resa: 0 },
] as const
export const DISCREZIONE_DEPOSITI = 0.08

export const ROTTE = {
  toscana: { etichetta: 'Pisa, Livorno, piazze toscane', mod: 2, molt: 0.7 },
  italia:  { etichetta: 'Roma, Napoli, Genova, Venezia', mod: 1, molt: 1.0 },
  ponente: { etichetta: 'Lione, Avignone, Bruges, Londra', mod: 0, molt: 1.3 },
  levante: { etichetta: 'Costantinopoli, Alessandria, Barberia', mod: -2, molt: 1.8 },
} as const

export const RESA_TRAFFICO = [
  { min: 13, guadagno: 0.40, etichetta: 'Fortuna grande' },
  { min: 11, guadagno: 0.25, etichetta: 'Buon ritorno' },
  { min: 9,  guadagno: 0.12, etichetta: 'Ritorno onesto' },
  { min: 7,  guadagno: 0.03, etichetta: 'Appena il capitale' },
  { min: 5,  guadagno: -0.15, etichetta: 'Perdita' },
  { min: -99, guadagno: -0.50, etichetta: 'Rovescio' },
] as const

/* ---------------------------------------------- fasc. 10: la casa */
export const DOTI_ATTESE = [
  { rango: 'Popolo minuto, artigiani', min: 200, max: 400 },
  { rango: 'Popolani mediocri', min: 600, max: 1000 },
  { rango: 'Casa del reggimento', min: 1500, max: 2500 },
  { rango: 'Casa di primo rango', min: 3000, max: 5000 },
  { rango: 'Signore feudale o principe minore', min: 5000, max: 9000 },
]
export const CRESCITA_DOTI_ANNUA = 0.02

/** fasc. 10 § 3 — 2d6: concepisce con questo o più */
export const FERTILITA = [
  { min: 15, max: 24, soglia: 6 },
  { min: 25, max: 34, soglia: 7 },
  { min: 35, max: 42, soglia: 9 },
  { min: 43, max: 47, soglia: 11 },
  { min: 48, max: 199, soglia: 99 },
]

/** fasc. 10 § 4 — d100: muore con questo o meno */
export const MORTALITA = [
  { min: 6, max: 15, soglia: 2 },
  { min: 16, max: 30, soglia: 2 },
  { min: 31, max: 45, soglia: 3 },
  { min: 46, max: 55, soglia: 6 },
  { min: 56, max: 65, soglia: 10 },
  { min: 66, max: 75, soglia: 18 },
  { min: 76, max: 199, soglia: 30 },
]
export const MORTE_DI_PARTO = 4          // d100 ≤ 4
export const MORTE_ALLA_NASCITA = 3      // 2d6 ≤ 3
export const MORTE_PRIMA_INFANZIA = 3    // 2d6 ≤ 3, ogni anno fino ai cinque

/* ---------------------------------------------- fasc. 03: creazione */
export const PUNTI_DI_CASA = 24
export const COSTO_PATRIMONIO = 3        // per grado
export const VALORE_PATRIMONIO: Record<number, number> = { 0: 100, 1: 500, 2: 1500, 3: 4000, 4: 10000, 5: 25000 }
export const RENDITA_PER_PUNTO = 60      // 1 PC = 60 fl di rendita in terre
export const COSTO_SEGUITO = 2
export const COSTO_ONORE = 1             // sopra il 2
export const ONORE_BASE = 2
export const COSTO_ARMI = 3
export const COSTO_CONGIUNTO = 2
export const COSTO_FIGLIO = 1
export const COSTO_MAGNIFICENZA = 2
export const COSTO_AMICO = 1
export const COSTO_POLIZZA = 2
export const MAX_MACCHIE_PC = 8

export const CETI: Record<Ceto, { etichetta: string; glossa: string; effetto: string }> = {
  'grandi':            { etichetta: 'Grandi (magnati)', glossa: 'Antica nobiltà, esclusa per legge dagli uffici popolari', effetto: 'Onore +1; Seguito nel contado +1; non eleggibili finché non ottengano il popolare' },
  'gentiluomini':      { etichetta: 'Gentiluomini di contado', glossa: 'Signori di castelli e poderi, cittadini per necessità', effetto: 'Una Terra in più; Seguito cittadino −1' },
  'popolani-grassi':   { etichetta: 'Popolani grassi', glossa: 'Mercanti, lanaioli, banchieri, giuristi', effetto: 'Nessun modificatore: è la condizione ordinaria' },
  'popolani-mediocri': { etichetta: 'Popolani mediocri', glossa: 'Arti Minori, bottegai in ascesa', effetto: 'Patrimonio −1 grado, +2 Punti di Casa, Seguito nel popolo minuto +1' },
  'forestieri':        { etichetta: 'Forestieri arricchiti', glossa: 'Venuti da Genova, Lucca, Bologna, Romagna', effetto: 'Patrimonio +1 grado; Onore −1; non eleggibili prima di venticinque anni' },
}

export const RADICI = [
  { nome: 'Lana', dote: "Bottega d'Arte della Lana (rendita 120 fl); +1 a Manifattura; voce nell'Arte" },
  { nome: 'Seta', dote: 'Bottega di Por Santa Maria (rendita 150 fl, più volatile); +1 a Mercatura' },
  { nome: 'Cambio', dote: 'Banco di piccolo giro (fondo 800 fl); +1 a Computo' },
  { nome: 'Terre', dote: 'Due Terre in più da 60 fl; +1 ad Agricoltura; Fedeltà iniziale +1' },
  { nome: 'Legge e notariato', dote: 'Una polizza già imborsata; +1 a Legge; atti notarili gratuiti' },
  { nome: 'Arme', dote: "Grado d'Armi +1; un congiunto capitano di nome; +1 a Comando" },
  { nome: 'Appalti e gabelle', dote: 'Un appalto di gabella (100 fl); +1 a Computo; Onore −1' },
]

export const MACCHIE = [
  { nome: 'Debito', pc: 3, effetto: '1.000 fl dovuti a un banco nominato, all’8% annuo' },
  { nome: 'A specchio', pc: 4, effetto: 'Debitori del Comune per 600 fl: ineleggibili finché non si salda' },
  { nome: 'Inimicizia mortale', pc: 3, effetto: 'Una casa nominata vi odia e osteggia ogni vostra azione politica' },
  { nome: 'Bando', pc: 2, effetto: 'Un congiunto adulto è confinato fuori del dominio' },
  { nome: 'Infamia', pc: 3, effetto: 'Una macchia provata. Onore −2' },
  { nome: 'Casa divisa', pc: 2, effetto: 'Due rami in lite: ogni azione comune richiede una prova di Grazia contro 8' },
  { nome: 'Mal ereditario', pc: 2, effetto: 'Ogni congiunto tira la mortalità con −1' },
  { nome: 'Sangue scarso', pc: 3, effetto: 'Un solo maschio porta il nome: se muore senza figli, il casato si estingue' },
  { nome: 'Nemico forestiero', pc: 2, effetto: 'Un signore fuori di Toscana ha giurato la vostra rovina' },
  { nome: 'Fama di parte', pc: 2, effetto: '+1 con gli amici, −2 con gli avversari, e cadete con la fazione' },
]

/* ---------------------------------------------- fasc. 13: trame */
export const OBIETTIVI_TRAMA: Record<ObiettivoTrama, { etichetta: string; passi: number; soglia: number; effetto: string }> = {
  'sapere':     { etichetta: 'Sapere', passi: 2, soglia: 4, effetto: 'Un segreto, i libri di un banco, la corrispondenza, i piani' },
  'volgere':    { etichetta: 'Volgere', passi: 3, soglia: 4, effetto: 'Un servitore, un ufficiale, un faccendiere altrui passa a voi' },
  'guastare':   { etichetta: 'Guastare', passi: 3, soglia: 5, effetto: 'Si rompe un parentado, un’alleanza, un contratto, una condotta' },
  'infamare':   { etichetta: 'Infamare', passi: 4, soglia: 4, effetto: 'La riputazione del bersaglio è distrutta: Onore −3' },
  'prendere':   { etichetta: 'Prendere', passi: 4, soglia: 5, effetto: 'Si sottrae un documento, una somma, una persona; si apre una porta' },
  'rovinare':   { etichetta: 'Rovinare', passi: 5, soglia: 5, effetto: 'Il bersaglio è portato al fallimento o allo specchio' },
  'sbandire':   { etichetta: 'Sbandire', passi: 6, soglia: 6, effetto: 'Il bersaglio è processato ed esiliato per via di magistrati' },
  'uccidere':   { etichetta: 'Uccidere', passi: 5, soglia: 3, effetto: 'Il bersaglio muore' },
  'congiurare': { etichetta: 'Congiurare', passi: 8, soglia: 3, effetto: 'Si rovescia un reggimento, o si uccide chi lo tiene' },
}

export const METODI_TRAMA: Record<MetodoTrama, { etichetta: string; prova: string; passi: number; soglia: number; spesa: number }> = {
  'spionaggio':    { etichetta: 'Spionaggio', prova: 'Ingegno + Informazione', passi: 0, soglia: 0, spesa: 30 },
  'corruzione':    { etichetta: 'Corruzione', prova: 'Grazia + Sotterfugio', passi: -1, soglia: 0, spesa: 150 },
  'seduzione':     { etichetta: 'Seduzione', prova: 'Grazia + Dissimulazione', passi: 0, soglia: 1, spesa: 40 },
  'falsificazione':{ etichetta: 'Falsificazione', prova: 'Ingegno + Sotterfugio', passi: 1, soglia: 1, spesa: 60 },
  'legge':         { etichetta: 'Via di legge', prova: 'Ingegno + Legge', passi: 2, soglia: 3, spesa: 100 },
  'voce':          { etichetta: 'Voce e diceria', prova: 'Grazia + Retorica', passi: 1, soglia: 2, spesa: 20 },
  'chiesa':        { etichetta: 'Via di Chiesa', prova: 'Grazia + Chiesa', passi: 1, soglia: 2, spesa: 80 },
  'denaro':        { etichetta: 'Via di denaro', prova: 'Ingegno + Cambio', passi: 0, soglia: 1, spesa: 0 },
  'veleno':        { etichetta: 'Veleno', prova: 'Ingegno + Semplici e Veleni', passi: -1, soglia: -1, spesa: 200 },
  'ferro':         { etichetta: 'Ferro', prova: 'Destrezza + Sicariato', passi: -2, soglia: -2, spesa: 120 },
}

/* ---------------------------------------------- fasc. 12: corpi militari */
export const CORPI = [
  { nome: 'Lance (uomini d’arme)', uomini: '25 lance', f: 6, t: 5, paga: 750, dal: 0 },
  { nome: 'Cavalli leggeri', uomini: '50', f: 3, t: 4, paga: 300, dal: 0 },
  { nome: 'Fanteria italiana', uomini: '200', f: 4, t: 4, paga: 400, dal: 0 },
  { nome: 'Balestrieri e schioppettieri', uomini: '100', f: 3, t: 3, paga: 250, dal: 0 },
  { nome: 'Provvisionati', uomini: '100', f: 3, t: 5, paga: 300, dal: 0 },
  { nome: 'Milizia d’ordinanza', uomini: '300', f: 3, t: 2, paga: 90, dal: 1506 },
  { nome: 'Fanti oltramontani', uomini: '300', f: 7, t: 6, paga: 900, dal: 1494 },
  { nome: 'Fanteria spagnola', uomini: '250', f: 6, t: 6, paga: 700, dal: 1503 },
  { nome: 'Artiglieria da campo', uomini: '4 pezzi', f: 2, t: 1, paga: 200, dal: 0 },
  { nome: 'Artiglieria da muro', uomini: '2 pezzi', f: 0, t: 1, paga: 400, dal: 0 },
  { nome: 'Guastatori', uomini: '200', f: 0, t: 1, paga: 60, dal: 0 },
  { nome: 'Bravi di casa', uomini: '10', f: 1, t: 3, paga: 60, dal: 0 },
]

/* ---------------------------------------------- fasc. 15: preminenza */
export const PESI_PREMINENZA = {
  renditaOgni: 200, patrimonioOgni: 1500, debitoOgni: 1000,
  villa: 1, castello: 3, terraMurata: 6, citta: 12, giurisdizione: 2, feudo: 3,
  ufficioMaggiore: 1, gonfalonierato: 3, dieciVittoriosi: 3, delReggimento: 4, tieneIlReggimento: 12,
  seguitoOgni: 2,
  beneficioMinore: 1, abbazia: 2, vescovado: 5, cardinalato: 12, papato: 25,
  campagnaVinta: 2, battagliaVinta: 3, cittaPresa: 4, condotta: 2,
  maschioAdulto: 1, legamePrimoRango: 2, legameGiocante: 1, maiDiviso: 3, estinto: -15,
  onore: 1, magnificenza: 2, sospettoOgni: 2,
  congiuntoInBando: -2, beniConfiscati: -6, bancoRotto: -6, terraPerduta: -2,
}

/* ---------------------------------------------- fasc. 02: epoche */
export const EPOCHE: Record<string, { etichetta: string; dal: number; al: number; glossa: string; consigliato: number }> = {
  'bilancia':  { etichetta: 'Il tempo della bilancia', dal: 1454, al: 1494, consigliato: 1466,
                 glossa: 'Pace armata, prosperità, politica tutta interna: borse, parentadi, banco, mecenatismo.' },
  'calate':    { etichetta: 'Il tempo delle calate', dal: 1494, al: 1512, consigliato: 1492,
                 glossa: 'Invasioni straniere, repubblica popolare, Savonarola, guerra di Pisa, fortune rovesciate.' },
  'principi':  { etichetta: "Il tempo dell'ultima libertà", dal: 1527, al: 1537, consigliato: 1527,
                 glossa: 'Sacco di Roma, seconda cacciata dei Medici, assedio di Firenze, principato.' },
}

export const CITTA = ['Firenze', 'Siena', 'Lucca', 'Pisa', 'Arezzo', 'Pistoia', 'Prato', 'Volterra', 'Cortona']
