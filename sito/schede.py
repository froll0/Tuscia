# -*- coding: utf-8 -*-
"""Le sei schede, composte come moduli veri: stampabili e compilabili."""
import html

def e(s): return html.escape(s, quote=True)

def campo(etichetta, largo=1, nota=""):
    n = ' <i>%s</i>' % e(nota) if nota else ''
    return ('<label class="campo" style="grid-column:span %d">'
            '<span>%s%s</span><input type="text"></label>') % (largo, e(etichetta), n)

def casella(etichetta, nota=""):
    n = ' <i>%s</i>' % e(nota) if nota else ''
    return ('<label class="casella"><span>%s%s</span>'
            '<input type="text" inputmode="numeric"></label>') % (e(etichetta), n)

def traccia(etichetta, n, nota=""):
    q = ''.join('<label class="q"><input type="checkbox"><i></i></label>' for _ in range(n))
    nn = '<i>%s</i>' % e(nota) if nota else ''
    return ('<div class="traccia"><span class="tr-et">%s %s</span>'
            '<span class="tr-q">%s</span></div>') % (e(etichetta), nn, q)

def griglia(colonne, righe, larghezze=None):
    lar = larghezze or ['' for _ in colonne]
    th = ''.join('<th%s>%s</th>' % ((' style="width:%s"' % w) if w else '', e(c))
                 for c, w in zip(colonne, lar))
    tr = ('<tr>' + ''.join('<td><input type="text"></td>' for _ in colonne) + '</tr>') * righe
    return ('<div class="tabella"><table class="griglia"><thead><tr>%s</tr></thead>'
            '<tbody>%s</tbody></table></div>') % (th, tr)

def righe_scritte(etichette):
    return '<div class="scritte">' + ''.join(
        '<label><span>%s</span><input type="text"></label>' % e(x) for x in etichette) + '</div>'

def note(etichetta, righe=3):
    return ('<label class="note"><span>%s</span><textarea rows="%d"></textarea></label>'
            % (e(etichetta), righe))

def sez(titolo, *corpo, guida=""):
    g = '<p class="mod-guida">%s</p>' % guida if guida else ''
    return ('<section class="mod-sez"><h2>%s</h2>%s%s</section>'
            % (e(titolo), g, ''.join(corpo)))

def campi(*c): return '<div class="campi">' + ''.join(c) + '</div>'
def caselle(*c): return '<div class="caselle">' + ''.join(c) + '</div>'

def modulo(sigla, titolo, guida, *corpo):
    return ('<div class="modulo">'
            '<div class="modulo-testa"><span class="modulo-sigla">%s</span>'
            '<h1>%s</h1><p class="modulo-uso">%s</p></div>%s'
            '<div class="modulo-piede"><button class="stampa" type="button" '
            'data-stampa>Stampa questa scheda</button>'
            '<button class="netta" type="button" data-netta>Svuota</button>'
            '<span class="salvato" data-salvato></span></div></div>'
            ) % (e(sigla), e(titolo), guida, ''.join(corpo))

ARTI = [
 ("Arti della Spada", ["Armi", "Comando", "Cavalcare", "Fortificare", "Provvedere"]),
 ("Arti del Banco", ["Computo", "Mercatura", "Cambio", "Villa", "Manifattura"]),
 ("Arti della Corte", ["Diplomazia", "Legge", "Retorica", "Cerimoniale", "Lettere"]),
 ("Arti dell'Ombra", ["Dissimulazione", "Informazione", "Sotterfugio", "Semplici e Veleni", "Sicariato"]),
 ("Arti comuni", ["Medicina", "Chiesa", "Lingue", "Disegno e Fabbrica", "Navigazione", "Caccia"]),
]

def blocco_arti():
    out = []
    for gruppo, arti in ARTI:
        out.append('<div class="arti-gruppo"><h3>%s</h3><div class="caselle">%s</div></div>'
                   % (e(gruppo), ''.join(casella(a) for a in arti)))
    return '<div class="arti">' + ''.join(out) + '</div>'

def qualita():
    return caselle(*[casella(q) for q in ["Vigore", "Destrezza", "Ingegno", "Animo", "Grazia"]])

