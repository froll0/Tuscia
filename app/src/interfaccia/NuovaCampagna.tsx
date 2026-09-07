import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { usaDati } from '../dati/contesto'
import { campagnaNuova } from '../modello/fabbrica'
import { EPOCHE, CITTA } from '../regole/tavole'
import { Campo, Foglio } from './comuni'
import type { Epoca } from '../modello/tipi'

export default function NuovaCampagna() {
  const { salva } = usaDati()
  const vaiA = useNavigate()
  const [nome, setNome] = useState('')
  const [epoca, setEpoca] = useState<Epoca>('bilancia')
  const [citta, setCitta] = useState('Firenze')
  const [arbitro, setArbitro] = useState('')
  const [lavoro, setLavoro] = useState(false)

  const e = EPOCHE[epoca]!

  async function apri() {
    if (!nome.trim()) return
    setLavoro(true)
    const c = campagnaNuova(nome.trim(), epoca, citta, arbitro.trim() || 'Arbitro')
    await salva(c)
    vaiA(`/c/${c.id}`)
  }

  return (
    <>
      <h1 style={{ marginBottom: '1.2rem' }}>Aprire una campagna</h1>

      <Foglio titolo="Il tavolo">
        <div className="griglia g2">
          <Campo etichetta="Nome della campagna">
            <input value={nome} onChange={(ev) => setNome(ev.target.value)}
                   placeholder="Le case di Val d'Elsa" />
          </Campo>
          <Campo etichetta="Chi arbitra">
            <input value={arbitro} onChange={(ev) => setArbitro(ev.target.value)} placeholder="Nome dell'Arbitro" />
          </Campo>
        </div>
      </Foglio>

      <Foglio titolo="L'epoca">
        <div className="griglia g3">
          {(Object.keys(EPOCHE) as Epoca[]).map((k) => {
            const ep = EPOCHE[k]!
            return (
              <label key={k} className="misura" style={{ cursor: 'pointer',
                borderColor: epoca === k ? 'var(--rubrica)' : undefined }}>
                <span className="riga">
                  <input type="radio" name="epoca" checked={epoca === k} style={{ width: 'auto' }}
                         onChange={() => setEpoca(k)} />
                  <span className="etichetta">{ep.dal}–{ep.al}</span>
                </span>
                <span className="valore" style={{ fontSize: '1.05rem' }}>{ep.etichetta}</span>
                <span className="glossa">{ep.glossa}</span>
              </label>
            )
          })}
        </div>
        <p className="glossa" style={{ marginTop: '.8rem' }}>
          Si comincerà nell&apos;anno <strong>{e.consigliato}</strong>, in primavera. La cronologia
          ragionata del fascicolo 02 dice che cosa accade in ciascun anno e come servirsene.
        </p>
      </Foglio>

      <Foglio titolo="La città">
        <div className="griglia g2">
          <Campo etichetta="Città principale" nota="dove si tiene il reggimento">
            <select value={citta} onChange={(ev) => setCitta(ev.target.value)}>
              {CITTA.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Campo>
        </div>
      </Foglio>

      <div className="riga">
        <button className="primario" type="button" onClick={() => void apri()}
                disabled={!nome.trim() || lavoro}>Aprire la campagna</button>
        <button type="button" onClick={() => vaiA('/')}>Lasciar stare</button>
      </div>
    </>
  )
}
