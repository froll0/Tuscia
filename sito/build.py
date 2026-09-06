# -*- coding: utf-8 -*-
"""Compone il manuale in una pagina unica, alla maniera del libro umanistico."""
import sys, re, pathlib, html

QUI = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(QUI))
from md import convert, inline
import schede as SCH

ROOT = QUI.parent
USCITA = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else QUI / "tuscia.html"

ROMANI = ["", "I","II","III","IV","V","VI","VII","VIII","IX","X",
          "XI","XII","XIII","XIV","XV","XVI","XVII","XVIII"]

FASCICOLI = [
 ("Il patto", [("f00","manuale/00-avvertenza.md","00","Avvertenza"),
               ("f01","manuale/01-introduzione.md","01","Introduzione")]),
 ("Il mondo", [("f02","manuale/02-ambientazione.md","02","L'ambientazione")]),
 ("La creazione", [("f03","manuale/03-il-casato.md","03","Il casato"),
                   ("f04","manuale/04-i-personaggi.md","04","I personaggi")]),
 ("Le regole", [("f05","manuale/05-sistema-di-gioco.md","05","Il sistema"),
                ("f06","manuale/06-corso-dell-anno.md","06","Il corso dell'anno"),
                ("f18","manuale/18-esempio-di-gioco.md","18","Esempio di gioco")]),
 ("Il governo", [("f07","manuale/07-terre-e-rendite.md","07","Terre e rendite"),
                 ("f08","manuale/08-banco-e-mercatura.md","08","Banco e mercatura"),
                 ("f09","manuale/09-reggimento-e-uffici.md","09","Reggimento e uffici")]),
 ("Sangue e fede", [("f10","manuale/10-la-casa.md","10","La casa"),
                    ("f11","manuale/11-la-chiesa.md","11","La Chiesa")]),
 ("Forza e ombra", [("f12","manuale/12-arme-e-guerra.md","12","Arme e guerra"),
                    ("f13","manuale/13-ombre-e-trame.md","13","Ombre e trame")]),
 ("L'esito", [("f14","manuale/14-onore-e-magnificenza.md","14","Onore e magnificenza"),
              ("f15","manuale/15-preminenza.md","15","La preminenza")]),
 ("Per l'Arbitro", [("f16","manuale/16-guida-dell-arbitro.md","16","Guida dell'Arbitro"),
                    ("f17","manuale/17-appendici.md","17","Appendici")]),
]
TAVOLE = [("t1","tavole/tavola-del-sistema.md","T1","Il sistema"),
          ("t2","tavole/tavola-dei-conti.md","T2","I conti"),
          ("t3","tavole/tavola-della-guerra.md","T3","La guerra")]

FLEURON = ('<svg class="fleuron" viewBox="0 0 60 18" aria-hidden="true">'
  '<path d="M30 3c-3 0-5 2-6 4-1-2-3-4-6-4-4 0-7 3-7 6s3 5 6 5c2 0 4-1 5-3'
  '-1 3-3 4-6 4v1c5 0 8-3 8-7 0 4 3 7 8 7v-1c-3 0-5-1-6-4 1 2 3 3 5 3'
  ' 3 0 6-2 6-5s-3-6-7-6z" fill="currentColor"/>'
  '<path d="M2 9h9M49 9h9" stroke="currentColor" stroke-width="1"/></svg>')

MARCA = ('<svg class="marca-stampa" viewBox="0 0 120 150" aria-hidden="true">'
  '<rect x="1" y="1" width="118" height="148" fill="none" stroke="currentColor" stroke-width="1.5"/>'
  '<rect x="7" y="7" width="106" height="136" fill="none" stroke="currentColor" stroke-width="0.6"/>'
  '<circle cx="60" cy="82" r="30" fill="none" stroke="currentColor" stroke-width="1.6"/>'
  '<path d="M60 52V24M48 34h24" stroke="currentColor" stroke-width="1.6"/>'
  '<path d="M30 82h60" stroke="currentColor" stroke-width="1.6"/>'
  '<path d="M60 60c-8 8-8 36 0 44 8-8 8-36 0-44z" fill="none" stroke="currentColor" stroke-width="0.9"/>'
  '<path d="M22 128c6-6 14-6 20 0M78 128c6-6 14-6 20 0" fill="none" stroke="currentColor" stroke-width="0.9"/>'
  '<text x="60" y="133" text-anchor="middle" font-size="11" letter-spacing="2.5" fill="currentColor">TVSCIA</text>'
  '</svg>')

def capolettera(corpo):
    """Iniziale rubricata sul primo paragrafo del testo, saltate le epigrafi."""
    inizio = 0
    while True:
        resto = corpo[inizio:].lstrip()
        salto = len(corpo) - inizio - len(corpo[inizio:].lstrip())
        if not resto.startswith('<blockquote'):
            inizio += salto
            break
        fine = corpo.find('</blockquote>', inizio + salto)
        if fine < 0:
            return corpo
        inizio = fine + len('</blockquote>')
    i = corpo.find('<p>', inizio)
    if i < 0:
        return corpo
    lettera = corpo[i+3:i+4]
    if not lettera.isalpha() or not lettera.isupper():
        return corpo
    return (corpo[:i] + '<p class="con-iniziale"><span class="iniziale">'
            + lettera + '</span>' + corpo[i+4:])

def sezione(sid, path, num, breve, classe="fascicolo", romano=None, iniziale=True):
    md = (ROOT / path).read_text()
    linee = md.split("\n")
    titolo, resto = breve, md
    for k, l in enumerate(linee):
        if l.startswith("# "):
            t = re.sub(r'^\d{2}\s+—\s+', '', l[2:].strip())
            titolo, resto = t, "\n".join(linee[k+1:])
            break
    sotto = ""
    if " — " in titolo:
        titolo, sotto = titolo.split(" — ", 1)
    titolo = titolo.strip().title() if titolo.isupper() else titolo
    corpo = convert(resto, level_shift=0)
    if iniziale: corpo = capolettera(corpo)
    seg = ROMANI[int(num)] if romano is None and num.isdigit() and int(num) < len(ROMANI) else (romano or num)
    h = ['<section class="%s" id="%s" data-titolo="%s" data-num="%s">' % (classe, sid, html.escape(titolo), html.escape(num))]
    h.append('<header class="incipit"><span class="inc-num">%s</span>' % html.escape(seg))
    h.append('<h1>%s</h1>' % inline(titolo))
    if sotto: h.append('<p class="inc-sotto">%s</p>' % inline(sotto))
    h.append(FLEURON + '</header>')
    h.append('<div class="corpo">%s</div>' % corpo)
    h.append('</section>')
    return "\n".join(h)