def derivati():
    return (caselle(casella("Tenuta", "6 + Animo"),
                    casella("Guardia", "6 + Ingegno + Informazione + misure"),
                    casella("Corpo", "3 + Vigore"))
            + traccia("Ferite", 8, "si annerisca una casella per Ferita; a metà del Corpo, −1 a ogni azione")
            + traccia("Fortuna", 3, "si rifà a ogni stagione"))

# ---------------------------------------------------------------- S1
S1 = modulo("S1", "Scheda del casato",
  "Una per casato. Si tiene aperta per tutta la partita e si aggiorna nella Fase del Banco.",
  sez("Identità",
      campi(campo("Casato", 2), campo("Arme", 2),
            campo("Motto", 2), campo("Città", 1), campo("Ceto", 1),
            campo("In città dal", 1), campo("Radice della ricchezza", 3))),
  sez("Riputazione e forza",
      caselle(casella("Onore", "0–10"), casella("Sospetto", "0–10"),
              casella("Magnificenza", "0–10"), casella("Armi", "grado 0–5")),
      griglia(["Città", "Seguito (0–10)", "Polizze in borsa", "Posizione nel reggimento"], 3,
              ["30%", "14%", "16%", "40%"]),
      guida="Il Seguito non può superare l'Onore + 2. La posizione è: reggimento, aderenti, esclusi, nemici."),
  sez("Denaro",
      campi(campo("Patrimonio in fiorini", 2), campo("Rendita annua complessiva", 2)),
      '<div class="tenore"><span class="tr-et">Tenore di casa</span>'
      + ''.join('<label class="opz"><input type="radio" name="tenore"><span>%s</span><i>%s</i></label>'
                % (n, c) for n, c in [("Stretto","60 fl"),("Onorevole","150 fl"),("Splendido","400 fl"),
                                      ("Magnifico","1.000 fl"),("Principesco","2.500 fl")])
      + '</div>',
      griglia(["Debito verso", "Quanto", "Interesse", "Scadenza"], 3)),
  sez("Terre",
      griglia(["Terra e luogo", "Sorta", "Rendita", "Fedeltà", "Mura"], 7,
              ["36%", "24%", "14%", "14%", "12%"]),
      guida="Ciascuna terra ha inoltre una scheda propria (S4)."),
  sez("Botteghe, banco, traffici, benefici",
      griglia(["Impresa o beneficio", "Fondo", "Utile ultimo anno", "Chi la governa"], 5,
              ["40%", "16%", "20%", "24%"])),
  sez("Uomini di Casa idonei",
      griglia(["Nome", "Età", "Posto nella casa", "Dove si trova", "Azione della stagione"], 6,
              ["24%", "8%", "20%", "20%", "28%"]),
      guida="<strong>Il numero delle righe compilate è il numero delle Azioni della stagione</strong> "
            "(minimo 1, massimo 5). È idoneo chi ha fra i 16 e i 65 anni, non è infermo, prigioniero, "
            "in bando dal luogo dell'azione, né impegnato altrove."),
  sez("Faccendieri, amici e clienti",
      griglia(["Nome", "Mestiere", "Salario annuo", "Credito", "Mandato in corso"], 4,
              ["20%", "20%", "14%", "10%", "36%"])),
  sez("Legami",
      righe_scritte(["Parentadi in essere", "Alleanze",
                     "Obblighi che abbiamo verso altri", "Obblighi che ci sono dovuti",
                     "Inimicizie", "Offese non ancora vendicate"])),
  sez("Macchie e pesi", note("", 2)),
  sez("Bilancio della stagione",
      '<div class="bilancio">'
      '<div class="bil-col"><h3>Entrate</h3>'
      + ''.join('<label class="bil-riga"><span>%s</span><input type="text" inputmode="numeric"></label>' % v
                for v in ["Rendita delle terre <i>(solo in autunno)</i>",
                          "Utili di botteghe e banco <i>(¼)</i>",
                          "Paghe del Monte <i>(¼)</i>",
                          "Salari d'ufficio",
                          "Doti, riscatti, eredità, prede",
                          "Altro"])
      + '<label class="bil-riga bil-tot"><span>Totale entrate</span><input type="text" inputmode="numeric"></label></div>'
      '<div class="bil-col"><h3>Uscite</h3>'
      + ''.join('<label class="bil-riga"><span>%s</span><input type="text" inputmode="numeric"></label>' % v
                for v in ["Spese di casa <i>(¼ del Tenore)</i>",
                          "Congiunti oltre il quarto e famigli",
                          "Salari dei faccendieri",
                          "Mantenimento delle Armi",
                          "Interessi dei debiti <i>(¼)</i>",
                          "Imposte e prestanze",
                          "Spese delle Azioni della stagione",
                          "Doti, nozze, funerali, fabbriche"])
      + '<label class="bil-riga bil-tot"><span>Totale uscite</span><input type="text" inputmode="numeric"></label></div>'
      '</div>'
      + campi(campo("Avanzo o disavanzo", 2), campo("Patrimonio a fine stagione", 2))),
  sez("Ricordanze dell'anno", note("", 4)),
)

