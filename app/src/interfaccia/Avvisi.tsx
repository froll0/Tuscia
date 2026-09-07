import { Link } from 'react-router-dom'
import { usaDati } from '../dati/contesto'

/** Guasti del deposito e condizioni che impediscono di scrivere, in capo alla pagina. */
export default function Avvisi() {
  const { errore, scordaErrore, deposito, utente, caricando } = usaDati()
  const fuori = deposito.sorta === 'supabase' && !utente && !caricando

  if (!errore && !fuori) return null

  return (
    <div style={{ marginBottom: '1.2rem' }}>
      {fuori && (
        <div className="avviso">
          <strong>Non siete entrato nel progetto Supabase.</strong> Finché non entrate, nulla si
          può leggere né scrivere: la base di dati rifiuta le righe senza proprietario.{' '}
          <Link to="/impostazioni">Andate al Deposito</Link> e fatevi mandare il collegamento
          per posta elettronica.
        </div>
      )}
      {errore && (
        <div className="avviso">
          <div className="riga riga-sparsa" style={{ alignItems: 'flex-start' }}>
            <span className="crescente"><strong>Il deposito ha rifiutato l&apos;operazione.</strong> {errore}</span>
            <button className="minuto" type="button" onClick={scordaErrore}>Va bene</button>
          </div>
        </div>
      )}
    </div>
  )
}