# ------------------------------------------------------------------ indice
nav = []
for gruppo, voci in FASCICOLI:
    nav.append('<div class="nav-gruppo"><h2 class="nav-titolo">%s</h2><ul>' % html.escape(gruppo))
    for sid, path, num, breve in voci:
        nav.append('<li><a href="#%s" data-id="%s"><span class="nav-num">%s</span>'
                   '<span class="nav-testo">%s</span></a></li>' % (sid, sid, html.escape(num), html.escape(breve)))
    nav.append('</ul></div>')
nav.append('<div class="nav-gruppo"><h2 class="nav-titolo">Schede da stampare</h2><ul>')
for sid, sigla, breve, _ in SCH.SCHEDE:
    nav.append('<li><a href="#%s" data-id="%s"><span class="nav-num">%s</span>'
               '<span class="nav-testo">%s</span></a></li>' % (sid, sid, sigla, breve))
nav.append('</ul></div>')
nav.append('<div class="nav-gruppo"><h2 class="nav-titolo">Tavole al tavolo</h2><ul>')
for sid, path, num, breve in TAVOLE:
    nav.append('<li><a href="#%s" data-id="%s"><span class="nav-num">%s</span>'
               '<span class="nav-testo">%s</span></a></li>' % (sid, sid, num, breve))
nav.append('</ul></div>')
NAV = "\n".join(nav)

corpo_fasc = "\n".join(sezione(*v) for _, voci in FASCICOLI for v in voci)
corpo_sched = "\n".join(
    '<section class="modulo-sez" id="%s" data-titolo="Scheda: %s" data-num="%s">%s</section>'
    % (sid, breve, sigla, htmlfrag) for sid, sigla, breve, htmlfrag in SCH.SCHEDE)
corpo_tav = "\n".join(sezione(sid, path, num, breve, classe="fascicolo tavola",
                              romano=num, iniziale=False) for sid, path, num, breve in TAVOLE)

