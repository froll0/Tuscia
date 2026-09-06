# -*- coding: utf-8 -*-
import sys, re, pathlib, html
QUI = pathlib.Path(__file__).resolve().parent
sys.path.insert(0, str(QUI))
from md import convert, inline

ROOT = QUI.parent
USCITA = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else QUI / "tuscia.html"

GRUPPI = [
 ("Il patto", [("f00","manuale/00-avvertenza.md","00","Avvertenza"),
               ("f01","manuale/01-introduzione.md","01","Introduzione")]),
 ("Il mondo", [("f02","manuale/02-ambientazione.md","02","L'ambientazione")]),
 ("La creazione", [("f03","manuale/03-il-casato.md","03","Il casato"),
                   ("f04","manuale/04-i-personaggi.md","04","I personaggi")]),
 ("Le regole", [("f05","manuale/05-sistema-di-gioco.md","05","Il sistema"),
                ("f06","manuale/06-corso-dell-anno.md","06","Il corso dell'anno")]),
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
 ("Schede da compilare", [("s1","schede/scheda-casato.md","S1","Casato"),
                          ("s2","schede/scheda-congiunto.md","S2","Congiunto"),
                          ("s3","schede/scheda-faccendiere.md","S3","Faccendiere"),
                          ("s4","schede/scheda-terra.md","S4","Terra"),
                          ("s5","schede/scheda-esercito.md","S5","Esercito"),
                          ("s6","schede/scheda-trama.md","S6","Trama")]),
 ("Tavole al tavolo", [("t1","tavole/tavola-del-sistema.md","T1","Il sistema"),
                       ("t2","tavole/tavola-dei-conti.md","T2","I conti"),
                       ("t3","tavole/tavola-della-guerra.md","T3","La guerra")]),
]

def sezione(sid, path, num, breve):
    md = (ROOT / path).read_text()
    linee = md.split("\n")
    titolo, resto = breve.upper(), md
    for k, l in enumerate(linee):
        if l.startswith("# "):
            t = l[2:].strip()
            t = re.sub(r'^\d{2}\s+—\s+', '', t)
            titolo = t
            resto = "\n".join(linee[k+1:])
            break
    sotto = ""
    if " — " in titolo:
        titolo, sotto = titolo.split(" — ", 1)
    corpo = convert(resto, level_shift=0)
    h = ['<section class="fascicolo" id="%s">' % sid]
    h.append('<header class="fasc-testa">')
    h.append('<span class="fasc-num">%s</span>' % html.escape(num))
    h.append('<h1>%s</h1>' % inline(titolo))
    if sotto:
        h.append('<p class="fasc-sotto">%s</p>' % inline(sotto))
    h.append('</header>')
    h.append('<div class="corpo">%s</div>' % corpo)
    h.append('</section>')
    return "\n".join(h)

# --- indice ---
nav = []
for gruppo, voci in GRUPPI:
    nav.append('<div class="nav-gruppo"><h2 class="nav-titolo">%s</h2><ul>' % html.escape(gruppo))
    for sid, path, num, breve in voci:
        nav.append('<li><a href="#%s" data-id="%s"><span class="nav-num">%s</span><span class="nav-testo">%s</span></a></li>'
                   % (sid, sid, html.escape(num), html.escape(breve)))
    nav.append('</ul></div>')
NAV = "\n".join(nav)

corpo = "\n".join(sezione(*v) for _, voci in GRUPPI for v in voci)

