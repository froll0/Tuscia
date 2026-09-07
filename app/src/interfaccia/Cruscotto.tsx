import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { usaCampagna, usaDati, usaMutaCampagna } from '../dati/contesto'
import { Campo, Dado, Foglio, Misura, Vuoto, fiorini } from './comuni'
import { EPOCHE, RACCOLTO, REGIONI, CONTRASTI } from '../regole/tavole'
import { azioniDisponibili, uominiIdonei } from '../regole/bilancio'
import { computaRendita } from '../regole/terre'
import { valutaProva } from '../regole/prova'
import { creaSorte } from '../regole/dado'
import { nuovoId } from '../modello/fabbrica'
import { FASI, STAGIONI } from '../modello/tipi'
import type { Fase, Stagione } from '../modello/tipi'

const NOMI_FASE: Record<Fase, string> = {
  nuove: 'I — Le Nuove', consiglio: 'II — Il Consiglio', scene: 'III — Le Scene',
  armi: 'IV — Le Armi', banco: 'V — Il Banco', casa: 'VI — La Casa',
}
const sorte = creaSorte()

export default function Cruscotto() {
  const { id } = useParams()
  const campagna = usaCampagna(id)
  const muta = usaMutaCampagna(id)
  const [nota, setNota] = useState('')
  const [privata, setPrivata] = useState(false)
  const [prova, setProva] = useState<ReturnType<typeof valutaProva> | null>(null)
  const [bonus, setBonus] = useState(5)
  const [contrasto, setContrasto] = useState(10)
  const { deposito } = usaDati()
  const [codice, setCodice] = useState<string | null>(null)

  useEffect(() => {
    let vivo = true
    if (id && deposito.codiceDi) {
      void deposito.codiceDi(id).then((c) => { if (vivo) setCodice(c) })
    } else setCodice(null)
    return () => { vivo = false }
  }, [id, deposito])

  if (!campagna) return <Vuoto>Campagna non trovata in questo deposito.</Vuoto>

  const iFase = FASI.indexOf(campagna.fase)

  async function avanzaFase() {
    await muta((c) => {
      const i = FASI.indexOf(c.fase)
      if (i < FASI.length - 1) return { ...c, fase: FASI[i + 1]! }
      const s = STAGIONI.indexOf(c.stagione)
      const nuovaStagione: Stagione = s < 3 ? STAGIONI[s + 1]! : 'primavera'
      return { ...c, fase: 'nuove', stagione: nuovaStagione, anno: s < 3 ? c.anno : c.anno + 1 }
    })
  }

  async function tiraRaccolto(regione: string) {
    const [a, b] = sorte.d2d6()
    await muta((c) => ({
      ...c,
      raccolti: { ...c.raccolti, [regione]: a + b },
      prezzoGrano: RACCOLTO[a + b]?.grano ?? c.prezzoGrano,
      giornale: [{
        id: nuovoId(), anno: c.anno, stagione: c.stagione, fase: c.fase, casatoId: null,
        testo: `Raccolto in ${regione}: ${a + b} — ${RACCOLTO[a + b]?.etichetta}. Lo staio di grano a ${RACCOLTO[a + b]?.grano} soldi.`,
        quando: new Date().toISOString(), autore: 'Arbitro', privata: false,
      }, ...c.giornale],
    }))
  }

  async function annota() {
    if (!nota.trim()) return
    const testo = nota.trim()
    setNota('')
    await muta((c) => ({
      ...c,
      giornale: [{
        id: nuovoId(), anno: c.anno, stagione: c.stagione, fase: c.fase, casatoId: null,
        testo, quando: new Date().toISOString(), autore: c.arbitro, privata,
      }, ...c.giornale],
    }))
  }

  return (
    <>
      <div className="riga riga-sparsa" style={{ marginBottom: '1rem' }}>
        <div>
          <h1>{campagna.nome}</h1>
          <p className="glossa">
            {EPOCHE[campagna.epoca]?.etichetta} · {campagna.cittaPrincipale} · arbitra {campagna.arbitro}
          </p>
        </div>
        <Link to={`/c/${campagna.id}/casato/nuovo`}>
          <button className="primario" type="button">Nuovo casato</button>
        </Link>
      </div>

      {codice && (
        <Foglio titolo="Il codice d'invito">
          <p className="glossa">
            Chi vuole sedersi a questo tavolo apra il programma, entri nel medesimo progetto
            Supabase, e adoperi questo codice nella pagina Deposito.
          </p>
          <div className="riga" style={{ marginTop: '.6rem' }}>
            <code style={{ fontFamily: 'var(--apparato)', fontSize: '1.3rem', letterSpacing: '.2em',
                           border: '1px solid var(--bordo)', padding: '.4rem .8rem',
                           background: 'var(--carta-2)' }}>{codice}</code>
            <button type="button" onClick={() => void navigator.clipboard?.writeText(codice)}>
              Copiare
            </button>
          </div>
        </Foglio>
      )}

      <Foglio titolo="Il corso dell'anno">
        <div className="griglia g3" style={{ marginBottom: '1rem' }}>
          <Misura etichetta="Anno" valore={campagna.anno} />
          <Misura etichetta="Stagione" valore={campagna.stagione} />
          <Misura etichetta="Fase" valore={NOMI_FASE[campagna.fase]} />
          <Misura etichetta="Staio di grano" valore={`${campagna.prezzoGrano} soldi`}
                  glossa={campagna.prezzoGrano >= 40 ? 'carestia: il popolo tumultua' : 'prezzo corrente'} />
        </div>
        <div className="riga">
          {FASI.map((f, i) => (
            <span key={f} className={`pastiglia${i === iFase ? ' rossa' : ''}`}>{NOMI_FASE[f]}</span>
          ))}
        </div>
        <div className="riga" style={{ marginTop: '.9rem' }}>
          <button className="primario" type="button" onClick={() => void avanzaFase()}>
            {iFase < FASI.length - 1 ? 'Alla fase seguente' : 'Alla stagione seguente'}
          </button>
        </div>
      </Foglio>

      {campagna.stagione === 'autunno' && (
        <Foglio titolo="Il raccolto">
          <p className="glossa">
            Si tira 2d6 per ciascuna regione dove i casati hanno terre. Il risultato moltiplica la
            rendita agraria dell&apos;anno e fissa il prezzo del grano (fasc. 07 § 5).
          </p>
          <div className="tabella">
            <table>
              <thead><tr><th>Regione</th><th>Tiro</th><th>Annata</th><th className="cifra">Fattore</th><th /></tr></thead>
              <tbody>
                {REGIONI.map((r) => {
                  const t = campagna.raccolti[r]
                  return (
                    <tr key={r}>
                      <td>{r}</td>
                      <td>{t ?? '—'}</td>
                      <td>{t ? RACCOLTO[t]?.etichetta : <span className="minuto">non tirato</span>}</td>
                      <td className="cifra">{t ? `× ${RACCOLTO[t]?.fattore}` : '—'}</td>
                      <td className="cifra">
                        <button className="minuto" type="button" onClick={() => void tiraRaccolto(r)}>Tira</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Foglio>
      )}

      <Foglio titolo={`I casati (${campagna.casati.length})`}>
        {campagna.casati.length === 0
          ? <Vuoto>Nessun casato. I giocatori ne creino uno per ciascuno.</Vuoto>
          : (
            <div className="elenco-schede">
              {campagna.casati.map((k) => {
                const rendita = k.terre.reduce((s, t) => s + computaRendita(t, campagna.anno, null).finale, 0)
                  + k.imprese.reduce((s, i) => s + i.utileUltimoAnno, 0)
                return (
                  <Link key={k.id} to={`/c/${campagna.id}/casato/${k.id}`} className="scheda-breve">
                    <h2>{k.nome}</h2>
                    <p className="minuto">{k.citta} · {k.ceto.replace('-', ' ')}</p>
                    <div className="riga" style={{ marginTop: '.5rem' }}>
                      <span className="pastiglia">Onore {k.onore}</span>
                      <span className="pastiglia rossa">Sospetto {k.sospetto}</span>
                      <span className="pastiglia">Seguito {k.seguiti[0]?.valore ?? 0}</span>
                    </div>
                    <p className="glossa" style={{ marginTop: '.5rem' }}>
                      {fiorini(k.patrimonio)} in cassa · {fiorini(rendita)} di rendita ·{' '}
                      {azioniDisponibili(k)} {azioniDisponibili(k) === 1 ? 'Azione' : 'Azioni'}
                      {' '}({uominiIdonei(k).length} uomini idonei)
                    </p>
                  </Link>
                )
              })}
            </div>
          )}
      </Foglio>

      <div className="griglia g2">
        <Foglio titolo="Il congegno della Prova">
          <p className="glossa">2d6 + Qualità + Arte + modificatori, contro un Contrasto.</p>
          <div className="riga" style={{ margin: '.8rem 0' }}>
            <Campo etichetta="Somma di Qualità, Arte e modificatori">
              <input type="number" value={bonus} onChange={(e) => setBonus(Number(e.target.value))} />
            </Campo>
            <Campo etichetta="Contrasto">
              <select value={contrasto} onChange={(e) => setContrasto(Number(e.target.value))}>
                {CONTRASTI.map((c) => <option key={c.valore} value={c.valore}>{c.valore} — {c.nome}</option>)}
              </select>
            </Campo>
          </div>
          <button className="primario" type="button"
                  onClick={() => setProva(valutaProva(sorte.d2d6(), bonus, contrasto))}>Tira i dadi</button>
          {prova && (
            <div className="riga" style={{ marginTop: '1rem', alignItems: 'flex-start' }}>
              <div className="dadi">
                <Dado valore={prova.dadi[0]} rosso={prova.colpoDiFortuna || prova.tracollo} />
                <Dado valore={prova.dadi[1]} rosso={prova.colpoDiFortuna || prova.tracollo} />
              </div>
              <div>
                <div className="cifra-grossa">{prova.totale}</div>
                <span className="etichetta">totale contro {prova.contrasto}</span>
              </div>
              <div className="crescente">
                <strong style={{ color: 'var(--rubrica)', fontFamily: 'var(--antica)', fontSize: '1.1rem' }}>
                  {prova.nome}
                </strong>
                <p className="glossa">{prova.glossa}</p>
              </div>
            </div>
          )}
        </Foglio>

        <Foglio titolo="Il giornale della campagna">
          <Campo etichetta="Che cosa è accaduto">
            <textarea rows={3} value={nota} onChange={(e) => setNota(e.target.value)}
                      placeholder="Muore ser Iacopo Ferrantini, e i figli vendono in fretta un podere presso Rignano…" />
          </Campo>
          <div className="riga" style={{ margin: '.6rem 0' }}>
            <label className="riga" style={{ gap: '.35rem' }}>
              <input type="checkbox" checked={privata} style={{ width: 'auto' }}
                     onChange={(e) => setPrivata(e.target.checked)} />
              <span className="etichetta">Nota riservata all&apos;Arbitro</span>
            </label>
            <button type="button" onClick={() => void annota()} disabled={!nota.trim()}>Annotare</button>
          </div>
          {campagna.giornale.length === 0
            ? <Vuoto>Il giornale è ancora bianco.</Vuoto>
            : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, maxHeight: '18rem', overflowY: 'auto' }}>
                {campagna.giornale.slice(0, 40).map((v) => (
                  <li key={v.id} style={{ borderBottom: '1px solid var(--riga-lieve)', padding: '.5rem 0' }}>
                    <span className="etichetta">{v.stagione} {v.anno}{v.privata ? ' · riservata' : ''}</span>
                    <p style={{ margin: '.15rem 0 0' }}>{v.testo}</p>
                  </li>
                ))}
              </ul>
            )}
        </Foglio>
      </div>
    </>
  )
}