# ---------------------------------------------------------------- S2
S2 = modulo("S2", "Scheda del congiunto",
  "Una per ciascun personaggio di famiglia. Il nome si scrive per intero: "
  "<i>nome di padre di avo, del casato</i>.",
  sez("Chi è",
      campi(campo("Nome pieno", 4), campo("Casato", 2), campo("Età", 1),
            campo("Posto nella casa", 1), campo("Dove si trova", 2),
            campo("Pregio", 1), campo("Difetto", 1))),
  sez("Qualità", qualita(), guida="Da 1 a 5. Due è la misura dell'uomo comune."),
  sez("Valori derivati", derivati()),
  sez("Arti", blocco_arti(), guida="Da 0 a 5. Zero significa ignoranza, non incapacità: si tenta con −2."),
  sez("Arme e armatura",
      griglia(["Arme portata", "Danno", "Armatura portata", "Riparo"], 2,
              ["34%", "14%", "34%", "18%"]),
      guida="Danno: pugni 0 · bastone e pugnale 1 · spada 2 · spadone, lancia e balestra 3 · archibugio 4. "
            "Riparo: nessuna 0 · giaco 1 · corsaletto 2 · armatura completa 3."),
  sez("Uffici e onori",
      griglia(["Ufficio", "Anno", "Che se ne è ricavato"], 4, ["34%", "12%", "54%"])),
  sez("Relazioni",
      griglia(["Persona", "Che cosa è per voi", "Che cosa vuole da voi"], 5)),
  sez("Fine Particolare <i>(segreto: si pieghi il foglio)</i>", note("", 2)),
  sez("Ricordanze", note("", 5)),
)

# ---------------------------------------------------------------- S3
RETI = ["Palazzo", "Mercato", "Chiesa", "Contado", "Malavita", "Fuori di Toscana"]
S3 = modulo("S3", "Scheda del faccendiere",
  "Una per faccendiere. <strong>La parte in fondo non si mostra ad alcuno, "
  "e meno che mai al patrono.</strong>",
  sez("Chi è",
      campi(campo("Nome", 2), campo("Età", 1), campo("Origine", 1),
            campo("Mestiere di copertura", 2), campo("Pregio", 1), campo("Difetto", 1)),
      guida="Il mestiere non è finto: è vero, e serve. Dà +1 a due Arti coerenti con esso."),
  sez("Qualità", qualita()),
  sez("Valori derivati", derivati()),
  sez("Arti", blocco_arti()),
  sez("Reti",
      '<div class="reti">' + ''.join(
        '<label class="rete"><span>%s</span><input type="text" inputmode="numeric">'
        '<i class="usata"><input type="checkbox"> usata</i></label>' % e(r) for r in RETI)
      + '</div>',
      guida="Da 0 a 3. Una chiamata per stagione e per Rete: 2d6 + Rete contro il Contrasto "
            "stabilito dall'Arbitro. Si spunti la casella quando la Rete è stata chiamata; "
            "si sgombri a fine stagione."),
  sez("Il padrone",
      campi(campo("Patrono", 2), campo("Salario annuo", 1),
            campo("Credito presso di lui", 1, "0–10, noto a entrambi")),
      note("Mandato in corso", 2)),
  '<div class="segreto">'
  '<div class="segreto-testa">Da qui in giù non si mostra a nessuno</div>'
  + sez("Fedeltà",
        caselle(casella("Fedeltà", "0–5")),
        guida="5 morirebbe per lui · 4 devoto · 3 leale finché conviene · 2 serve per denaro · "
              "1 già mezzo venduto · 0 nemico segreto in casa.")
  + sez("Ambizione", note("", 2))
  + sez("Secondo patrono e secondo mandato", note("", 2))
  + sez("Che cosa so, e che nessuno sa che io so", note("", 4))
  + '</div>',
)