TESTA = """<title>La Prima Casa della Tuscia</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Archivo+Narrow:wght@400;500;600&display=swap">
<style>
:root{
  --terra:#DFDED4; --terra-2:#D5D4C8;
  --carta:#F7F6EF; --carta-2:#EFEEE4;
  --bordo:#CBCABC;
  --inchiostro:#22231E; --inchiostro-2:#55564C; --inchiostro-3:#7C7D71;
  --riga:#C9C8B9; --riga-lieve:#E3E2D6;
  --rubrica:#A02D1C; --rubrica-2:#C0705E; --rubrica-velo:rgba(160,45,28,.10);
  --ombra:0 1px 0 rgba(34,35,30,.05), 0 12px 34px -18px rgba(34,35,30,.35);
  --serif:"EB Garamond","Iowan Old Style","Palatino Linotype",Palatino,Georgia,serif;
  --grot:"Archivo Narrow","Roboto Condensed","Helvetica Neue",Arial,sans-serif;
  --colonna:66ch; --rail:5rem;
}
@media (prefers-color-scheme: dark){
  :root:not([data-theme="light"]){
    --terra:#121310; --terra-2:#191A16;
    --carta:#1C1E1A; --carta-2:#232520;
    --bordo:#33352E;
    --inchiostro:#E4E3D6; --inchiostro-2:#A8A89B; --inchiostro-3:#7E7F72;
    --riga:#3A3C34; --riga-lieve:#2A2C26;
    --rubrica:#D46E54; --rubrica-2:#95493A; --rubrica-velo:rgba(212,110,84,.13);
    --ombra:0 1px 0 rgba(0,0,0,.4), 0 14px 40px -20px rgba(0,0,0,.8);
  }
}
:root[data-theme="dark"]{
  --terra:#121310; --terra-2:#191A16;
  --carta:#1C1E1A; --carta-2:#232520;
  --bordo:#33352E;
  --inchiostro:#E4E3D6; --inchiostro-2:#A8A89B; --inchiostro-3:#7E7F72;
  --riga:#3A3C34; --riga-lieve:#2A2C26;
  --rubrica:#D46E54; --rubrica-2:#95493A; --rubrica-velo:rgba(212,110,84,.13);
  --ombra:0 1px 0 rgba(0,0,0,.4), 0 14px 40px -20px rgba(0,0,0,.8);
}

*{box-sizing:border-box}
body{
  margin:0; background:var(--terra); color:var(--inchiostro);
  font-family:var(--serif); font-size:19px; line-height:1.62;
  -webkit-font-smoothing:antialiased; text-rendering:optimizeLegibility;
}
::selection{background:var(--rubrica-velo)}
a{color:var(--rubrica)}
:focus-visible{outline:2px solid var(--rubrica); outline-offset:3px; border-radius:2px}

/* ---------- impianto ---------- */
.guscio{display:grid; grid-template-columns:20rem minmax(0,1fr); align-items:start}
@media (max-width:1080px){ .guscio{grid-template-columns:1fr} }

/* ---------- indice ---------- */
.indice{
  position:sticky; top:0; height:100vh; overflow-y:auto;
  padding:2.2rem 1.4rem 3rem 1.9rem;
  border-right:1px solid var(--bordo); background:var(--terra);
}
.marca{display:flex; align-items:baseline; gap:.55rem; margin-bottom:.2rem}
.marca-arme{
  font-family:var(--grot); font-size:.62rem; font-weight:600; letter-spacing:.18em;
  text-transform:uppercase; color:var(--rubrica); border:1px solid var(--rubrica-2);
  padding:.16rem .38rem; border-radius:1px;
}
.marca-nome{font-size:1.06rem; font-weight:600; letter-spacing:.01em; line-height:1.2}
.marca-sotto{
  font-family:var(--grot); font-size:.68rem; letter-spacing:.1em; text-transform:uppercase;
  color:var(--inchiostro-3); margin:.35rem 0 1.1rem;
}
.cerca{
  width:100%; font-family:var(--grot); font-size:.82rem; color:var(--inchiostro);
  background:var(--carta); border:1px solid var(--bordo); border-radius:2px;
  padding:.42rem .55rem; margin-bottom:1.3rem;
}
.cerca::placeholder{color:var(--inchiostro-3)}
.nav-gruppo{margin-bottom:1.15rem}
.nav-titolo{
  font-family:var(--grot); font-size:.63rem; font-weight:600; letter-spacing:.17em;
  text-transform:uppercase; color:var(--inchiostro-3);
  margin:0 0 .4rem; padding-bottom:.3rem; border-bottom:1px solid var(--riga-lieve);
}
.indice ul{list-style:none; margin:0; padding:0; display:flex; flex-direction:column}
.indice a{
  display:grid; grid-template-columns:2.1rem minmax(0,1fr); gap:.2rem; align-items:baseline;
  padding:.2rem .35rem .2rem .1rem; text-decoration:none; color:var(--inchiostro-2);
  border-radius:2px; line-height:1.35;
}
.indice a:hover{color:var(--inchiostro); background:var(--carta-2)}
.nav-num{
  font-family:var(--grot); font-size:.68rem; font-weight:600; letter-spacing:.06em;
  color:var(--inchiostro-3); font-variant-numeric:tabular-nums;
}
.nav-testo{font-size:.95rem}
.indice a.qui{color:var(--rubrica); background:var(--rubrica-velo)}
.indice a.qui .nav-num{color:var(--rubrica)}
.nulla-trovato{font-family:var(--grot); font-size:.8rem; color:var(--inchiostro-3); padding:.4rem 0}

/* ---------- barra mobile ---------- */
.barra{
  display:none; position:sticky; top:0; z-index:40;
  align-items:center; gap:.7rem; padding:.55rem .9rem;
  background:var(--terra); border-bottom:1px solid var(--bordo);
}
.barra button{
  font-family:var(--grot); font-size:.72rem; font-weight:600; letter-spacing:.12em;
  text-transform:uppercase; color:var(--inchiostro); background:var(--carta);
  border:1px solid var(--bordo); border-radius:2px; padding:.34rem .6rem; cursor:pointer;
}
.barra-dove{font-family:var(--grot); font-size:.74rem; letter-spacing:.08em; text-transform:uppercase; color:var(--inchiostro-3); overflow:hidden; text-overflow:ellipsis; white-space:nowrap}
@media (max-width:1080px){
  .barra{display:flex}
  .indice{position:fixed; z-index:50; inset:0 auto 0 0; width:min(22rem,86vw); transform:translateX(-102%); transition:transform .22s ease; box-shadow:var(--ombra)}
  .indice.aperto{transform:none}
}

/* ---------- foglio ---------- */
.foglio{
  max-width:calc(var(--colonna) + var(--rail) + 6rem); margin:0 auto; padding:0 3rem 6rem;
  background:var(--carta); border-left:1px solid var(--bordo); border-right:1px solid var(--bordo);
  min-height:100vh;
}
@media (max-width:1080px){ .foglio{padding:0 1.1rem 4rem; border:0} }

/* frontespizio */
.frontis{padding:5rem 0 3rem; border-bottom:1px solid var(--riga)}
@media (max-width:640px){ .frontis{padding:2.4rem 0 2rem} }
.occhiello{
  font-family:var(--grot); font-size:.7rem; font-weight:600; letter-spacing:.2em;
  text-transform:uppercase; color:var(--rubrica); margin:0 0 1.1rem;
}
.frontis h1{
  font-size:clamp(2.5rem,7vw,4.3rem); font-weight:500; line-height:1.02;
  letter-spacing:-.012em; margin:0 0 1rem; text-wrap:balance; max-width:15ch;
}
.frontis h1 em{font-style:italic; color:var(--rubrica)}
.sommario{font-size:1.14rem; line-height:1.58; max-width:57ch; color:var(--inchiostro-2); margin:0 0 1.6rem}
.sommario strong{color:var(--inchiostro); font-weight:500}
.colofone{
  display:flex; flex-wrap:wrap; gap:.4rem 1.4rem; padding:.85rem 0;
  border-top:1px solid var(--riga-lieve); border-bottom:1px solid var(--riga-lieve);
  font-family:var(--grot); font-size:.74rem; letter-spacing:.09em; text-transform:uppercase; color:var(--inchiostro-3);
}
.colofone b{color:var(--inchiostro-2); font-weight:600}

/* congegno della prova */
.prova{
  margin-top:2.4rem; background:var(--carta-2); border:1px solid var(--bordo);
  border-top:3px solid var(--rubrica); box-shadow:var(--ombra); padding:1.3rem 1.4rem 1.4rem;
}
.prova-testa{display:flex; align-items:baseline; justify-content:space-between; gap:1rem; flex-wrap:wrap; margin-bottom:.15rem}
.prova-testa h2{font-size:1.28rem; font-weight:600; margin:0; letter-spacing:.01em}
.prova-nota{font-family:var(--grot); font-size:.66rem; letter-spacing:.14em; text-transform:uppercase; color:var(--inchiostro-3)}
.prova-formula{font-style:italic; color:var(--inchiostro-2); margin:0 0 1.05rem; font-size:1rem}
.prova-campi{display:flex; flex-wrap:wrap; gap:.75rem 1.1rem; align-items:flex-end}
.campo{display:flex; flex-direction:column; gap:.22rem}
.campo label{font-family:var(--grot); font-size:.63rem; font-weight:600; letter-spacing:.14em; text-transform:uppercase; color:var(--inchiostro-3)}
.campo select{
  font-family:var(--grot); font-size:.92rem; font-variant-numeric:tabular-nums;
  color:var(--inchiostro); background:var(--carta); border:1px solid var(--bordo);
  border-radius:2px; padding:.3rem .45rem; min-width:4.4rem;
}
.tira{
  font-family:var(--grot); font-size:.74rem; font-weight:600; letter-spacing:.15em;
  text-transform:uppercase; color:var(--carta); background:var(--rubrica);
  border:1px solid var(--rubrica); border-radius:2px; padding:.5rem 1rem; cursor:pointer;
}
.tira:hover{background:var(--rubrica-2); border-color:var(--rubrica-2)}
.prova-esito{
  display:flex; flex-wrap:wrap; align-items:center; gap:.9rem 1.2rem;
  margin-top:1.15rem; padding-top:1.05rem; border-top:1px solid var(--riga-lieve);
}
.dadi{display:flex; gap:.5rem}
.dado{
  width:2.6rem; height:2.6rem; background:var(--carta); border:1px solid var(--bordo);
  border-radius:3px; display:grid; grid-template-columns:repeat(3,1fr); grid-template-rows:repeat(3,1fr);
  padding:.34rem;
}
.dado i{width:.34rem; height:.34rem; border-radius:50%; background:var(--inchiostro); align-self:center; justify-self:center}
.dado.rossa i{background:var(--rubrica)}
.somma{font-family:var(--grot); font-variant-numeric:tabular-nums; line-height:1.15}
.somma b{display:block; font-size:1.75rem; font-weight:600; letter-spacing:-.01em}
.somma span{font-size:.64rem; letter-spacing:.14em; text-transform:uppercase; color:var(--inchiostro-3)}
.verdetto{flex:1 1 14rem; min-width:12rem}
.verdetto b{display:block; font-size:1.22rem; font-weight:600; color:var(--rubrica); letter-spacing:.005em}
.verdetto span{display:block; font-size:.95rem; color:var(--inchiostro-2); line-height:1.45}
@keyframes scossa{0%,100%{transform:none}25%{transform:translateY(-3px) rotate(-3deg)}75%{transform:translateY(2px) rotate(3deg)}}
.dado.scuote{animation:scossa .28s ease}
@media (prefers-reduced-motion: reduce){ .dado.scuote{animation:none} }

/* ---------- fascicoli ---------- */
.fascicolo{padding-top:3.4rem; scroll-margin-top:1rem}
.fasc-testa{
  display:grid; grid-template-columns:var(--rail) minmax(0,1fr); align-items:start;
  gap:0 0; padding-bottom:1.1rem; margin-bottom:1.8rem; border-bottom:1px solid var(--riga);
}
.fasc-num{
  font-family:var(--grot); font-size:1.5rem; font-weight:600; letter-spacing:.02em;
  color:var(--rubrica); font-variant-numeric:tabular-nums; line-height:1.15; padding-top:.15rem;
}
.fasc-testa h1{
  grid-column:2; margin:0; font-size:clamp(1.6rem,3.2vw,2.15rem); font-weight:500;
  letter-spacing:.05em; text-transform:uppercase; line-height:1.15; text-wrap:balance;
}
.fasc-sotto{grid-column:2; margin:.35rem 0 0; font-style:italic; color:var(--inchiostro-3)}
@media (max-width:760px){
  .fasc-testa{grid-template-columns:1fr}
  .fasc-testa h1,.fasc-sotto{grid-column:1}
  .fasc-num{font-size:1.05rem; margin-bottom:.3rem}
}

.corpo{padding-left:var(--rail); max-width:calc(var(--colonna) + var(--rail))}
@media (max-width:760px){ .corpo{padding-left:0} }
.corpo>*{margin-left:0}
.corpo p{margin:0 0 1.05em}
.corpo h2{
  position:relative; font-size:1.42rem; font-weight:600; letter-spacing:.005em;
  margin:2.6em 0 .7em; padding-bottom:.28em; border-bottom:1px solid var(--riga-lieve); text-wrap:balance;
}
.corpo h2[data-mark]::before{
  content:attr(data-mark); position:absolute; left:calc(-1 * var(--rail)); top:.28em; width:calc(var(--rail) - 1.1rem);
  text-align:right; font-family:var(--grot); font-size:.9rem; font-weight:600;
  color:var(--rubrica); font-variant-numeric:tabular-nums; letter-spacing:.02em;
}
@media (max-width:760px){
  .corpo h2[data-mark]::before{position:static; display:inline; margin-right:.5em; width:auto; text-align:left}
}
.corpo h3{font-size:1.1rem; font-weight:600; letter-spacing:.02em; margin:2em 0 .5em; color:var(--inchiostro)}
.corpo h4{font-family:var(--grot); font-size:.75rem; font-weight:600; letter-spacing:.15em; text-transform:uppercase; color:var(--inchiostro-3); margin:1.9em 0 .5em}
.corpo hr{border:0; border-top:1px solid var(--riga); margin:2.6em 0}
.corpo ul,.corpo ol{margin:0 0 1.15em; padding-left:1.35em}
.corpo li{margin-bottom:.42em}
.corpo li::marker{color:var(--rubrica-2)}
.corpo ul ul,.corpo ol ul,.corpo ol ol{margin:.45em 0 .1em}
.corpo strong{font-weight:600}
.corpo em{font-style:italic}
.fill{display:inline-block; border-bottom:1px solid var(--riga); height:1.05em; vertical-align:-.2em; min-width:6em}

/* citazioni */
blockquote{margin:1.6em 0; padding:0}
blockquote.epigrafe{
  padding-left:1.1rem; border-left:2px solid var(--rubrica-2);
  font-size:1.12rem; font-style:italic; color:var(--inchiostro-2);
}
blockquote.epigrafe p{margin:0 0 .3em}
blockquote.regola{
  background:var(--carta-2); border:1px solid var(--bordo); border-left:3px solid var(--rubrica);
  padding:.95rem 1.15rem; font-size:1.02rem;
}
blockquote.regola p{margin:0 0 .5em}
blockquote.regola p:last-child{margin-bottom:0}
blockquote .fonte{
  font-family:var(--grot); font-style:normal; font-size:.74rem; letter-spacing:.09em;
  text-transform:uppercase; color:var(--inchiostro-3); margin-top:.55em;
}

/* tabelle */
.tabella{overflow-x:auto; margin:1.5em 0; border-top:1.5px solid var(--inchiostro-2); border-bottom:1.5px solid var(--inchiostro-2)}
table{border-collapse:collapse; width:100%; font-size:.95rem}
thead th{
  font-family:var(--grot); font-size:.68rem; font-weight:600; letter-spacing:.13em;
  text-transform:uppercase; color:var(--rubrica); text-align:left; vertical-align:bottom;
  padding:.55em .8em .5em 0; border-bottom:1px solid var(--riga); white-space:nowrap;
}
tbody td{
  padding:.5em .8em .5em 0; border-bottom:1px solid var(--riga-lieve);
  vertical-align:top; font-variant-numeric:tabular-nums;
}
tbody tr:last-child td{border-bottom:0}
th:last-child,td:last-child{padding-right:0}
td.vuota{height:1.9em}
tbody td strong{font-weight:600}

/* schede: cella vuota da riempire */
#s1 td.vuota,#s2 td.vuota,#s3 td.vuota,#s4 td.vuota,#s5 td.vuota,#s6 td.vuota{
  background:linear-gradient(to top, var(--riga-lieve) 1px, transparent 1px); height:2.2em;
}

/* piede */
.piede{
  margin-top:5rem; padding:2.2rem 0 0; border-top:1px solid var(--riga);
  font-family:var(--grot); font-size:.76rem; letter-spacing:.06em; color:var(--inchiostro-3);
}
.piede p{margin:0 0 .4em; max-width:60ch}

.su{
  position:fixed; right:1.1rem; bottom:1.1rem; z-index:30;
  font-family:var(--grot); font-size:.66rem; font-weight:600; letter-spacing:.13em; text-transform:uppercase;
  color:var(--inchiostro-2); background:var(--carta-2); border:1px solid var(--bordo);
  border-radius:2px; padding:.45rem .7rem; cursor:pointer; opacity:0; pointer-events:none; transition:opacity .2s;
}
.su.visibile{opacity:1; pointer-events:auto}

@media print{
  .indice,.barra,.su,.prova{display:none}
  .guscio{display:block}
  body{background:#fff; color:#000; font-size:11pt}
  .foglio{max-width:none; border:0; background:#fff; padding:0}
  .fascicolo{break-before:page}
}
</style>"""

