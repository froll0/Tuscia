import { useState } from 'react'
import { usaDati } from '../dati/contesto'
import { Campo, Foglio } from './comuni'
import { SQL_SCHEMA } from '../dati/schema'
import type { Esito } from '../dati/deposito'

export default function Impostazioni() {
  const { config, mutaConfig, deposito, utente, ricarica, errore, campagne } = usaDati()
  const [url, setUrl] = useState(config.sorta === 'supabase' ? config.url : '')
  const [chiave, setChiave] = useState(config.sorta === 'supabase' ? config.chiave : '')
  const [email, setEmail] = useState('')
  const [avviso, setAvviso] = useState<string | null>(null)
  const [codice, setCodice] = useState('')
  const [esiti, setEsiti] = useState<Esito[] | null>(null)
  const [provando, setProvando] = useState(false)

  async function accedi() {
    if (!deposito.entra) return
    try { await deposito.entra(email.trim()); setAvviso('Vi è stata mandata una lettera con il collegamento per entrare.') }
    catch (e) { setAvviso(e instanceof Error ? e.message : String(e)) }
  }

  function esporta() {
    const testo = JSON.stringify(campagne, null, 2)
    const b = new Blob([testo], { type: 'application/json' })
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
          Questo programma è un sito statico: non possiede un server proprio. I dati stanno o in
          questo browser, o in un progetto <strong>Supabase</strong> che il tavolo apre per sé.
          Le chiavi qui sotto restano in questo browser e non sono mai spedite altrove.
        </p>
        <div className="riga" style={{ margin: '.9rem 0' }}>
          <button type="button" className={config.sorta === 'locale' ? 'primario' : ''}
                  onClick={() => mutaConfig({ sorta: 'locale' })}>Questo browser</button>
          <button type="button" className={config.sorta === 'supabase' ? 'primario' : ''}
                  onClick={() => url && chiave && mutaConfig({ sorta: 'supabase', url, chiave })}
                  disabled={!url || !chiave}>Supabase</button>
          <span className="pastiglia">{deposito.descrizione}</span>
        </div>
        {errore && <div className="avviso">Il deposito ha risposto: {errore}</div>}
      </Foglio>

      <Foglio titolo="Il progetto Supabase">
        <div className="griglia g2">
          <Campo etichetta="URL del progetto" nota="Impostazioni → API → Project URL">
            <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://xxxx.supabase.co" />
          </Campo>
          <Campo etichetta="Chiave pubblica (anon)" nota="è pubblica per disegno: le righe le protegge la RLS">
            <input value={chiave} onChange={(e) => setChiave(e.target.value)} placeholder="eyJhbGci…" />
          </Campo>
        </div>
        {url && !/^https?:\/\/.+/.test(url.trim()) && (
          <div className="avviso">L&apos;URL dev&apos;essere intero, cominciando da <code>https://</code>.</div>
        )}
        {chiave && !chiave.trim().startsWith('ey') && (
          <div className="avviso">La chiave <code>anon</code> comincia di regola con <code>ey</code>: controllate d&apos;aver copiato quella giusta, e non la <code>service_role</code>, che non va mai messa in un sito.</div>
        )}
        <div className="riga" style={{ marginTop: '.8rem' }}>
          <button type="button" className="primario"
                  disabled={!url.trim() || !chiave.trim() || !/^https?:\/\/.+/.test(url.trim())}
                  onClick={() => { setEsiti(null); mutaConfig({ sorta: 'supabase', url: url.trim(), chiave: chiave.trim() }) }}>
            Adoperare questo progetto
          </button>
          {deposito.sorta === 'supabase' && (
            <button type="button" disabled={provando} onClick={() => {
              void (async () => {
                setProvando(true)
                try { setEsiti(await deposito.verifica?.() ?? null) }
                catch (e) { setEsiti([{ prova: 'Collegamento', bene: false,
                  dettaglio: e instanceof Error ? e.message : String(e) }]) }
                finally { setProvando(false) }
              })()
            }}>{provando ? 'Si prova…' : 'Provare il collegamento'}</button>
          )}
        </div>

        {esiti && (
          <div className="tabella" style={{ marginTop: '1rem' }}>
            <table>
              <tbody>
                {esiti.map((e) => (
                  <tr key={e.prova}>
                    <td style={{ width: '1.6rem', color: e.bene ? 'var(--verde)' : 'var(--rubrica)' }}>
                      {e.bene ? '✓' : '✗'}
                    </td>
                    <td><strong>{e.prova}</strong></td>
                    <td>{e.dettaglio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {deposito.sorta === 'supabase' && (
          <div style={{ marginTop: '1.2rem' }}>
            <h3>Chi siete</h3>
            {utente
              ? <p className="riga">Siete entrato come <strong>{utente}</strong>.
                  <button type="button" className="minuto" onClick={() => { void deposito.esci?.(); void ricarica() }}>Uscire</button>
                </p>
              : (
                <div className="riga" style={{ marginTop: '.5rem' }}>
                  <input value={email} onChange={(e) => setEmail(e.target.value)}
                         placeholder="la vostra posta elettronica" style={{ maxWidth: '20rem' }} />
                  <button type="button" onClick={() => void accedi()} disabled={!email.includes('@')}>
                    Mandami il collegamento
                  </button>
                </div>
              )}
            {avviso && <div className="avviso lieto">{avviso}</div>}
          </div>
        )}
      </Foglio>

      {deposito.sorta === 'supabase' && utente && (
        <Foglio titolo="Sedersi a un tavolo altrui">
          <p className="glossa">
            L&apos;Arbitro trova il codice d&apos;invito in capo alla pagina della sua campagna.
          </p>
          <div className="riga" style={{ marginTop: '.7rem' }}>
            <input value={codice} onChange={(e) => setCodice(e.target.value)}
                   placeholder="a1b2c3d4" style={{ maxWidth: '14rem' }} />
            <button type="button" disabled={!codice.trim()} onClick={() => {
              void (async () => {
                try {
                  await deposito.entraConCodice?.(codice)
                  await ricarica()
                  setAvviso('Siete entrato nella campagna: la troverete nell’elenco.')
                  setCodice('')
                } catch (e) { setAvviso(e instanceof Error ? e.message : String(e)) }
              })()
            }}>Entrare con questo codice</button>
          </div>
        </Foglio>
      )}

      <Foglio titolo="Le tavole da creare nel progetto">
        <p className="glossa">
          Si apra il progetto Supabase, si vada in <em>SQL Editor</em> e si esegua una volta
          questo testo. Crea le tavole, i permessi per riga e il codice d&apos;invito.
        </p>
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
