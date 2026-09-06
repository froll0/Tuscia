# GENERATORE DELLA PAGINA

Compone i fascicoli, le schede e le tavole in una pagina unica navigabile.

```
python3 sito/build.py [percorso/di/uscita.html]
```

Senza argomenti scrive `sito/tuscia.html`. Non richiede alcuna dipendenza:
`md.py` è un convertitore markdown ridotto ai soli costrutti adoperati in questo
repository (titoli, tavole, liste anche annidate, citazioni, regole orizzontali,
grassetto, corsivo, campi da compilare).

Chi aggiunga o rinomini un fascicolo aggiorni la costante `GRUPPI` in
`build.py`, che governa insieme l'ordine delle sezioni e l'indice laterale.

La pagina pubblicata si trova all'indirizzo indicato nel README principale.