PIEDE = """
<footer class="piede">
  <p><b>La Prima Casa della Tuscia</b> — gioco di ruolo e di governo delle famiglie nella Toscana del Rinascimento. Testo integrale del manuale: diciotto fascicoli, sei schede, tre tavole.</p>
  <p>I casati dei partecipanti sono inventati e verosimili; le famiglie realmente esistite compaiono come case non giocanti. Le cifre monetarie sono ordini di grandezza attestati fra il 1450 e il 1520, semplificati per il gioco.</p>
</footer>
"""

SCRIPT = """
<script>
(function(){
  var indice = document.getElementById('indice');
  var apri = document.getElementById('apri-indice');
  var dove = document.getElementById('barra-dove');
  var cerca = document.getElementById('cerca');
  var voci = Array.prototype.slice.call(indice.querySelectorAll('a[data-id]'));
  var sezioni = voci.map(function(a){ return document.getElementById(a.dataset.id); }).filter(Boolean);
  var su = document.getElementById('su');

  apri.addEventListener('click', function(){
    var ap = indice.classList.toggle('aperto');
    apri.setAttribute('aria-expanded', ap ? 'true' : 'false');
  });
  indice.addEventListener('click', function(e){
    if (e.target.closest('a') && window.innerWidth <= 1080) {
      indice.classList.remove('aperto');
      apri.setAttribute('aria-expanded','false');
    }
  });

  cerca.addEventListener('input', function(){
    var q = cerca.value.trim().toLowerCase();
    var visti = 0;
    voci.forEach(function(a){
      var ok = !q || a.textContent.toLowerCase().indexOf(q) !== -1;
      a.parentElement.hidden = !ok;
      if (ok) visti++;
    });
    indice.querySelectorAll('.nav-gruppo').forEach(function(g){
      var qualcuno = Array.prototype.some.call(g.querySelectorAll('li'), function(li){ return !li.hidden; });
      g.hidden = !qualcuno;
    });
    document.getElementById('nulla').hidden = visti > 0;
  });

  var atteso = false;
  function segna(){
    atteso = false;
    var y = window.scrollY + 140, corr = -1;
    for (var i = 0; i < sezioni.length; i++) { if (sezioni[i].offsetTop <= y) corr = i; }
    voci.forEach(function(a, i){ a.classList.toggle('qui', i === corr); });
    dove.textContent = corr >= 0 ? voci[corr].querySelector('.nav-testo').textContent : 'Frontespizio';
    su.classList.toggle('visibile', window.scrollY > 900);
  }
  window.addEventListener('scroll', function(){
    if (!atteso) { atteso = true; requestAnimationFrame(segna); }
  }, {passive:true});
  segna();

  su.addEventListener('click', function(){
    window.scrollTo({top:0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
  });

  /* --- congegno della Prova --- */
  var PIP = {1:[4],2:[0,8],3:[0,4,8],4:[0,2,6,8],5:[0,2,4,6,8],6:[0,2,3,5,6,8]};
  function disegna(el, v, rossa){
    el.innerHTML = '';
    el.className = 'dado' + (rossa ? ' rossa' : '');
    for (var i = 0; i < 9; i++){
      var c = document.createElement('i');
      if (PIP[v].indexOf(i) === -1) c.style.visibility = 'hidden';
      el.appendChild(c);
    }
    el.setAttribute('aria-label', 'dado: ' + v);
  }
  var d1 = document.getElementById('d1'), d2 = document.getElementById('d2');
  var sQ = document.getElementById('q'), sA = document.getElementById('a'),
      sM = document.getElementById('m'), sC = document.getElementById('c');
  var somma = document.getElementById('somma'), verd = document.getElementById('verdetto'),
      spie = document.getElementById('spiega'), nota = document.getElementById('prova-nota');

  var GRADI = ['Fallimento','Esito dubbio','Successo','Successo pieno'];
  var GLOSSA = [
    'Non si ottiene, e la situazione peggiora.',
    'Si ottiene in parte: al prezzo di un ritardo, di una spesa, di un obbligo o di un testimone.',
    'Si ottiene ciò che si voleva.',
    'Si ottiene ciò che si voleva, e qualcosa in più.'
  ];
  function esito(a, b, primo){
    var tot = a + b + (+sQ.value) + (+sA.value) + (+sM.value);
    var C = +sC.value, g;
    if (tot >= C + 5) g = 3; else if (tot >= C) g = 2; else if (tot >= C - 3) g = 1; else g = 0;
    var rossa = false, etichetta;
    if (a === 1 && b === 1){ g = 0; etichetta = 'Tracollo'; rossa = true; }
    else if (a === 6 && b === 6){ g = Math.min(3, g + 1); etichetta = 'Colpo di fortuna — ' + GRADI[g]; rossa = true; }
    else etichetta = GRADI[g];
    disegna(d1, a, rossa); disegna(d2, b, rossa);
    somma.textContent = tot;
    verd.textContent = etichetta;
    var coda = (a === 1 && b === 1) ? ' Fallisce comunque, e accade inoltre qualcosa di rovinoso.'
             : (a === 6 && b === 6) ? ' Accade inoltre qualcosa di favorevole che non si era cercato.' : '';
    spie.textContent = GLOSSA[g] + coda;
    nota.textContent = primo ? 'esempio' : (a + ' e ' + b + ' sui dadi');
  }
  document.getElementById('tira').addEventListener('click', function(){
    var a = 1 + Math.floor(Math.random()*6), b = 1 + Math.floor(Math.random()*6);
    [d1,d2].forEach(function(d){ d.classList.remove('scuote'); void d.offsetWidth; d.classList.add('scuote'); });
    esito(a, b, false);
  });
  [sQ,sA,sM,sC].forEach(function(s){ s.addEventListener('change', function(){
    esito(+d1.dataset.v || 4, +d2.dataset.v || 3, false);
  }); });
  d1.dataset.v = 4; d2.dataset.v = 3;
  esito(4, 3, true);
})();
</script>
"""