# ---------------------------------------------------------------- S4
S4 = modulo("S4", "Scheda della terra",
  "Una per ciascuna terra posseduta.",
  sez("Che terra è",
      campi(campo("Nome", 2), campo("Luogo sulla carta", 2),
            campo("Sorta", 2), campo("Fuochi", 1), campo("Rendita base", 1),
            campo("Titolo", 2, "allodio, livello, enfiteusi, feudo, appalto"),
            campo("Chi lo contesta", 2),
            campo("Comprata da", 2), campo("Nell'anno", 1), campo("Per quanto", 1))),
  sez("Stato della terra",
      traccia("Fedeltà", 11, "si segni la casella corrispondente, da 0 a 10"),
      traccia("Mura", 6, "da 0 a 5"),
      '<div class="tenore"><span class="tr-et">Maniera delle mura</span>'
      '<label class="opz"><input type="radio" name="maniera"><span>Vecchia</span>'
      '<i>alte e sottili</i></label>'
      '<label class="opz"><input type="radio" name="maniera"><span>Alla moderna</span>'
      '<i>bassa, con bastioni; dal 1500</i></label></div>',
      campi(campo("Presidio", 2), campo("Vettovaglie in mesi", 1), campo("Castellano", 1))),
  sez("Migliorie",
      griglia(["Miglioria", "Anno", "Costo", "Rendita aggiunta"], 5,
              ["44%", "12%", "18%", "26%"])),
  sez("Fattore e uomini del luogo",
      griglia(["Nome", "Ufficio", "Fedeltà", "Note"], 3)),
  sez("Registro delle rendite",
      griglia(["Anno", "Raccolto (2d6)", "Fedeltà", "Rendita riscossa", "Note"], 8,
              ["10%", "16%", "12%", "20%", "42%"]),
      guida="Ordine del computo: rendita base + migliorie → Fedeltà → raccolto → guasto."),
)

# ---------------------------------------------------------------- S5
S5 = modulo("S5", "Scheda dell'esercito",
  "Una per esercito in campo. Si compila nella Fase delle Armi.",
  sez("Il comando",
      campi(campo("Capitano generale", 2), campo("Comando", 1), campo("Al soldo di", 1),
            campo("Ferma fino al", 1), campo("Provvigione del capitano", 1),
            campo("Paga totale a stagione", 2))),
  sez("I corpi",
      griglia(["Corpo", "Sorta", "F", "T", "Paga", "Battaglia", "Note"], 8,
              ["16%", "22%", "6%", "6%", "10%", "14%", "26%"]),
      guida="Battaglia: Avanguardia, Battaglia, Retroguardia, Riserva o Agguato. "
            "I corpi fittizi (paghe morte) si segnino a parte e non si mostrino al conducente."),
  sez("Stato della campagna",
      campi(campo("Vettovaglie", 1, "1 punto per corpo al mese"),
            campo("Paghe arretrate", 1, "stagioni"),
            campo("Dove si trova", 2), campo("Movimenti restanti", 1, "due a stagione")),
      note("Corpi fittizi <i>(segreto)</i>", 1)),
  sez("Ordine di battaglia",
      '<div class="tabella"><table class="griglia ordine"><thead><tr>'
      '<th style="width:16%"></th><th>Avanguardia</th><th>Battaglia</th>'
      '<th>Retroguardia</th><th>Riserva o Agguato</th></tr></thead><tbody>'
      + ''.join('<tr><th class="lat">%s</th>%s</tr>' % (v, '<td><input type="text"></td>' * 4)
                for v in ["Forza", "Tenuta", "Capitano"])
      + '</tbody></table></div>',
      guida="Forza = somma delle F dei corpi. Tenuta = la T più bassa fra i corpi, più il Comando "
            "del capitano che la guida. Tenuta a 0: la battaglia rompe."),
  sez("Registro degli assalti",
      griglia(["Assalto", "Avanguardia", "Battaglia", "Retroguardia", "Perdite", "Rotte"], 5,
              ["10%", "18%", "18%", "18%", "18%", "18%"])),
  sez("Preda, prigionieri, riscatti",
      griglia(["Prigioniero", "Di chi", "Taglia", "Pagata?"], 5)),
)

