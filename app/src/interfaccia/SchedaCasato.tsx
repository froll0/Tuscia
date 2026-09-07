import { Fragment, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { usaCampagna, usaMutaCampagna } from '../dati/contesto'
import { Campo, Foglio, Misura, Scaletta, Vuoto, fiorini } from './comuni'
import { SORTE_TERRA, TENORI, MANTENIMENTO_ARMI, SORTE_IMPRESA, MIGLIORIE_DISPONIBILI, REGIONI } from '../regole/tavole'
import { computaRendita, etichettaFedelta, terraNuova } from '../regole/terre'
import { bilancioStagione, uominiIdonei } from '../regole/bilancio'
import { computaPreminenza } from '../regole/preminenza'
import { onoreConsentito, seguitoConsentito, speseAnnueDiCasa, corpoDi } from '../regole/casa'
import { nuovoId } from '../modello/fabbrica'
import type { Casato, SortaImpresa, SortaTerra, Tenore } from '../modello/tipi'

const SORTE_COMPRABILI = (Object.keys(SORTE_TERRA) as SortaTerra[]).filter((s) => SORTE_TERRA[s].prezzo !== null)

export default function SchedaCasato() {
  const { id, kid } = useParams()
  const campagna = usaCampagna(id)
  const muta = usaMutaCampagna(id)
  const vaiA = useNavigate()
  const [terraAperta, setTerraAperta] = useState<string | null>(null)
  const [regionePer, setRegionePer] = useState<Record<string, string>>({})
  const [spesaAzioni, setSpesaAzioni] = useState(0)
  const [nuovaSorta, setNuovaSorta] = useState<SortaTerra>('podere')
  const [nuovoNome, setNuovoNome] = useState('')

  const casato = campagna?.casati.find((k) => k.id === kid) ?? null

  const bilancio = useMemo(() => casato && campagna
    ? bilancioStagione(casato, campagna.stagione, campagna.anno, campagna.raccolti,
        (idTerra) => regionePer[idTerra] ?? '', spesaAzioni)
    : null, [casato, campagna, regionePer, spesaAzioni])

  const preminenza = useMemo(() => casato && campagna
    ? computaPreminenza(casato, campagna.anno) : null, [casato, campagna])

  if (!campagna) return <Vuoto>Campagna non trovata.</Vuoto>
  if (!casato) return <Vuoto>Casato non trovato.</Vuoto>

  const k = casato
  const mutaCasato = (opera: (x: Casato) => Casato) =>
    muta((c) => ({ ...c, casati: c.casati.map((y) => (y.id === k.id ? opera(y) : y)) }))

  const idonei = uominiIdonei(k)
  const spese = speseAnnueDiCasa(k)
  const seguito = k.seguiti[0]

  return (
    <>
      <div className="riga riga-sparsa" style={{ marginBottom: '1rem' }}>
        <div>
          <h1>{k.nome}</h1>
          <p className="glossa">
            {k.citta} · {k.ceto.replace('-', ' ')}{k.inCittaDal && ` · in città dal ${k.inCittaDal}`}
            {k.motto && ` · «${k.motto}»`}
          </p>
        </div>
        <div className="riga">
          <Link to={`/c/${campagna.id}`}><button type="button">Alla campagna</button></Link>
        </div>
      </div>

      <Foglio titolo="Lo stato della casa">
        <div className="griglia g3">
          <div className="misura">
            <span className="etichetta">Patrimonio</span>
            <input type="number" value={k.patrimonio}
                   onChange={(e) => void mutaCasato((x) => ({ ...x, patrimonio: Number(e.target.value) }))} />
            <span className="glossa">fiorini in cassa</span>
          </div>
          <div className="misura">
            <span className="etichetta">Onore</span>
            <Scaletta valore={k.onore} min={0} max={10} muta={(n) => void mutaCasato((x) => ({ ...x, onore: n }))} />
            <span className="glossa">
              il Tenore {k.tenore} consente fino a {onoreConsentito(k)}
              {k.onore > onoreConsentito(k) && ' — eccede: si alzi il Tenore o scenderà'}
            </span>
          </div>
          <div className="misura">
            <span className="etichetta">Sospetto</span>
            <Scaletta valore={k.sospetto} min={0} max={10} muta={(n) => void mutaCasato((x) => ({ ...x, sospetto: n }))} />
            <span className="glossa">{k.sospetto >= 5 ? 'gli Otto di Guardia vi tengono d’occhio' : 'ciò che di voi si mormora'}</span>
          </div>
          <div className="misura">
            <span className="etichetta">Magnificenza</span>
            <Scaletta valore={k.magnificenza} min={0} max={10} muta={(n) => void mutaCasato((x) => ({ ...x, magnificenza: n }))} />
            <span className="glossa">non si perde mai</span>
          </div>
          <div className="misura">
            <span className="etichetta">Seguito in {seguito?.citta ?? k.citta}</span>
            <Scaletta valore={seguito?.valore ?? 0} min={0} max={10}
                      muta={(n) => void mutaCasato((x) => ({ ...x,
                        seguiti: x.seguiti.map((g, i) => (i === 0 ? { ...g, valore: n } : g)) }))} />
            <span className="glossa">
              mai oltre l&apos;Onore + 2, dunque {seguitoConsentito(k)}
              {(seguito?.valore ?? 0) > seguitoConsentito(k) && ' — eccede'}
            </span>
          </div>
          <div className="misura">
            <span className="etichetta">Armi</span>
            <Scaletta valore={k.gradoArmi} min={0} max={5} muta={(n) => void mutaCasato((x) => ({ ...x, gradoArmi: n }))} />
            <span className="glossa">{MANTENIMENTO_ARMI[k.gradoArmi]?.glossa} — {MANTENIMENTO_ARMI[k.gradoArmi]?.spesa} fl a stagione</span>
          </div>
          <div className="misura">
            <span className="etichetta">Tenore di casa</span>
            <select value={k.tenore} onChange={(e) => void mutaCasato((x) => ({ ...x, tenore: e.target.value as Tenore }))}>
              {(Object.keys(TENORI) as Tenore[]).map((t) =>
                <option key={t} value={t}>{TENORI[t].etichetta} — {TENORI[t].spesaAnnua} fl</option>)}
            </select>
            <span className="glossa">spese di casa {fiorini(spese.totale)} l&apos;anno</span>
          </div>
          <div className="misura">
            <span className="etichetta">Famigli</span>
            <Scaletta valore={k.famigli} min={0} max={30} muta={(n) => void mutaCasato((x) => ({ ...x, famigli: n }))} />
            <span className="glossa">10 fl l&apos;anno ciascuno</span>
          </div>
        </div>
      </Foglio>

      <Foglio titolo="Le Azioni della stagione" azione={
        <span className="pastiglia rossa">{Math.max(1, Math.min(5, idonei.length))} Azioni</span>}>
        <p className="glossa">
          Il numero delle Azioni è il numero degli Uomini di Casa idonei, da 1 a 5. Una casa senza
          uomini non fa nulla, per quanto sia ricca.
        </p>
        {idonei.length === 0
          ? <Vuoto>Nessun uomo idoneo: si aggiunga un congiunto o si assoldi un faccendiere.</Vuoto>
          : (
            <ul style={{ margin: '.7rem 0 0', paddingLeft: '1.2rem' }}>
              {idonei.map((u) => <li key={u.nome}>{u.nome} <span className="minuto">— {u.perche}</span></li>)}
            </ul>
          )}
      </Foglio>

      <Foglio titolo={`Il bilancio — ${campagna.stagione} ${campagna.anno}`}>
        <div className="riga" style={{ marginBottom: '.8rem' }}>
          <Campo etichetta="Spesa delle Azioni dichiarate">
            <input type="number" value={spesaAzioni} onChange={(e) => setSpesaAzioni(Number(e.target.value))} />
          </Campo>
        </div>
        {bilancio && (
          <div className="griglia g2">
            <div className="tabella">
              <h3>Entrate</h3>
              <table>
                <tbody>
                  {bilancio.entrate.map((v) => (
                    <tr key={v.nome}><td>{v.nome}<br /><span className="minuto">{v.computo}</span></td>
                      <td className="cifra">{v.fiorini}</td></tr>
                  ))}
                  <tr className="totale"><td>Totale entrate</td><td className="cifra">{bilancio.totaleEntrate}</td></tr>
                </tbody>
              </table>
            </div>
            <div className="tabella">
              <h3>Uscite</h3>
              <table>
                <tbody>
                  {bilancio.uscite.map((v) => (
                    <tr key={v.nome}><td>{v.nome}<br /><span className="minuto">{v.computo}</span></td>
                      <td className="cifra">{v.fiorini}</td></tr>
                  ))}
                  <tr className="totale"><td>Totale uscite</td><td className="cifra">{bilancio.totaleUscite}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
        {bilancio && (
          <>
            <div className="griglia g3" style={{ marginTop: '1rem' }}>
              <Misura etichetta="Avanzo o disavanzo" valore={fiorini(bilancio.saldo)} />
              <Misura etichetta="Patrimonio a fine stagione" valore={fiorini(bilancio.patrimonioFinale)} />
            </div>
            {bilancio.patrimonioFinale < 0 && (
              <div className="avviso">
                La cassa non basta. Si vendano gioie e masserizie, poi terre; oppure si prenda a
                prestito da un banco (10–15%), da un prestatore ebreo (20–30%) o da un parente
                (nulla d&apos;interesse, molto di obbligazione). Chi non trova denaro <strong>rompe</strong>.
              </div>
            )}
            <div className="riga" style={{ marginTop: '.8rem' }}>
              <button type="button" onClick={() => void mutaCasato((x) => ({
                ...x, patrimonio: bilancio.patrimonioFinale }))}>
                Chiudere la stagione e portare il saldo in cassa
              </button>
            </div>
          </>
        )}
      </Foglio>

      <Foglio titolo={`Le terre (${k.terre.length})`} azione={
        <span className="pastiglia">
          {fiorini(k.terre.reduce((s, t) => s + computaRendita(t, campagna.anno, campagna.raccolti[regionePer[t.id] ?? ''] ?? null).finale, 0))} l&apos;anno
        </span>}>
        <div className="riga" style={{ alignItems: 'flex-end', marginBottom: '1rem' }}>
          <Campo etichetta="Sorta">
            <select value={nuovaSorta} onChange={(e) => setNuovaSorta(e.target.value as SortaTerra)}>
              {SORTE_COMPRABILI.map((s) => (
                <option key={s} value={s}>
                  {SORTE_TERRA[s].etichetta} — {SORTE_TERRA[s].prezzo} fl, rende {SORTE_TERRA[s].rendita}
                </option>
              ))}
            </select>
          </Campo>
          <Campo etichetta="Nome"><input value={nuovoNome} onChange={(e) => setNuovoNome(e.target.value)} /></Campo>
          <button type="button" disabled={!nuovoNome.trim()} onClick={() => {
            const prezzo = SORTE_TERRA[nuovaSorta].prezzo ?? 0
            void mutaCasato((x) => ({ ...x,
              terre: [...x.terre, terraNuova(nuovaSorta, nuovoNome.trim(), '', nuovoId())],
              patrimonio: x.patrimonio - prezzo }))
            setNuovoNome('')
          }}>Comprare</button>
        </div>

        {k.terre.length === 0 ? <Vuoto>Nessuna terra.</Vuoto> : (
          <div className="tabella">
            <table>
              <thead>
                <tr><th>Terra</th><th>Sorta</th><th>Regione</th><th>Fedeltà</th>
                  <th className="cifra">Rende</th><th /></tr>
              </thead>
              <tbody>
                {k.terre.map((t) => {
                  const reg = regionePer[t.id] ?? ''
                  const c = computaRendita(t, campagna.anno, campagna.raccolti[reg] ?? null)
                  return (
                    <Fragment key={t.id}>
                      <tr>
                        <td><strong>{t.nome}</strong>{t.luogo && <><br /><span className="minuto">{t.luogo}</span></>}</td>
                        <td>{SORTE_TERRA[t.sorta].etichetta}</td>
                        <td>
                          <select value={reg} onChange={(e) => setRegionePer((v) => ({ ...v, [t.id]: e.target.value }))}>
                            <option value="">—</option>
                            {REGIONI.map((r) => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </td>
                        <td>
                          <Scaletta valore={t.fedelta} min={0} max={10} muta={(n) => void mutaCasato((x) => ({
                            ...x, terre: x.terre.map((y) => (y.id === t.id ? { ...y, fedelta: n } : y)) }))} />
                          <span className="minuto">{etichettaFedelta(t.fedelta)}</span>
                        </td>
                        <td className="cifra"><strong>{c.finale} fl</strong></td>
                        <td className="cifra">
                          <button className="minuto" type="button"
                                  onClick={() => setTerraAperta(terraAperta === t.id ? null : t.id)}>
                            {terraAperta === t.id ? 'Chiudi' : 'Computo'}
                          </button>
                        </td>
                      </tr>
                      {terraAperta === t.id && (
                        <tr>
                          <td colSpan={6} style={{ background: 'var(--carta-2)', padding: '.8rem' }}>
                            <ol style={{ margin: 0, paddingLeft: '1.2rem' }}>
                              {c.passaggi.map((p) => <li key={p}>{p}</li>)}
                            </ol>
                            <div className="riga" style={{ marginTop: '.8rem', alignItems: 'flex-end' }}>
                              <Campo etichetta="Aggiungere una miglioria">
                                <select defaultValue="" onChange={(e) => {
                                  const m = MIGLIORIE_DISPONIBILI.find((x) => x.nome === e.target.value)
                                  if (!m) return
                                  void mutaCasato((x) => ({ ...x,
                                    patrimonio: x.patrimonio - m.costo,
                                    terre: x.terre.map((y) => y.id === t.id ? { ...y, migliorie: [...y.migliorie, {
                                      id: nuovoId(), nome: m.nome, anno: campagna.anno,
                                      dalAnno: campagna.anno + m.anni, costo: m.costo, resa: m.resa,
                                    }] } : y) }))
                                  e.target.value = ''
                                }}>
                                  <option value="">—</option>
                                  {MIGLIORIE_DISPONIBILI.map((m) => (
                                    <option key={m.nome} value={m.nome}>
                                      {m.nome} — {m.costo} fl, rende {m.resa} dopo {m.anni} {m.anni === 1 ? 'anno' : 'anni'}
                                    </option>
                                  ))}
                                </select>
                              </Campo>
                              <label className="riga" style={{ gap: '.35rem' }}>
                                <input type="checkbox" checked={t.guastata} style={{ width: 'auto' }}
                                       onChange={(e) => void mutaCasato((x) => ({ ...x,
                                         terre: x.terre.map((y) => y.id === t.id ? { ...y, guastata: e.target.checked } : y) }))} />
                                <span className="etichetta">guastata quest&apos;anno</span>
                              </label>
                              <button className="minuto" type="button" onClick={() => void mutaCasato((x) => ({
                                ...x, terre: x.terre.filter((y) => y.id !== t.id) }))}>Vendere</button>
                            </div>
                            {t.migliorie.length > 0 && (
                              <p className="minuto" style={{ marginTop: '.6rem' }}>
                                Migliorie: {t.migliorie.map((m) => `${m.nome} (${m.dalAnno <= campagna.anno ? `rende ${m.resa}` : `dal ${m.dalAnno}`})`).join(' · ')}
                              </p>
                            )}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Foglio>

      <div className="griglia g2">
        <Foglio titolo={`La famiglia (${k.congiunti.length})`} azione={
          <Link to={`/c/${campagna.id}/casato/${k.id}/persona`}><button className="minuto" type="button">Aggiungere</button></Link>}>
          {k.congiunti.length === 0 ? <Vuoto>Nessun congiunto.</Vuoto> : (
            <div className="tabella">
              <table>
                <thead><tr><th>Nome</th><th>Età</th><th>Posto</th><th>Stato</th><th className="cifra">Corpo</th></tr></thead>
                <tbody>
                  {k.congiunti.map((c) => (
                    <tr key={c.id}>
                      <td><strong>{c.nome}</strong> {c.patronimico}
                        {c.giocatore && <><br /><span className="minuto">regge {c.giocatore}</span></>}</td>
                      <td>{c.eta}</td><td>{c.posto.replace('-', ' ')}</td><td>{c.stato.replace('-', ' ')}</td>
                      <td className="cifra">{c.ferite}/{corpoDi(c)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Foglio>

        <Foglio titolo={`I faccendieri (${k.faccendieri.length})`} azione={
          <Link to={`/c/${campagna.id}/casato/${k.id}/persona?sorta=faccendiere`}>
            <button className="minuto" type="button">Assoldare</button></Link>}>
          <p className="glossa">
            Il faccendiere di un giocatore serve, di regola, il casato di un altro. La sua Fedeltà
            è nota al solo giocatore che lo regge.
          </p>
          {k.faccendieri.length === 0 ? <Vuoto>Nessun faccendiere.</Vuoto> : (
            <div className="tabella">
              <table>
                <thead><tr><th>Nome</th><th>Mestiere</th><th className="cifra">Salario</th><th className="cifra">Credito</th></tr></thead>
                <tbody>
                  {k.faccendieri.map((f) => (
                    <tr key={f.id}>
                      <td><strong>{f.nome}</strong>{f.giocatore && <><br /><span className="minuto">regge {f.giocatore}</span></>}</td>
                      <td>{f.mestiere}</td>
                      <td className="cifra">{f.salario} fl</td>
                      <td className="cifra">{f.credito}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Foglio>
      </div>

      <div className="griglia g2">
        <Foglio titolo="Botteghe, banco, benefici">
          <div className="riga" style={{ alignItems: 'flex-end', marginBottom: '.8rem' }}>
            <Campo etichetta="Aprire un'impresa">
              <select defaultValue="" onChange={(e) => {
                const s = e.target.value as SortaImpresa
                if (!s) return
                const sc = SORTE_IMPRESA[s]
                void mutaCasato((x) => ({ ...x,
                  patrimonio: x.patrimonio - sc.fondo,
                  imprese: [...x.imprese, { id: nuovoId(), nome: sc.etichetta, sorta: s,
                    fondo: sc.fondo, depositi: 0, utileUltimoAnno: 0, chiLaGoverna: '' }] }))
                e.target.value = ''
              }}>
                <option value="">—</option>
                {(Object.keys(SORTE_IMPRESA) as SortaImpresa[]).map((s) => (
                  <option key={s} value={s}>{SORTE_IMPRESA[s].etichetta} — fondo {SORTE_IMPRESA[s].fondo} fl</option>
                ))}
              </select>
            </Campo>
          </div>
          {k.imprese.length === 0 ? <Vuoto>Nessuna impresa.</Vuoto> : (
            <div className="tabella">
              <table>
                <thead><tr><th>Impresa</th><th className="cifra">Fondo</th><th className="cifra">Utile dell&apos;anno</th></tr></thead>
                <tbody>
                  {k.imprese.map((i) => (
                    <tr key={i.id}>
                      <td>{i.nome}</td>
                      <td className="cifra">{i.fondo} fl</td>
                      <td className="cifra">
                        <input type="number" value={i.utileUltimoAnno} style={{ width: '6rem', textAlign: 'right' }}
                               onChange={(e) => void mutaCasato((x) => ({ ...x,
                                 imprese: x.imprese.map((y) => y.id === i.id
                                   ? { ...y, utileUltimoAnno: Number(e.target.value) } : y) }))} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Foglio>

        <Foglio titolo="La Preminenza" azione={
          <span className="pastiglia rossa">{preminenza?.totale ?? 0} punti</span>}>
          <p className="glossa">
            Il computo del fascicolo 15, aggiornato a oggi. A fine campagna la casa col punteggio
            maggiore è dichiarata Prima Casa della Tuscia.
          </p>
          {preminenza && preminenza.voci.length > 0 ? (
            <div className="tabella" style={{ marginTop: '.8rem' }}>
              <table>
                <tbody>
                  {preminenza.voci.map((v, i) => (
                    <tr key={`${v.nome}-${i}`}>
                      <td><span className="minuto">{v.gruppo}</span><br />{v.nome}</td>
                      <td className="cifra">{v.punti > 0 ? `+${v.punti}` : v.punti}</td>
                    </tr>
                  ))}
                  <tr className="totale"><td>Totale</td><td className="cifra">{preminenza.totale}</td></tr>
                </tbody>
              </table>
            </div>
          ) : <Vuoto>Nulla ancora da contare.</Vuoto>}
        </Foglio>
      </div>

      <Foglio titolo="Ricordanze">
        <textarea rows={6} value={k.ricordanze} placeholder="Ricordanza di me…"
                  onChange={(e) => void mutaCasato((x) => ({ ...x, ricordanze: e.target.value }))} />
      </Foglio>

      <div className="riga">
        <button type="button" onClick={() => {
          if (!confirm(`Cancellare il casato de' ${k.nome}?`)) return
          void muta((c) => ({ ...c, casati: c.casati.filter((y) => y.id !== k.id) }))
          vaiA(`/c/${campagna.id}`)
        }}>Cancellare il casato</button>
      </div>
    </>
  )
}