def opzioni(vals, sel, pref=''):
    return ''.join('<option value="%s"%s>%s%s</option>' % (v, ' selected' if v == sel else '', pref if v >= 0 else '', v)
                   for v in vals)

FRONTIS = """
<header class="frontis">
  <p class="occhiello">Gioco di ruolo e di governo · Toscana, 1454–1540</p>
  <h1>La Prima Casa della <em>Tuscia</em></h1>
  <p class="sommario">Da tre a sei partecipanti reggono altrettanti casati toscani. Ciascuno interpreta <strong>due personaggi</strong>: un congiunto della famiglia — capo di casa, rampollo, vedova reggente — e un <strong>faccendiere</strong> che, di regola, serve il casato di un altro giocatore. Si contendono terre, uffici, parentadi e benefici finché uno non sia la prima casa di tutta la Tuscia. Nessun elemento fantastico.</p>
  <div class="colofone">
    <span><b>3–6</b> giocatori e un Arbitro</span>
    <span><b>2d6</b> per ogni prova</span>
    <span><b>1</b> stagione per seduta</span>
    <span><b>10–30</b> anni di campagna</span>
    <span><b>18</b> fascicoli</span>
  </div>

  <div class="prova">
    <div class="prova-testa">
      <h2>La Prova</h2>
      <span class="prova-nota" id="prova-nota">esempio</span>
    </div>
    <p class="prova-formula">2d6 + Qualità + Arte + modificatori, contro un Contrasto</p>
    <div class="prova-campi">
      <div class="campo"><label for="q">Qualità</label><select id="q">%QUAL%</select></div>
      <div class="campo"><label for="a">Arte</label><select id="a">%ARTE%</select></div>
      <div class="campo"><label for="m">Modif.</label><select id="m">%MOD%</select></div>
      <div class="campo"><label for="c">Contrasto</label><select id="c">%CONTR%</select></div>
      <button class="tira" id="tira" type="button">Tira i dadi</button>
    </div>
    <div class="prova-esito">
      <div class="dadi"><span class="dado" id="d1"></span><span class="dado" id="d2"></span></div>
      <div class="somma"><b id="somma">12</b><span>totale</span></div>
      <div class="verdetto"><b id="verdetto">Successo</b><span id="spiega"></span></div>
    </div>
  </div>
</header>
"""
FRONTIS = (FRONTIS
  .replace('%QUAL%', opzioni(range(0,6), 3))
  .replace('%ARTE%', opzioni(range(0,6), 2))
  .replace('%MOD%', ''.join('<option value="%d"%s>%s%d</option>' % (v, ' selected' if v==0 else '', '+' if v>0 else '', v) for v in range(-4,5)))
  .replace('%CONTR%', ''.join('<option value="%d"%s>%d</option>' % (v, ' selected' if v==10 else '', v) for v in [6,8,10,12,14,16])))

BARRA = """
<div class="barra">
  <button id="apri-indice" type="button" aria-expanded="false" aria-controls="indice">Indice</button>
  <span class="barra-dove" id="barra-dove">Frontespizio</span>
</div>
"""

INDICE = """
<aside class="indice" id="indice" aria-label="Indice del manuale">
  <div class="marca"><span class="marca-arme">Tuscia</span><span class="marca-nome">La Prima Casa</span></div>
  <p class="marca-sotto">Manuale — indice</p>
  <input class="cerca" id="cerca" type="search" placeholder="Cerca un fascicolo…" aria-label="Filtra l'indice">
  %NAV%
  <p class="nulla-trovato" id="nulla" hidden>Nessun fascicolo con questo nome.</p>
</aside>
""".replace('%NAV%', NAV)

pagina = (TESTA + BARRA + '<div class="guscio">' + INDICE +
          '<main class="foglio">' + FRONTIS + corpo + PIEDE + '</main></div>' +
          '<button class="su" id="su" type="button">In cima</button>' + SCRIPT)

USCITA.write_text(pagina, encoding="utf-8")
print("scritto", USCITA, len(pagina), "caratteri")
