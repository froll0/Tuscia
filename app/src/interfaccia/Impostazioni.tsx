import { useState } from 'react'
import { usaDati } from '../dati/contesto'
import { Campo, Foglio } from './comuni'
import { SQL_SCHEMA } from '../dati/schema'
import type { Esito } from '../dati/deposito'

export default function Impostazioni() {
  const { config, mutaConfig, deposito, ricarica, campagne } = usaDati()
  const [url, setUrl] = useState(config.sorta === 'supabase' ? config.url : '')
  const [pubblica, setPubblica] = useState(config.sorta === 'supabase' ? config.chiave : '')
  const [chiaveCampagna, setChiaveCampagna] = useState('')
  const [avviso, setAvviso] = useState<string | null>(null)
  const [esiti, setEsiti] = useState<Esito[] | null>(null)

  const urlBuono = /^https?:\/\/.+/.test(url.trim())

  function esporta() {
    const b = new Blob([JSON.stringify(campagne, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(b)
    a.download = `tuscia-campagne-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  return (
    <>
      <h1 style={{ marginBottom: '1.2rem' }}>Il deposito</h1>

      <Foglio titolo="Dove vivono le campagne">
        <p className="glossa">
          Non ci sono conti né parole d&apos;ordine. O i dati stanno in questo browser, o stanno in
          un progetto <strong>Supabase</strong> che aprite voi: là ogni campagna ha una
          <strong> chiave segreta</strong>, e chi la possiede legge e scrive. La chiave si dà a
          mano ai giocatori, come la chiave di casa.
        </p>
        <div className="riga" style={{ margin: '1rem 0 .4rem' }}>
          <button type="button" className={config.sorta === 'locale' ? 'primario' : ''}
                  onClick={() => mutaConfig({ sorta: 'locale' })}>Questo browser</button>
          <button type="button" className={config.sorta === 'supabase' ? 'primario' : ''}
                  disabled={!urlBuono || !pubblica.trim()}
                  onClick={() => mutaConfig({ sorta: 'supabase', url: url.trim(), chiave: pubblica.trim() })}>
            Supabase
          </button>
          <span className="pastiglia">in uso: {deposito.descrizione}</span>
        </div>
      </Foglio>

      <Foglio titolo="Il progetto Supabase" azione={<span className="pastiglia">tre passi</span>}>
        <ol style={{ margin: '0 0 1rem', paddingLeft: '1.2rem' }}>
          <li>Aprite un progetto gratuito su supabase.com.</li>
          <li>Nel <em>SQL Editor</em>, incollate ed eseguite il testo che trovate in fondo a questa pagina.</li>
          <li>In <em>Project Settings → API</em>, copiate qui sotto l&apos;URL del progetto e la chiave <code>anon</code>.</li>
        </ol>
        <div className="griglia g2">
          <Campo etichetta="URL del progetto">
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://xxxx.supabase.co" />
          </Campo>
          <Campo etichetta="Chiave pubblica (anon)" nota="è pubblica per disegno; la service_role non va mai messa qui">
            <input value={pubblica} onChange={(e) => setPubblica(e.target.value)} placeholder="eyJhbGci…" />
          </Campo>
        </div>
        {url && !urlBuono && <div className="avviso">L&apos;URL dev&apos;essere intero, da <code>https://</code>.</div>}
        {pubblica && !pubblica.trim().startsWith('ey') &&
          <div className="avviso">La chiave <code>anon</code> comincia di regola con <code>ey</code>.</div>}

        <div className="riga" style={{ marginTop: '.8rem' }}>
          <button type="button" className="primario" disabled={!urlBuono || !pubblica.trim()}
                  onClick={() => { setEsiti(null); mutaConfig({ sorta: 'supabase', url: url.trim(), chiave: pubblica.trim() }) }}>
            Adoperare questo progetto
          </button>
          {deposito.sorta === 'supabase' && (
            <button type="button" onClick={() => {
              void (async () => {
                try { setEsiti(await deposito.verifica?.() ?? null) }
                catch (e) { setEsiti([{ prova: 'Il progetto', bene: false,
                  dettaglio: e instanceof Error ? e.message : String(e) }]) }
              })()
            }}>Provare il collegamento</button>
          )}
        </div>

        {esiti && (
          <div className="tabella" style={{ marginTop: '1rem' }}>
            <table><tbody>
              {esiti.map((e) => (
                <tr key={e.prova}>
                  <td style={{ width: '1.6rem', color: e.bene ? 'var(--verde)' : 'var(--rubrica)' }}>
                    {e.bene ? '✓' : '✗'}
                  </td>
                  <td><strong>{e.prova}</strong></td>
                  <td>{e.dettaglio}</td>
                </tr>
              ))}
            </tbody></table>
          </div>
        )}
      </Foglio>

      {deposito.sorta === 'supabase' && (
        <Foglio titolo="Sedersi a un tavolo altrui">
          <p className="glossa">
            L&apos;Arbitro vi darà la chiave della sua campagna: la trova in capo alla pagina della
            campagna stessa. Incollatela qui.
          </p>
          <div className="riga" style={{ marginTop: '.7rem' }}>
            <input value={chiaveCampagna} onChange={(e) => setChiaveCampagna(e.target.value)}
                   placeholder="la chiave ricevuta" style={{ maxWidth: '26rem' }} />
            <button type="button" className="primario" disabled={!chiaveCampagna.trim()} onClick={() => {
              void (async () => {
                try {
                  const c = await deposito.entraConChiave?.(chiaveCampagna)
                  await ricarica()
                  setAvviso(c ? `Siete entrato in «${c.nome}»: la trovate nell’elenco delle campagne.` : null)
                  setChiaveCampagna('')
                } catch (e) { setAvviso(e instanceof Error ? e.message : String(e)) }
              })()
            }}>Entrare</button>
          </div>
          {avviso && <div className="avviso lieto">{avviso}</div>}
        </Foglio>
      )}

      <Foglio titolo="Il testo SQL da eseguire una volta">
        <pre style={{ background: 'var(--carta-2)', border: '1px solid var(--riga)', padding: '.8rem',
                      overflowX: 'auto', fontSize: '.78rem', lineHeight: 1.5 }}>{SQL_SCHEMA}</pre>
        <button type="button" onClick={() => void navigator.clipboard?.writeText(SQL_SCHEMA)}>
          Copiare il testo
        </button>
      </Foglio>

      <Foglio titolo="Copia di sicurezza">
        <p className="glossa">Le campagne si esportano in un file, che si conserva o si passa ad altri.</p>
        <button type="button" onClick={esporta} disabled={campagne.length === 0}>Esportare tutto</button>
      </Foglio>
    </>
  )
}
