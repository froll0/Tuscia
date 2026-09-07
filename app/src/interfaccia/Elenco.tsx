import { Link } from 'react-router-dom'
import { usaDati } from '../dati/contesto'
import { Foglio, Vuoto } from './comuni'
import { EPOCHE } from '../regole/tavole'

export default function Elenco() {
  const { campagne, caricando, errore, deposito, cancella } = usaDati()

  return (
    <>
      <div className="riga riga-sparsa" style={{ marginBottom: '1.2rem' }}>
        <h1>Le campagne</h1>
        <Link to="/nuova"><button className="primario" type="button">Nuova campagna</button></Link>
      </div>

      <p className="glossa">
        Deposito in uso: <strong>{deposito.descrizione}</strong>
        {deposito.sorta === 'locale' && ' — i dati restano in questo browser. Per giocare in più persone, si configuri Supabase nella pagina Deposito.'}
      </p>

      {errore && <div className="avviso">Il deposito ha risposto: {errore}</div>}
      {caricando && <Vuoto>Si aprono i registri…</Vuoto>}

      {!caricando && campagne.length === 0 && (
        <Foglio>
          <Vuoto>
            Nessuna campagna. L&apos;Arbitro ne apra una: sceglierà l&apos;epoca, la città e
            l&apos;anno, e i giocatori vi porteranno i loro casati.
          </Vuoto>
        </Foglio>
      )}

      <div className="elenco-schede">
        {campagne.map((c) => (
          <div key={c.id} className="scheda-breve">
            <Link to={`/c/${c.id}`}>
              <h2>{c.nome}</h2>
              <p className="minuto">
                {EPOCHE[c.epoca]?.etichetta} · {c.cittaPrincipale}
              </p>
              <p className="glossa">
                {c.stagione} {c.anno} · {c.casati.length} {c.casati.length === 1 ? 'casato' : 'casati'}
              </p>
            </Link>
            <div className="riga" style={{ marginTop: '.6rem' }}>
              <button className="minuto" type="button" onClick={() => {
                if (confirm(`Cancellare «${c.nome}»? Non si torna indietro.`)) void cancella(c.id)
              }}>Cancella</button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
