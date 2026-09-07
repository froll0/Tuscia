# LA PRIMA CASA DELLA TUSCIA

### Gioco di ruolo e di governo delle famiglie nella Toscana del Rinascimento

---

**La Prima Casa della Tuscia** è un gioco di ruolo da tavolo, di ambientazione
storica e senza alcun elemento fantastico, nel quale da tre a sei partecipanti
assumono il governo di altrettanti casati toscani fra la metà del Quattrocento e
il primo Cinquecento.

Ciascun partecipante interpreta **due personaggi**:

1. un **membro del casato** — capo di casa, fratello, rampollo, vedova reggente
   — che siede nei consigli, contratta i parentadi, amministra il patrimonio e
   risponde dell'onore del proprio sangue;
2. un **faccendiere** — agente, procuratore, sensale, notaio, prete, capo di
   bravi — al servizio del proprio casato oppure, con maggior profitto per la
   tavola, al servizio del casato di un altro partecipante.

Più partecipanti possono concorrere al governo del medesimo casato, dividendosi
i rami della famiglia e, spesso, litigando sull'eredità.

Lo scopo dichiarato del gioco è rendere la propria famiglia la **prima di tutta
la Tuscia**: la più ricca, la più temuta, la più imparentata, la più onorata.
Lo scopo reale, come nella storia che il gioco imita, è di durare.

**Il manuale si legge anche come pagina unica navigabile:**
[claude.ai/code/artifact/6784afee-b925-41a9-8795-e8603b3c6da7](https://claude.ai/code/artifact/6784afee-b925-41a9-8795-e8603b3c6da7)
— indice laterale, tavole consultabili durante la partita, e il congegno della
Prova per tirare i due dadi contro un Contrasto. Si rigenera con
`python3 sito/build.py` (vedi [`sito/`](sito/)).

---

## Struttura del manuale

| Fascicolo | Materia |
|---|---|
| [00 — Avvertenza](manuale/00-avvertenza.md) | Uso storico, materie gravi, patto del tavolo |
| [01 — Introduzione](manuale/01-introduzione.md) | Che cosa è questo gioco, occorrente, ruoli |
| [02 — L'ambientazione](manuale/02-ambientazione.md) | La Tuscia: terre, città, poteri, cronologia |
| [03 — Il casato](manuale/03-il-casato.md) | Costruzione del casato e delle sue sostanze |
| [04 — I personaggi](manuale/04-i-personaggi.md) | Il congiunto e il faccendiere |
| [05 — Il sistema](manuale/05-sistema-di-gioco.md) | Prove, contese, Fortuna, conflitti |
| [06 — Il corso dell'anno](manuale/06-corso-dell-anno.md) | Stagioni, fasi, azioni di casato |
| [18 — Esempio di gioco](manuale/18-esempio-di-gioco.md) | **Una stagione intera giocata**, con ogni tiro mostrato |
| [07 — Terre e rendite](manuale/07-terre-e-rendite.md) | Poderi, castelli, fedeltà, raccolti |
| [08 — Banco e mercatura](manuale/08-banco-e-mercatura.md) | Denaro, cambio, traffici, debito |
| [09 — Reggimento e uffici](manuale/09-reggimento-e-uffici.md) | Squittini, tratte, balìe, magistrature |
| [10 — La casa](manuale/10-la-casa.md) | Parentadi, doti, eredi, divisioni, morte |
| [11 — La Chiesa](manuale/11-la-chiesa.md) | Benefici, vescovadi, cardinalati, Roma |
| [12 — Arme e guerra](manuale/12-arme-e-guerra.md) | Bravi, condotte, campagne, assedi, battaglie |
| [13 — Ombre e trame](manuale/13-ombre-e-trame.md) | Faccendieri, spionaggio, congiure, veleni |
| [14 — Onore e magnificenza](manuale/14-onore-e-magnificenza.md) | Riputazione, sospetto, mecenatismo |
| [15 — La preminenza](manuale/15-preminenza.md) | Punteggio, fine della campagna, vittoria |
| [16 — Guida dell'Arbitro](manuale/16-guida-dell-arbitro.md) | Condotta della partita, città, eventi |
| [17 — Appendici](manuale/17-appendici.md) | Monete, prezzi, misure, nomi, glossario, letture |

Le sei schede sono **moduli stampabili e compilabili**:
[`schede/schede-da-stampare.html`](schede/schede-da-stampare.html). Le tavole di
consultazione rapida da tenere sul tavolo sono in [`tavole/`](tavole/).

Chi non conosca il periodo cominci dal **fascicolo 02 § 6**, la cronologia
ragionata, dove ogni avvenimento è descritto e accompagnato dall'indicazione di
come se ne serva l'Arbitro. Chi voglia arrivare presto al tavolo legga il
fascicolo 01 (che contiene il lessico e le convenzioni di scrittura), il 05 e il
18.

---

## Il programma di governo

Oltre al manuale, il repository contiene un'**applicazione web** per condurre
una campagna: [`app/`](app/). Apertura della campagna per l'Arbitro, creazione
dei casati coi Punti di Casa contati in tempo reale, creazione di congiunti e
faccendieri, schede vive che calcolano bilanci e rendite passo per passo, corso
dell'anno per fasi e stagioni, tiro del raccolto, giornale della campagna e
computo della Preminenza.

È un sito statico da pubblicare su GitHub Pages. I dati stanno in questo browser
oppure — per giocare in più persone, anche fra una seduta e l'altra — in un
progetto Supabase gratuito che il tavolo apre per sé. Nessuna chiave entra nel
repository.

Il **motore delle regole** (`app/src/regole/`) è codice puro, provato contro gli
esempi svolti del manuale: se una regola cambia nel testo e non nel codice, una
prova fallisce.

```
cd app && npm install && npm run dev
```

Si veda [`app/README.md`](app/README.md) per il resto.

---

## Occorrente

- Due dadi a sei facce per partecipante (e alcuni di riserva);
- un dado a venti facce e un dado a cento facce per l'Arbitro;
- le schede di casato, di personaggio, di terra, di esercito e di trama;
- una **borsa di stoffa** e un pugno di gettoni o di cartigli, per le tratte
  degli uffici: il gioco raccomanda che il caso pubblico sia estratto davvero, e
  non simulato con un dado;
- carta, penna, e un registro di casa nel quale annotare entrate, uscite, nascite
  e morti, a imitazione delle *ricordanze* che ogni famiglia toscana teneva.

Una carta della Toscana, anche moderna, è di grande giovamento.

---

## Nota sul titolo

*Tuscia* è il nome con cui, dall'età longobarda e per tutto il Medioevo, si
designò la regione che oggi si chiama Toscana; gli umanisti del Quattrocento lo
ripresero volentieri, accanto a *Etruria*, per nobilitare la patria con
l'antichità. Nell'uso curiale più tardo il termine si ristrinse alla parte
patrimoniale della Chiesa intorno a Viterbo. Questo gioco lo adopera nel
significato largo e antiquario che gli davano i suoi personaggi.
