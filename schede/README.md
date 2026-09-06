# SCHEDE

Le sei schede non sono più testo: sono **moduli veri**, compilabili a schermo e
stampabili.

- **[schede-da-stampare.html](schede-da-stampare.html)** — le sei schede in un
  solo foglio. Si apra nel browser e si stampi; ciascuna scheda va su una pagina
  propria. Si può anche compilare a schermo: quanto si scrive resta serbato nel
  browser di chi scrive, e non esce di là.

Le medesime schede si trovano nella pagina del manuale, dove ciascuna ha un
pulsante per stamparsi da sola.

| Sigla | Scheda | Una per |
|---|---|---|
| **S1** | Casato | ciascun casato; si aggiorna nella Fase del Banco |
| **S2** | Congiunto | ciascun personaggio di famiglia |
| **S3** | Faccendiere | ciascun faccendiere; la parte in fondo non si mostra ad alcuno |
| **S4** | Terra | ciascuna terra posseduta |
| **S5** | Esercito | ciascun esercito in campo |
| **S6** | Trama | ciascuna trama; si consegna coperta all'Arbitro |

Il contenuto delle schede è definito in [`sito/schede.py`](../sito/schede.py),
che è la loro sola fonte: `python3 sito/build.py` rigenera sia il foglio da
stampare sia la pagina del manuale.

---

Si raccomanda inoltre che ogni casato tenga un quaderno di **ricordanze**: il
registro delle nascite, delle morti, delle nozze, degli acquisti, dei debiti e
delle offese non ancora vendicate. È l'uso vero delle famiglie toscane, ed è il
modo migliore per non perdere il filo in una campagna lunga.
