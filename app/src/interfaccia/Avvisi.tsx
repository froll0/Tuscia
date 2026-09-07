import { usaDati } from '../dati/contesto'

/** I guasti del deposito, in capo alla pagina invece che nella consolle. */
export default function Avvisi() {
  const { errore, scordaErrore } = usaDati()
  if (!errore) return null
  return (
    <div className="avviso" style={{ marginBottom: '1.2rem' }}>
      <div className="riga riga-sparsa" style={{ alignItems: 'flex-start' }}>
        <span className="crescente"><strong>Il deposito ha rifiutato l&apos;operazione.</strong> {errore}</span>
        <button className="minuto" type="button" onClick={scordaErrore}>Va bene</button>
      </div>
    </div>
  )
}