# ------------------------------------------------------------------ stile
TESTA = """<title>La Prima Casa della Tuscia</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Sorts+Mill+Goudy:ital@0;1&family=Archivo+Narrow:wght@400;500;600&display=swap">
<style>
/* ============ 1. inchiostri e carte ============ */
:root{
  --terra:#D6D2C4; --carta:#EDEAE0; --carta-2:#E4E0D3;
  --bordo:#C0BAA8; --riga:#C4BEAE; --riga-lieve:#DBD6C8;
  --inchiostro:#26201A; --inchiostro-2:#585144; --inchiostro-3:#6F6858;
  --rubrica:#A8301C; --rubrica-2:#C0705C; --rubrica-velo:rgba(168,48,28,.09);
  --ombra:0 1px 0 rgba(38,32,26,.06), 0 18px 44px -24px rgba(38,32,26,.42);
  --antica:"Sorts Mill Goudy","Iowan Old Style",Georgia,serif;
  --testo:"EB Garamond","Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;
  --apparato:"Archivo Narrow","Roboto Condensed","Helvetica Neue",Arial,sans-serif;
  --colonna:64ch; --rail:4.6rem;
}
@media (prefers-color-scheme: dark){ :root:not([data-theme="light"]){
  --terra:#121110; --carta:#1B1917; --carta-2:#232019;
  --bordo:#37332B; --riga:#3C382F; --riga-lieve:#2B2822;
  --inchiostro:#E7E1D2; --inchiostro-2:#ADA695; --inchiostro-3:#8B8371;
  --rubrica:#D6735A; --rubrica-2:#9A4E3B; --rubrica-velo:rgba(214,115,90,.12);
  --ombra:0 1px 0 rgba(0,0,0,.5), 0 20px 50px -26px rgba(0,0,0,.85);
}}
:root[data-theme="dark"]{
  --terra:#121110; --carta:#1B1917; --carta-2:#232019;
  --bordo:#37332B; --riga:#3C382F; --riga-lieve:#2B2822;
  --inchiostro:#E7E1D2; --inchiostro-2:#ADA695; --inchiostro-3:#8B8371;
  --rubrica:#D6735A; --rubrica-2:#9A4E3B; --rubrica-velo:rgba(214,115,90,.12);
  --ombra:0 1px 0 rgba(0,0,0,.5), 0 20px 50px -26px rgba(0,0,0,.85);
}

*{box-sizing:border-box}
body{margin:0; background:var(--terra); color:var(--inchiostro);
  font-family:var(--testo); font-size:19px; line-height:1.62;
  -webkit-font-smoothing:antialiased; text-rendering:optimizeLegibility}
::selection{background:var(--rubrica-velo)}
a{color:var(--rubrica)}
:focus-visible{outline:2px solid var(--rubrica); outline-offset:2px}
h1,h2,h3,h4{text-wrap:balance}

/* ============ 2. impianto ============ */
.guscio{display:grid; grid-template-columns:19.5rem minmax(0,1fr); align-items:start}
@media (max-width:1080px){ .guscio{grid-template-columns:1fr} }

.indice{position:sticky; top:0; height:100vh; overflow-y:auto;
  padding:2rem 1.3rem 3rem 1.8rem; border-right:1px solid var(--bordo); background:var(--terra)}
.marca-indice{display:flex; align-items:baseline; gap:.5rem; margin-bottom:.15rem}
.marca-arme{font-family:var(--apparato); font-size:.6rem; font-weight:600; letter-spacing:.18em;
  text-transform:uppercase; color:var(--rubrica); border:1px solid var(--rubrica-2);
  padding:.14rem .36rem}
.marca-nome{font-family:var(--antica); font-size:1.05rem; letter-spacing:.03em}
.marca-sotto{font-family:var(--apparato); font-size:.64rem; letter-spacing:.15em;
  text-transform:uppercase; color:var(--inchiostro-3); margin:.3rem 0 1rem}
.cerca{width:100%; font-family:var(--apparato); font-size:.82rem; color:var(--inchiostro);
  background:var(--carta); border:1px solid var(--bordo); padding:.4rem .55rem; margin-bottom:1.2rem}
.cerca::placeholder{color:var(--inchiostro-3)}
.nav-gruppo{margin-bottom:1.05rem}
.nav-titolo{font-family:var(--apparato); font-size:.6rem; font-weight:600; letter-spacing:.18em;
  text-transform:uppercase; color:var(--inchiostro-3); margin:0 0 .35rem;
  padding-bottom:.28rem; border-bottom:1px solid var(--riga-lieve)}
.indice ul{list-style:none; margin:0; padding:0}
.indice a{display:grid; grid-template-columns:2rem minmax(0,1fr); gap:.2rem; align-items:baseline;
  padding:.18rem .3rem .18rem .1rem; text-decoration:none; color:var(--inchiostro-2); line-height:1.35}
.indice a:hover{color:var(--inchiostro); background:var(--carta-2)}
.nav-num{font-family:var(--apparato); font-size:.66rem; font-weight:600; letter-spacing:.06em;
  color:var(--inchiostro-3); font-variant-numeric:tabular-nums}
.nav-testo{font-size:.94rem}
.indice a.qui{color:var(--rubrica); background:var(--rubrica-velo)}
.indice a.qui .nav-num{color:var(--rubrica)}
.nulla-trovato{font-family:var(--apparato); font-size:.78rem; color:var(--inchiostro-3)}

/* testatina corrente, alla maniera del titolo corrente del libro */
.testata{position:sticky; top:0; z-index:40; display:flex; align-items:center; gap:.8rem;
  padding:.42rem 1.1rem; background:var(--carta); border-bottom:1px solid var(--riga);
  font-family:var(--apparato); font-size:.68rem; letter-spacing:.16em; text-transform:uppercase;
  color:var(--inchiostro-3)}
.testata-dove{flex:1; text-align:center; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
  color:var(--inchiostro-2)}
.testata-num{color:var(--rubrica); font-weight:600}
.testata button{font:inherit; letter-spacing:.14em; color:var(--inchiostro);
  background:var(--carta-2); border:1px solid var(--bordo); padding:.26rem .55rem; cursor:pointer; display:none}
@media (max-width:1080px){
  .testata button{display:block}
  .indice{position:fixed; z-index:50; inset:0 auto 0 0; width:min(22rem,86vw);
    transform:translateX(-102%); transition:transform .22s ease; box-shadow:var(--ombra)}
  .indice.aperto{transform:none}
}
@media (prefers-reduced-motion: reduce){ .indice{transition:none} }

.foglio{max-width:calc(var(--colonna) + var(--rail) + 9rem); margin:0 auto;
  padding:0 5rem 7rem 3.5rem; background:var(--carta);
  border-left:1px solid var(--bordo); border-right:1px solid var(--bordo); min-height:100vh}
@media (max-width:1080px){ .foglio{padding:0 1.1rem 4rem; border:0} }

/* ============ 3. frontespizio ============ */
.frontespizio{text-align:center; padding:4.5rem 0 2.5rem}
@media (max-width:640px){ .frontespizio{padding:2.2rem 0 1.6rem} }
.occhiello{font-family:var(--apparato); font-size:.66rem; font-weight:600; letter-spacing:.22em;
  text-transform:uppercase; color:var(--rubrica); margin:0 0 1.6rem}
.frontespizio h1{font-family:var(--antica); font-weight:400; margin:0;
  font-size:clamp(2rem,5.2vw,3.2rem); line-height:1.16; letter-spacing:.11em; text-transform:uppercase}
.frontespizio h1 .di{display:block; font-size:.5em; letter-spacing:.3em; color:var(--rubrica);
  margin:.35em 0; text-transform:lowercase; font-style:italic}
.marca-stampa{display:block; width:96px; height:120px; margin:2rem auto 1.6rem; color:var(--rubrica)}
.sommario{font-size:1.06rem; line-height:1.62; max-width:52ch; margin:0 auto 1.8rem;
  color:var(--inchiostro-2); text-align:left}
.sommario strong{color:var(--inchiostro); font-weight:500}
.colofone{display:flex; flex-wrap:wrap; justify-content:center; gap:.35rem 1.3rem;
  padding:.8rem 0; border-top:1px solid var(--riga); border-bottom:1px solid var(--riga);
  font-family:var(--apparato); font-size:.7rem; letter-spacing:.12em; text-transform:uppercase;
  color:var(--inchiostro-3)}
.colofone b{color:var(--inchiostro-2); font-weight:600}

/* ============ 4. il congegno della Prova ============ */
.prova{margin:2.6rem 0 1rem; background:var(--carta-2); border:1px solid var(--bordo);
  border-top:2.5px solid var(--rubrica); padding:1.2rem 1.3rem 1.3rem}
.prova-testa{display:flex; align-items:baseline; justify-content:space-between; gap:1rem; flex-wrap:wrap}
.prova-testa h2{font-family:var(--antica); font-size:1.2rem; font-weight:400; margin:0; letter-spacing:.06em}
.prova-nota{font-family:var(--apparato); font-size:.63rem; letter-spacing:.15em;
  text-transform:uppercase; color:var(--inchiostro-3)}
.prova-formula{font-style:italic; color:var(--inchiostro-2); margin:.1rem 0 1rem; font-size:.98rem}
.prova-campi{display:flex; flex-wrap:wrap; gap:.7rem 1rem; align-items:flex-end}
.prova-campi .campo{width:5rem}
.tira{font-family:var(--apparato); font-size:.7rem; font-weight:600; letter-spacing:.16em;
  text-transform:uppercase; color:var(--carta); background:var(--rubrica);
  border:1px solid var(--rubrica); padding:.5rem 1rem; cursor:pointer}
.tira:hover{background:var(--rubrica-2); border-color:var(--rubrica-2)}
.prova-esito{display:flex; flex-wrap:wrap; align-items:center; gap:.9rem 1.2rem;
  margin-top:1.1rem; padding-top:1rem; border-top:1px solid var(--riga)}
.dadi{display:flex; gap:.5rem}
.dado{width:2.5rem; height:2.5rem; background:var(--carta); border:1px solid var(--bordo);
  display:grid; grid-template-columns:repeat(3,1fr); grid-template-rows:repeat(3,1fr); padding:.32rem}
.dado i{width:.32rem; height:.32rem; border-radius:50%; background:var(--inchiostro);
  align-self:center; justify-self:center}
.dado.rossa i{background:var(--rubrica)}
.somma{font-family:var(--apparato); font-variant-numeric:tabular-nums; line-height:1.15}
.somma b{display:block; font-size:1.7rem; font-weight:600}
.somma span{font-size:.62rem; letter-spacing:.15em; text-transform:uppercase; color:var(--inchiostro-3)}
.verdetto{flex:1 1 14rem; min-width:12rem}
.verdetto b{display:block; font-family:var(--antica); font-size:1.15rem; font-weight:400; color:var(--rubrica)}
.verdetto span{display:block; font-size:.94rem; color:var(--inchiostro-2); line-height:1.45}
@keyframes scossa{0%,100%{transform:none}25%{transform:translateY(-3px) rotate(-3deg)}75%{transform:translateY(2px) rotate(3deg)}}
.dado.scuote{animation:scossa .28s ease}
@media (prefers-reduced-motion: reduce){ .dado.scuote{animation:none} }

/* ============ 5. incipit dei fascicoli ============ */
.fascicolo{padding-top:3.2rem; scroll-margin-top:3rem}
.incipit{text-align:center; padding-bottom:1.4rem; margin-bottom:1.9rem}
.inc-num{display:block; font-family:var(--apparato); font-size:.68rem; font-weight:600;
  letter-spacing:.34em; text-transform:uppercase; color:var(--rubrica); margin-bottom:.7rem}
.incipit h1{font-family:var(--antica); font-weight:400; margin:0;
  font-size:clamp(1.5rem,3.1vw,2.05rem); letter-spacing:.15em; text-transform:uppercase; line-height:1.22}
.inc-sotto{font-style:italic; color:var(--inchiostro-3); margin:.5rem 0 0}
.fleuron{display:block; width:62px; height:19px; margin:1.1rem auto 0; color:var(--rubrica-2)}
.stacco{display:flex; justify-content:center; margin:2.4em 0}
.stacco .fleuron{margin:0}

/* ============ 6. corpo del testo ============ */
.corpo{padding-left:var(--rail); max-width:calc(var(--colonna) + var(--rail))}
@media (max-width:760px){ .corpo{padding-left:0} }
.corpo p{margin:0 0 .5em; text-indent:1.3em; text-align:justify; hyphens:auto}
.corpo p.con-iniziale, .corpo h2 + p, .corpo h3 + p, .corpo h4 + p,
.corpo blockquote + p, .corpo .tabella + p, .corpo ul + p, .corpo ol + p,
.corpo .stacco + p{text-indent:0}
.corpo p.con-iniziale::after{content:""; display:block; clear:both}
.iniziale{float:left; font-family:var(--antica); color:var(--rubrica);
  font-size:3.1em; line-height:.9; margin:.05em .34em .06em 0; padding:.08em .14em;
  border:1px solid var(--rubrica-2); outline:1px solid var(--riga); outline-offset:2px}
.corpo h2{position:relative; font-family:var(--antica); font-size:1.32rem; font-weight:400;
  letter-spacing:.04em; margin:2.3em 0 .65em; padding-bottom:.26em;
  border-bottom:1px solid var(--riga-lieve)}
.corpo h2[data-mark]::before{content:attr(data-mark); position:absolute;
  left:calc(-1 * var(--rail)); top:.2em; width:calc(var(--rail) - 1rem); text-align:right;
  font-family:var(--apparato); font-size:.86rem; font-weight:600; color:var(--rubrica);
  font-variant-numeric:tabular-nums}
@media (max-width:760px){ .corpo h2[data-mark]::before{position:static; display:inline;
  margin-right:.5em; width:auto; text-align:left} }
.corpo h3{font-family:var(--antica); font-size:1.06rem; font-weight:400; letter-spacing:.05em;
  margin:1.9em 0 .45em}
.corpo h4{font-family:var(--apparato); font-size:.72rem; font-weight:600; letter-spacing:.16em;
  text-transform:uppercase; color:var(--inchiostro-3); margin:1.8em 0 .45em}
.corpo hr{display:none}
.corpo ul,.corpo ol{margin:.4em 0 1em; padding-left:1.4em}
.corpo li{margin-bottom:.38em; text-align:justify; hyphens:auto}
.corpo li::marker{color:var(--rubrica-2)}
.corpo ul ul,.corpo ol ul,.corpo ol ol{margin:.4em 0 .1em}
.fill{display:inline-block; border-bottom:1px solid var(--riga); height:1.05em;
  vertical-align:-.2em; min-width:6em}

blockquote{margin:1.5em 0}
blockquote.epigrafe{text-align:center; font-family:var(--antica); font-style:italic;
  font-size:1.1rem; color:var(--inchiostro-2); border:0; padding:0 1.5rem}
blockquote.epigrafe p{margin:0 0 .25em; text-indent:0; text-align:center}
blockquote.regola{position:relative; background:var(--carta-2); border:1px solid var(--bordo);
  border-left:2.5px solid var(--rubrica); padding:.9rem 1.1rem; font-size:1rem}
blockquote.regola p{margin:0 0 .45em; text-indent:0; text-align:left}
blockquote.regola p:last-child{margin-bottom:0}
blockquote.regola::before{content:"\\00B6"; position:absolute; left:calc(-1 * var(--rail));
  top:.75rem; width:calc(var(--rail) - 1rem); text-align:right;
  font-family:var(--antica); font-size:1.15rem; color:var(--rubrica)}
@media (max-width:760px){ blockquote.regola::before{display:none} }
blockquote .fonte{font-family:var(--apparato); font-style:normal; font-size:.7rem;
  letter-spacing:.14em; text-transform:uppercase; color:var(--inchiostro-3); margin-top:.5em}

/* ============ 7. tavole (apparato) ============ */
.tabella{overflow-x:auto; margin:1.4em 0; border-top:1.5px solid var(--inchiostro-2);
  border-bottom:1.5px solid var(--inchiostro-2)}
table{border-collapse:collapse; width:100%; font-size:.94rem}
thead th{font-family:var(--apparato); font-size:.65rem; font-weight:600; letter-spacing:.14em;
  text-transform:uppercase; color:var(--rubrica); text-align:left; vertical-align:bottom;
  padding:.5em .8em .45em 0; border-bottom:1px solid var(--riga); white-space:nowrap}
tbody td{padding:.46em .8em .46em 0; border-bottom:1px solid var(--riga-lieve);
  vertical-align:top; font-variant-numeric:tabular-nums}
tbody tr:last-child td{border-bottom:0}
th:last-child,td:last-child{padding-right:0}
td.vuota{height:1.8em}
.tavola .corpo{padding-left:0; max-width:none}
.tavola .corpo h2[data-mark]::before{position:static; display:inline; margin-right:.5em;
  width:auto; text-align:left}

/* ============ 8. i moduli ============ */
.modulo-sez{padding-top:3.2rem; scroll-margin-top:3rem}
.modulo-testa{text-align:center; border-bottom:2px solid var(--inchiostro-2);
  padding-bottom:.8rem; margin-bottom:1.5rem}
.modulo-sigla{display:block; font-family:var(--apparato); font-size:.68rem; font-weight:600;
  letter-spacing:.34em; color:var(--rubrica); margin-bottom:.55rem}
.modulo-testa h1{font-family:var(--antica); font-weight:400; margin:0;
  font-size:clamp(1.4rem,2.9vw,1.9rem); letter-spacing:.14em; text-transform:uppercase}
.modulo-uso{font-size:.92rem; font-style:italic; color:var(--inchiostro-2); margin:.55rem auto 0; max-width:52ch}
.mod-sez{margin-bottom:1.45rem}
.mod-sez h2{font-family:var(--apparato); font-size:.66rem; font-weight:600; letter-spacing:.18em;
  text-transform:uppercase; color:var(--rubrica); border-bottom:1px solid var(--riga);
  padding-bottom:.24rem; margin:0 0 .7rem}
.mod-sez h2 i{font-style:italic; text-transform:none; letter-spacing:.02em; color:var(--inchiostro-3)}
.mod-guida{font-size:.85rem; font-style:italic; color:var(--inchiostro-2); margin:-.35rem 0 .75rem}
.mod-sez h3{font-family:var(--apparato); font-size:.62rem; font-weight:600; letter-spacing:.14em;
  text-transform:uppercase; color:var(--inchiostro-3); margin:.9rem 0 .4rem}

.campi{display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:.7rem .9rem}
@media (max-width:700px){ .campi{grid-template-columns:repeat(2,minmax(0,1fr))} }
.campo{display:flex; flex-direction:column; gap:.14rem; min-width:0}
.campo>span,.casella>span,.tr-et,.rete>span{font-family:var(--apparato); font-size:.6rem;
  font-weight:500; letter-spacing:.13em; text-transform:uppercase; color:var(--inchiostro-3)}
.campo>span i,.casella>span i{text-transform:none; letter-spacing:.01em; font-style:italic}
input[type="text"],textarea{font:inherit; font-size:.95rem; color:var(--inchiostro);
  background:transparent; border:0; border-bottom:1px solid var(--riga);
  padding:.18rem .12rem; width:100%; border-radius:0}
input[type="text"]:focus,textarea:focus{outline:none; border-bottom-color:var(--rubrica);
  background:var(--rubrica-velo)}
.caselle{display:flex; flex-wrap:wrap; gap:.6rem .9rem}
.casella{display:flex; flex-direction:column; gap:.14rem; width:8rem}
.casella input{text-align:center; border:1px solid var(--riga); height:2rem;
  font-family:var(--apparato); font-variant-numeric:tabular-nums}
.traccia{display:flex; align-items:center; gap:.7rem; margin:.55rem 0; flex-wrap:wrap}
.tr-q{display:flex; gap:.26rem; flex-wrap:wrap}
.q{width:1.1rem; height:1.1rem; border:1px solid var(--riga); display:block; cursor:pointer; position:relative}
.q input{position:absolute; opacity:0; width:100%; height:100%; margin:0; cursor:pointer}
.q i{position:absolute; inset:2px; display:block}
.q input:checked + i{background:var(--rubrica)}
.q:has(input:focus-visible){outline:2px solid var(--rubrica); outline-offset:1px}

table.griglia{width:100%; border-collapse:collapse; font-size:.9rem}
table.griglia th{font-family:var(--apparato); font-size:.58rem; font-weight:600; letter-spacing:.12em;
  text-transform:uppercase; color:var(--inchiostro-3); text-align:left;
  border-bottom:1px solid var(--inchiostro-2); padding:0 .35rem .24rem 0; white-space:normal}
table.griglia td{border-bottom:1px solid var(--riga); padding:0}
table.griglia td input{border:0; padding:.36rem .3rem .36rem 0; height:1.95rem}
table.griglia th.lat{text-align:right; padding-right:.6rem; border-bottom:1px solid var(--riga);
  vertical-align:middle; width:16%}
table.ordine td{border-left:1px solid var(--riga-lieve)}

.scritte label{display:grid; grid-template-columns:15rem minmax(0,1fr); gap:.6rem;
  align-items:baseline; border-bottom:1px solid var(--riga); padding:.26rem 0}
@media (max-width:700px){ .scritte label{grid-template-columns:1fr} }
.scritte label>span{font-family:var(--apparato); font-size:.62rem; font-weight:500;
  letter-spacing:.11em; text-transform:uppercase; color:var(--inchiostro-3)}
.scritte input{border-bottom:0}
.note{display:flex; flex-direction:column; gap:.22rem}
.note>span{font-family:var(--apparato); font-size:.6rem; font-weight:500; letter-spacing:.13em;
  text-transform:uppercase; color:var(--inchiostro-3)}
.note textarea{border:1px solid var(--riga); padding:.15rem .5rem; line-height:1.95em;
  background-image:repeating-linear-gradient(var(--carta), var(--carta) calc(1.95em - 1px),
    var(--riga-lieve) calc(1.95em - 1px), var(--riga-lieve) 1.95em); resize:vertical}
.tenore,.scelte{display:flex; flex-wrap:wrap; align-items:center; gap:.4rem 1.1rem; margin:.3rem 0 .2rem}
.scelte{display:grid; grid-template-columns:repeat(auto-fill,minmax(15rem,1fr)); gap:.35rem 1.1rem}
.opz{display:inline-flex; align-items:baseline; gap:.35rem; font-size:.92rem; cursor:pointer}
.opz input{accent-color:var(--rubrica); margin:0}
.opz i{font-size:.8rem; font-style:italic; color:var(--inchiostro-3)}
.reti{display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:.7rem .9rem}
@media (max-width:700px){ .reti{grid-template-columns:repeat(2,minmax(0,1fr))} }
.rete{display:flex; flex-direction:column; gap:.14rem}
.rete input[type="text"]{border:1px solid var(--riga); height:1.9rem; text-align:center;
  font-family:var(--apparato)}
.usata{font-size:.7rem; font-style:normal; font-family:var(--apparato); letter-spacing:.05em;
  color:var(--inchiostro-3); display:flex; align-items:center; gap:.25rem}
.usata input{accent-color:var(--rubrica)}
.arti{display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:0 1.6rem}
@media (max-width:760px){ .arti{grid-template-columns:1fr} }
.segreto{border:1px dashed var(--rubrica-2); background:var(--carta-2); padding:1rem 1.1rem .4rem;
  margin-top:1.6rem}
.segreto-testa{font-family:var(--apparato); font-size:.62rem; font-weight:600; letter-spacing:.18em;
  text-transform:uppercase; color:var(--rubrica); text-align:center; margin-bottom:.9rem}
.bilancio{display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:1.2rem 2rem}
@media (max-width:700px){ .bilancio{grid-template-columns:1fr} }
.bil-riga{display:flex; justify-content:space-between; gap:.7rem; align-items:baseline;
  border-bottom:1px solid var(--riga-lieve); padding:.2rem 0}
.bil-riga>span{font-size:.9rem}
.bil-riga>span i{font-size:.8rem; color:var(--inchiostro-3)}
.bil-riga input{width:5.5rem; flex:none; text-align:right; border-bottom:0;
  font-family:var(--apparato); font-variant-numeric:tabular-nums}
.bil-tot{border-bottom:2px solid var(--inchiostro-2)}
.bil-tot>span{font-weight:600}
.modulo-piede{display:flex; align-items:center; gap:.7rem; margin-top:1.6rem;
  padding-top:.9rem; border-top:1px solid var(--riga)}
.stampa,.netta{font-family:var(--apparato); font-size:.66rem; font-weight:600; letter-spacing:.15em;
  text-transform:uppercase; color:var(--inchiostro); background:var(--carta-2);
  border:1px solid var(--bordo); padding:.42rem .8rem; cursor:pointer}
.stampa:hover,.netta:hover{border-color:var(--rubrica); color:var(--rubrica)}
.salvato{font-family:var(--apparato); font-size:.64rem; letter-spacing:.12em;
  text-transform:uppercase; color:var(--inchiostro-3)}

/* ============ 9. piede e ritorno ============ */
.piede{margin-top:4.5rem; padding-top:2rem; border-top:1px solid var(--riga);
  font-family:var(--apparato); font-size:.74rem; letter-spacing:.05em; color:var(--inchiostro-3)}
.piede p{margin:0 0 .4em; max-width:60ch}
.su{position:fixed; right:1.1rem; bottom:1.1rem; z-index:30; font-family:var(--apparato);
  font-size:.64rem; font-weight:600; letter-spacing:.14em; text-transform:uppercase;
  color:var(--inchiostro-2); background:var(--carta-2); border:1px solid var(--bordo);
  padding:.44rem .7rem; cursor:pointer; opacity:0; pointer-events:none; transition:opacity .2s}
.su.visibile{opacity:1; pointer-events:auto}

/* ============ 10. stampa ============ */
@media print{
  .indice,.testata,.su,.frontespizio,.prova,.modulo-piede,.cerca{display:none !important}
  .guscio{display:block}
  body{background:#fff; color:#000; font-size:10.5pt; line-height:1.45}
  .foglio{max-width:none; border:0; background:#fff; padding:0; min-height:0}
  .fascicolo,.modulo-sez{break-before:page; padding-top:0}
  .corpo{padding-left:0; max-width:none}
  .corpo h2[data-mark]::before,blockquote.regola::before{position:static; display:inline;
    margin-right:.4em; width:auto}
  .iniziale{color:#000; border-color:#000; outline-color:#999}
  .fleuron,.inc-num,.modulo-sigla,.mod-sez h2,thead th{color:#000}
  input[type="text"],textarea{color:#000; border-color:#666; background:#fff}
  .note textarea{background-image:repeating-linear-gradient(#fff,#fff calc(1.95em - 1px),
    #bbb calc(1.95em - 1px),#bbb 1.95em)}
  .q{border-color:#000}
  blockquote.regola,.prova,.segreto{background:#fff}
  .tabella{overflow:visible}
  table,blockquote,.mod-sez{break-inside:avoid}
  body.solo-uno .foglio > *{display:none !important}
  body.solo-uno .foglio > .da-stampare{display:block !important}
}
</style>"""

