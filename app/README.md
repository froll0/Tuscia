# Il programma di governo

Applicazione web per condurre una campagna di **La Prima Casa della Tuscia**:
apertura della campagna per l'Arbitro, creazione dei casati e dei personaggi
per i giocatori, schede vive che calcolano da sé, e il corso dell'anno stagione
per stagione.

È un **sito statico**: non possiede un server proprio e non contiene alcun
segreto. I dati vivono dove sceglie chi gioca.

## Far girare il programma

```
cd app
npm install
npm run dev        # sviluppo, su http://localhost:5173
npm test           # le prove del motore delle regole
npm run build      # costruzione per la pubblicazione
```

## Come è fatto

| Cartella | Che cosa contiene |
|---|---|
| `src/modello/` | I tipi del dominio: campagna, casato, congiunto, faccendiere, terra, trama |
| `src/regole/` | **Il motore delle regole**, puro e senza interfaccia |
| `src/regole/tavole.ts` | Tutte le cifre del manuale: è la loro sola fonte |
| `src/dati/` | I depositi: questo browser (IndexedDB) oppure Supabase |
| `src/interfaccia/` | Le pagine e i componenti |

### Il motore delle regole

`src/regole/` non conosce React e non tocca il documento: sono funzioni pure che
si possono provare. Le prove in `src/regole/regole.test.ts` verificano il motore
**contro gli esempi svolti del manuale** — l'esempio di gioco del fascicolo 18,
i quattro scambi di combattimento del fascicolo 05, il computo di una rendita
del fascicolo 07, la trama del fascicolo 13 — sicché una regola che cambi nel
manuale e non nel codice fa fallire una prova.

Nessun numero è scritto altrove che in `tavole.ts`.

## Il deposito dei dati

**Questo browser** (predefinito). Le campagne stanno in IndexedDB. Non occorre
nulla, funziona anche senza rete, ma non c'è stato condiviso: l'Arbitro tiene
l'unica copia buona.

**Supabase** (per giocare in più persone). Si apre un progetto gratuito, si
esegue una volta il testo SQL che il programma mostra nella pagina *Deposito*,
e si incollano URL e chiave pubblica. Da quel momento le campagne stanno sul
server, si accede con un collegamento mandato per posta, e le modifiche si
propagano in tempo reale.

La chiave pubblica (`anon`) è pubblica per disegno: a proteggere le righe è la
*row level security*, che il testo SQL configura. Le chiavi restano in questo
browser e non entrano mai nel repository.

## Che cosa c'è e che cosa manca

**C'è**: apertura della campagna con epoca, città e anno; corso dell'anno per
fasi e stagioni; tiro del raccolto per regione con effetto su rendite e prezzo
del grano; creazione del casato coi Punti di Casa contati in tempo reale;
creazione di congiunti e faccendieri coi punti di Qualità, Arti e Reti;
scheda del casato con bilancio stagionale vivo, computo delle rendite passo per
passo, migliorie, Azioni disponibili e Preminenza aggiornata; giornale della
campagna; congegno della Prova.

**Manca ancora**: la plancia con la carta della Toscana; il tavolo di seduta con
i tiri condivisi e le azioni d'Ombra segrete; la chat e la stanza audio e video;
le trame, gli eserciti e le battaglie condotti dal programma; lo squittinio e la
tratta con la borsa; il computo annuale della famiglia.