# ---------------------------------------------------------------- S6
OBIETTIVI = [("Sapere","2 Passi · soglia 4"),("Volgere","3 · 4"),("Guastare","3 · 5"),
             ("Infamare","4 · 4"),("Prendere","4 · 5"),("Rovinare","5 · 5"),
             ("Sbandire","6 · 6"),("Uccidere","5 · 3"),("Congiurare","8 · 3")]
METODI = [("Spionaggio","Ingegno + Informazione · 30 fl"),
          ("Corruzione","Grazia + Sotterfugio · −1 Passo · 150 fl"),
          ("Seduzione","Grazia + Dissimulazione · +1 soglia · 40 fl"),
          ("Falsificazione","Ingegno + Sotterfugio · +1 Passo · +1 soglia · 60 fl"),
          ("Via di legge","Ingegno + Legge · +2 Passi · +3 soglia · 100 fl"),
          ("Voce e diceria","Grazia + Retorica · +1 Passo · +2 soglia · 20 fl"),
          ("Via di Chiesa","Grazia + Chiesa · +1 Passo · +2 soglia · 80 fl"),
          ("Via di denaro","Ingegno + Cambio · +1 soglia"),
          ("Veleno","Ingegno + Semplici e Veleni · −1 Passo · −1 soglia · 200 fl"),
          ("Ferro","Destrezza + Sicariato · −2 Passi · −2 soglia · 120 fl")]

def scelte(nome, voci):
    return '<div class="scelte">' + ''.join(
        '<label class="opz"><input type="checkbox" name="%s"><span>%s</span><i>%s</i></label>'
        % (nome, e(a), e(b)) for a, b in voci) + '</div>'

S6 = modulo("S6", "Scheda della trama",
  "Una per trama. <strong>Si consegna coperta all'Arbitro</strong> e si riprende "
  "a ogni stagione per avanzarla.",
  sez("Chi trama",
      campi(campo("Casato mandante", 2), campo("Esecutore", 2),
            campo("Stagione in cui si apre", 2), campo("Bersaglio", 2)),
      note("Che cosa esattamente si vuole ottenere", 2)),
  sez("Obiettivo", scelte("obiettivo", OBIETTIVI)),
  sez("Metodo", scelte("metodo", METODI)),
  sez("I numeri della trama",
      caselle(casella("Guardia del bersaglio"), casella("Passi richiesti"),
              casella("Soglia di Sospetto"), casella("Congiurati")),
      guida="Ciascun congiurato oltre il primo dà +1 Passo per stagione e abbassa la soglia di 1."),
  sez("Avanzamento",
      griglia(["Stagione", "Tiro", "Totale", "Esito", "Passi", "Sospetto", "Spesa"], 7,
              ["16%", "10%", "12%", "26%", "10%", "12%", "14%"]),
      traccia("Passi compiuti", 10),
      traccia("Sospetto della trama", 8),
      guida="Successo pieno +2 Passi · Successo +1 · Esito dubbio +1 Passo e +1 Sospetto · "
            "Fallimento +1 Sospetto · Tracollo +2 Sospetto e un indizio al bersaglio."),
  sez("Esito",
      '<div class="tenore"><span class="tr-et">La trama è</span>'
      + ''.join('<label class="opz"><input type="radio" name="esito"><span>%s</span></label>' % x
                for x in ["Compiuta", "Scoperta", "Abbandonata"]) + '</div>',
      note("Che cosa ne è seguito", 3)),
)

SCHEDE = [("s1", "S1", "Casato", S1), ("s2", "S2", "Congiunto", S2),
          ("s3", "S3", "Faccendiere", S3), ("s4", "S4", "Terra", S4),
          ("s5", "S5", "Esercito", S5), ("s6", "S6", "Trama", S6)]