def opzioni(vals, sel, segno=False):
    return ''.join('<option value="%d"%s>%s%d</option>'
                   % (v, ' selected' if v == sel else '', '+' if (segno and v > 0) else '', v)
                   for v in vals)

FRONTESPIZIO = """
<header class="frontespizio">
  <p class="occhiello">Gioco di ruolo e di governo &middot; Toscana 1454&ndash;1540</p>
  <h1>La Prima Casa<span class="di">della</span>Tuscia</h1>
  %MARCA%
  <p class="sommario">Da tre a sei partecipanti reggono altrettanti casati toscani. Ciascuno
  interpreta <strong>due personaggi</strong>: un congiunto della famiglia &mdash; capo di casa,
  rampollo, vedova reggente &mdash; e un <strong>faccendiere</strong> che, di regola, serve il
  casato di un altro giocatore. Si contendono terre, uffici, parentadi e benefici finché uno non
  sia la prima casa di tutta la Tuscia. Nessun elemento fantastico.</p>
  <div class="colofone">
    <span><b>3&ndash;6</b> giocatori e un Arbitro</span>
    <span><b>2d6</b> per ogni prova</span>
    <span><b>1</b> stagione per seduta</span>
    <span><b>10&ndash;30</b> anni di campagna</span>
  </div>
</header>

<div class="prova">
  <div class="prova-testa">
    <h2>La Prova</h2>
    <span class="prova-nota" id="prova-nota">esempio</span>
  </div>
  <p class="prova-formula">2d6 + Qualit&agrave; + Arte + modificatori, contro un Contrasto</p>
  <div class="prova-campi">
    <div class="campo"><span>Qualit&agrave;</span><select id="q">%QUAL%</select></div>
    <div class="campo"><span>Arte</span><select id="a">%ARTE%</select></div>
    <div class="campo"><span>Modif.</span><select id="m">%MOD%</select></div>
    <div class="campo"><span>Contrasto</span><select id="c">%CONTR%</select></div>
    <button class="tira" id="tira" type="button">Tira i dadi</button>
  </div>
  <div class="prova-esito">
    <div class="dadi"><span class="dado" id="d1"></span><span class="dado" id="d2"></span></div>
    <div class="somma"><b id="somma">12</b><span>totale</span></div>
    <div class="verdetto"><b id="verdetto">Successo</b><span id="spiega"></span></div>
  </div>
</div>
"""
FRONTESPIZIO = (FRONTESPIZIO.replace('%MARCA%', MARCA)
  .replace('%QUAL%', opzioni(range(0, 6), 3))
  .replace('%ARTE%', opzioni(range(0, 6), 2))
  .replace('%MOD%', opzioni(range(-4, 5), 0, segno=True))
  .replace('%CONTR%', ''.join('<option value="%d"%s>%d</option>'
                              % (v, ' selected' if v == 10 else '', v) for v in [6,8,10,12,14,16])))

TESTATA = """
<div class="testata">
  <button id="apri-indice" type="button" aria-expanded="false" aria-controls="indice">Indice</button>
  <span class="testata-dove"><span class="testata-num" id="testata-num"></span>
    <span id="testata-titolo">Frontespizio</span></span>
</div>
"""

INDICE = ("""
<aside class="indice" id="indice" aria-label="Indice del manuale">
  <div class="marca-indice"><span class="marca-arme">Tuscia</span>
    <span class="marca-nome">La Prima Casa</span></div>
  <p class="marca-sotto">Manuale &mdash; indice</p>
  <input class="cerca" id="cerca" type="search" placeholder="Cerca un fascicolo&hellip;"
         aria-label="Filtra l'indice">
  %NAV%
  <p class="nulla-trovato" id="nulla" hidden>Nessun fascicolo con questo nome.</p>
</aside>
""").replace('%NAV%', NAV)

PIEDE = """
<footer class="piede">
  <p><b>La Prima Casa della Tuscia</b> &mdash; gioco di ruolo e di governo delle famiglie nella
  Toscana del Rinascimento. Diciannove fascicoli, sei schede da stampare, tre tavole.</p>
  <p>I casati dei partecipanti sono inventati e verosimili; le famiglie realmente esistite compaiono
  come case non giocanti. Le cifre monetarie sono ordini di grandezza attestati fra il 1450 e il
  1520, semplificati per il gioco.</p>
</footer>
"""

SCRIPT = """
<script>
(function(){
  var indice=document.getElementById('indice'), apri=document.getElementById('apri-indice'),
      cerca=document.getElementById('cerca'),
      su=document.getElementById('su')||document.createElement('button'),
      tNum=document.getElementById('testata-num'), tTit=document.getElementById('testata-titolo');
  if(indice && apri){
  var voci=[].slice.call(indice.querySelectorAll('a[data-id]'));
  var sezioni=voci.map(function(a){return document.getElementById(a.dataset.id);}).filter(Boolean);

  apri.addEventListener('click',function(){
    var ap=indice.classList.toggle('aperto');
    apri.setAttribute('aria-expanded',ap?'true':'false');
  });
  indice.addEventListener('click',function(ev){
    if(ev.target.closest('a')&&window.innerWidth<=1080){
      indice.classList.remove('aperto'); apri.setAttribute('aria-expanded','false');
    }
  });

  cerca.addEventListener('input',function(){
    var q=cerca.value.trim().toLowerCase(), visti=0;
    voci.forEach(function(a){
      var ok=!q||a.textContent.toLowerCase().indexOf(q)!==-1;
      a.parentElement.hidden=!ok; if(ok)visti++;
    });
    indice.querySelectorAll('.nav-gruppo').forEach(function(g){
      g.hidden=![].some.call(g.querySelectorAll('li'),function(li){return !li.hidden;});
    });
    document.getElementById('nulla').hidden=visti>0;
  });

  var atteso=false;
  function segna(){
    atteso=false;
    var y=window.scrollY+150, corr=-1;
    for(var i=0;i<sezioni.length;i++){ if(sezioni[i].offsetTop<=y) corr=i; }
    voci.forEach(function(a,i){ a.classList.toggle('qui',i===corr); });
    if(corr>=0){ tNum.textContent=sezioni[corr].dataset.num;
                 tTit.textContent=sezioni[corr].dataset.titolo; }
    else { tNum.textContent=''; tTit.textContent='Frontespizio'; }
    su.classList.toggle('visibile',window.scrollY>900);
  }
  window.addEventListener('scroll',function(){
    if(!atteso){ atteso=true; requestAnimationFrame(segna); }
  },{passive:true});
  segna();
  su.addEventListener('click',function(){
    window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});
  });
  }

  /* ---- il congegno della Prova ---- */
  if(document.getElementById('d1')){
  var PIP={1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
  function disegna(el,v,rossa){
    el.innerHTML=''; el.className='dado'+(rossa?' rossa':'');
    for(var i=0;i<9;i++){ var c=document.createElement('i');
      if(PIP[v].indexOf(i)===-1) c.style.visibility='hidden'; el.appendChild(c); }
    el.setAttribute('aria-label','dado: '+v);
  }
  var d1=document.getElementById('d1'), d2=document.getElementById('d2'),
      sQ=document.getElementById('q'), sA=document.getElementById('a'),
      sM=document.getElementById('m'), sC=document.getElementById('c'),
      somma=document.getElementById('somma'), verd=document.getElementById('verdetto'),
      spie=document.getElementById('spiega'), nota=document.getElementById('prova-nota');
  var GRADI=['Fallimento','Esito dubbio','Successo','Successo pieno'];
  var GLOSSA=['Non si ottiene, e la situazione peggiora.',
    'Si ottiene in parte: al prezzo di un ritardo, di una spesa, di un obbligo o di un testimone.',
    'Si ottiene ciò che si voleva.','Si ottiene ciò che si voleva, e qualcosa in più.'];
  function esito(a,b,primo){
    var tot=a+b+(+sQ.value)+(+sA.value)+(+sM.value), C=+sC.value, g;
    if(tot>=C+5)g=3; else if(tot>=C)g=2; else if(tot>=C-3)g=1; else g=0;
    var rossa=false, et;
    if(a===1&&b===1){ g=0; et='Tracollo'; rossa=true; }
    else if(a===6&&b===6){ g=Math.min(3,g+1); et='Colpo di fortuna — '+GRADI[g]; rossa=true; }
    else et=GRADI[g];
    disegna(d1,a,rossa); disegna(d2,b,rossa);
    d1.dataset.v=a; d2.dataset.v=b;
    somma.textContent=tot; verd.textContent=et;
    var coda=(a===1&&b===1)?' Fallisce comunque, e accade inoltre qualcosa di rovinoso.'
            :(a===6&&b===6)?' Accade inoltre qualcosa di favorevole che non si era cercato.':'';
    spie.textContent=GLOSSA[g]+coda;
    nota.textContent=primo?'esempio':(a+' e '+b+' sui dadi');
  }
  document.getElementById('tira').addEventListener('click',function(){
    var a=1+Math.floor(Math.random()*6), b=1+Math.floor(Math.random()*6);
    [d1,d2].forEach(function(d){ d.classList.remove('scuote'); void d.offsetWidth;
      d.classList.add('scuote'); });
    esito(a,b,false);
  });
  [sQ,sA,sM,sC].forEach(function(s){ s.addEventListener('change',function(){
    esito(+d1.dataset.v||4,+d2.dataset.v||3,false); }); });
  d1.dataset.v=4; d2.dataset.v=3; esito(4,3,true);
  }

  /* ---- le schede: si compilano, si serbano, si stampano ---- */
  function serba(k,v){ try{ localStorage.setItem(k,v); }catch(e){} }
  function leggi(k){ try{ return localStorage.getItem(k); }catch(e){ return null; } }
  function togli(k){ try{ localStorage.removeItem(k); }catch(e){} }

  document.querySelectorAll('.modulo-sez').forEach(function(sez){
    var base='tuscia:'+sez.id+':';
    var campi=[].slice.call(sez.querySelectorAll('input, textarea'));
    campi.forEach(function(el,i){
      var k=base+i, v=leggi(k);
      if(v!==null){ if(el.type==='checkbox'||el.type==='radio') el.checked=(v==='1');
                    else el.value=v; }
    });
    var spia=sez.querySelector('[data-salvato]'), timer;
    function annota(){
      if(!spia) return;
      spia.textContent='appuntato';
      clearTimeout(timer); timer=setTimeout(function(){ spia.textContent=''; },1600);
    }
    sez.addEventListener('input',function(ev){
      var i=campi.indexOf(ev.target); if(i<0) return;
      serba(base+i, ev.target.type==='checkbox'||ev.target.type==='radio'
        ? (ev.target.checked?'1':'0') : ev.target.value);
      annota();
    });
    sez.addEventListener('change',function(ev){
      var i=campi.indexOf(ev.target); if(i<0) return;
      if(ev.target.type==='checkbox'||ev.target.type==='radio'){
        campi.forEach(function(el,j){
          if(el.type==='radio'&&el.name===ev.target.name)
            serba(base+j, el.checked?'1':'0');
        });
        serba(base+i, ev.target.checked?'1':'0'); annota();
      }
    });
    var bs=sez.querySelector('[data-stampa]');
    if(bs) bs.addEventListener('click',function(){
      document.body.classList.add('solo-uno'); sez.classList.add('da-stampare');
      window.print();
    });
    var bn=sez.querySelector('[data-netta]');
    if(bn) bn.addEventListener('click',function(){
      if(!confirm('Svuotare questa scheda? Quanto vi è scritto andrà perduto.')) return;
      campi.forEach(function(el,i){
        if(el.type==='checkbox'||el.type==='radio') el.checked=false; else el.value='';
        togli(base+i);
      });
      if(spia){ spia.textContent='svuotata';
        setTimeout(function(){ spia.textContent=''; },1600); }
    });
  });
  window.addEventListener('afterprint',function(){
    document.body.classList.remove('solo-uno');
    document.querySelectorAll('.da-stampare').forEach(function(s){ s.classList.remove('da-stampare'); });
  });
})();
</script>
"""

pagina = (TESTA + TESTATA + '<div class="guscio">' + INDICE
          + '<main class="foglio" lang="it">' + FRONTESPIZIO
          + corpo_fasc + corpo_sched + corpo_tav + PIEDE + '</main></div>'
          + '<button class="su" id="su" type="button">In cima</button>' + SCRIPT)

USCITA.write_text(pagina, encoding="utf-8")

# le schede si serbano anche come foglio a sé, stampabile senza la pagina intera
solo = (TESTA + '<main class="foglio" lang="it">'
        + '\n'.join('<section class="modulo-sez" id="%s">%s</section>' % (s[0], s[3])
                    for s in SCH.SCHEDE)
        + '</main>' + SCRIPT)
(ROOT / "schede" / "schede-da-stampare.html").write_text(solo, encoding="utf-8")

print("scritto", USCITA, len(pagina), "caratteri")
print("scritto", ROOT / "schede" / "schede-da-stampare.html")
