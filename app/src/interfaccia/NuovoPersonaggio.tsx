import { useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { usaCampagna, usaMutaCampagna } from '../dati/contesto'
import { Campo, Foglio, Misura, Scaletta, Vuoto } from './comuni'
import { GRUPPI_ARTI, ETICHETTE_QUALITA } from '../regole/tavole'
import { contoPersonaggio, modificatoriEta, qualitaVuote, applicaModificatoriEta } from '../regole/creazione'
import { corpoDi, tenutaDi, guardiaDi } from '../regole/casa'
import { congiuntoNuovo, faccendiereNuovo } from '../modello/fabbrica'
import { QUALITA, RETI } from '../modello/tipi'
import type { Arti, NomeQualita, PostoInCasa, Qualita, Rete } from '../modello/tipi'

const POSTI: PostoInCasa[] = ['capo', 'consorte', 'fratello', 'rampollo', 'cadetto', 'figlia',
  'vedova-reggente', 'maritata-fuori', 'zio', 'cugino', 'bastardo']
const MESTIERI = ['notaio', 'procuratore in causa', 'fattore di villa', 'sensale',
  'banchiere di secondo rango', 'prete o cappellano di casa', 'medico o speziale',
  'oste o vinattiere', 'caporale di bravi', 'segretario e cifrista',
  'cortigiana onesta o maestro di casa', 'mercante viandante']
const ETICHETTE_RETI: Record<Rete, string> = {
  palazzo: 'Palazzo', mercato: 'Mercato', chiesa: 'Chiesa',
  contado: 'Contado', malavita: 'Malavita', fuori: 'Fuori di Toscana',
}

export default function NuovoPersonaggio() {
  const { id, kid } = useParams()
  const [cerca] = useSearchParams()
  const campagna = usaCampagna(id)
  const muta = usaMutaCampagna(id)
  const vaiA = useNavigate()
  const eFaccendiere = cerca.get('sorta') === 'faccendiere'

  const [nome, setNome] = useState('')
  const [patronimico, setPatronimico] = useState('')
  const [eta, setEta] = useState(30)
  const [sesso, setSesso] = useState<'m' | 'f'>('m')
  const [posto, setPosto] = useState<PostoInCasa>('capo')
  const [mestiere, setMestiere] = useState(MESTIERI[0]!)
  const [salario, setSalario] = useState(45)
  const [giocatore, setGiocatore] = useState('')
  const [pregio, setPregio] = useState('')
  const [difetto, setDifetto] = useState('')
  const [qualita, setQualita] = useState<Qualita>(qualitaVuote())
  const [arti, setArti] = useState<Arti>({})
  const [reti, setReti] = useState<Record<Rete, number>>(
    () => RETI.reduce((o, r) => { o[r] = 0; return o }, {} as Record<Rete, number>))

  const conto = useMemo(() => contoPersonaggio(qualita, arti, eta), [qualita, arti, eta])
  const mod = modificatoriEta(eta)
  const puntiReti = RETI.reduce((t, r) => t + reti[r], 0)
  const finale = applicaModificatoriEta(qualita, eta)

  if (!campagna) return <Vuoto>Campagna non trovata.</Vuoto>
  const casato = campagna.casati.find((k) => k.id === kid)
  if (!casato) return <Vuoto>Casato non trovato.</Vuoto>

  const artiPulite = Object.fromEntries(Object.entries(arti).filter(([, v]) => v > 0))

  async function crea() {
    if (eFaccendiere) {
      const f = faccendiereNuovo(nome.trim())
      Object.assign(f, {
        eta, mestiere, salario, qualita: finale, arti: artiPulite, reti,
        pregio, difetto, patronoId: casato!.id, giocatore: giocatore.trim() || null,
      })
      await muta((c) => ({ ...c, casati: c.casati.map((k) =>
        k.id === casato!.id ? { ...k, faccendieri: [...k.faccendieri, f] } : k) }))
    } else {
      const p = congiuntoNuovo(nome.trim(), finale)
      Object.assign(p, {
        patronimico, eta, sesso, posto, arti: artiPulite, pregio, difetto,
        giocatore: giocatore.trim() || null, dove: casato!.citta,
      })
      await muta((c) => ({ ...c, casati: c.casati.map((k) =>
        k.id === casato!.id ? { ...k, congiunti: [...k.congiunti, p] } : k) }))
    }
    vaiA(`/c/${campagna!.id}/casato/${casato!.id}`)
  }

  return (
    <>
      <h1 style={{ marginBottom: '.4rem' }}>
        {eFaccendiere ? 'Assoldare un faccendiere' : 'Un congiunto della casa'}
      </h1>
      <p className="glossa" style={{ marginBottom: '1.2rem' }}>per il casato de&apos; {casato.nome}</p>

      <Foglio titolo="Chi è">
        <div className="griglia g2">
          <Campo etichetta="Nome"><input value={nome} onChange={(e) => setNome(e.target.value)} /></Campo>
          {!eFaccendiere && (
            <Campo etichetta="Patronimico" nota="di Antonio di Piero">
              <input value={patronimico} onChange={(e) => setPatronimico(e.target.value)} />
            </Campo>
          )}
          <Campo etichetta="Età" nota={`${mod.etichetta}: Arti ${mod.artiExtra >= 0 ? '+' : ''}${mod.artiExtra}${mod.vigore ? `, Vigore ${mod.vigore}, Destrezza ${mod.destrezza}` : ''}`}>
            <input type="number" min={16} max={90} value={eta} onChange={(e) => setEta(Number(e.target.value))} />
          </Campo>
          <Campo etichetta="Chi lo interpreta">
            <input value={giocatore} onChange={(e) => setGiocatore(e.target.value)} />
          </Campo>
          {eFaccendiere ? (
            <>
              <Campo etichetta="Mestiere di copertura" nota="dà +1 a due Arti coerenti con esso">
                <select value={mestiere} onChange={(e) => setMestiere(e.target.value)}>
                  {MESTIERI.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </Campo>
              <Campo etichetta="Salario annuo in fiorini">
                <input type="number" min={0} value={salario} onChange={(e) => setSalario(Number(e.target.value))} />
              </Campo>
            </>
          ) : (
            <>
              <Campo etichetta="Posto nella casa">
                <select value={posto} onChange={(e) => setPosto(e.target.value as PostoInCasa)}>
                  {POSTI.map((p) => <option key={p} value={p}>{p.replace('-', ' ')}</option>)}
                </select>
              </Campo>
              <Campo etichetta="Sesso">
                <select value={sesso} onChange={(e) => setSesso(e.target.value as 'm' | 'f')}>
                  <option value="m">uomo</option><option value="f">donna</option>
                </select>
              </Campo>
            </>
          )}
          <Campo etichetta="Pregio"><input value={pregio} onChange={(e) => setPregio(e.target.value)}
            placeholder="Memoria ferrea" /></Campo>
          <Campo etichetta="Difetto"><input value={difetto} onChange={(e) => setDifetto(e.target.value)}
            placeholder="Collera" /></Campo>
        </div>
      </Foglio>

      <Foglio titolo="Qualità" azione={
        <span className={`pastiglia ${conto.puntiQualitaUsati > conto.puntiQualitaDisponibili ? 'rossa' : 'verde'}`}>
          {conto.puntiQualitaUsati} di {conto.puntiQualitaDisponibili}
        </span>}>
        <p className="glossa">Tutte partono da 2. Alla creazione nessuna supera 4.</p>
        <div className="griglia g3" style={{ marginTop: '.8rem' }}>
          {QUALITA.map((q: NomeQualita) => (
            <div key={q} className="misura">
              <span className="etichetta">{ETICHETTE_QUALITA[q]}</span>
              <Scaletta valore={qualita[q]} min={1} max={4}
                        muta={(n) => setQualita((v) => ({ ...v, [q]: n }))} />
              {finale[q] !== qualita[q] && (
                <span className="glossa">con l&apos;età: {finale[q]}</span>
              )}
            </div>
          ))}
        </div>
      </Foglio>

      <Foglio titolo="Arti" azione={
        <span className={`pastiglia ${conto.puntiArtiUsati > conto.puntiArtiDisponibili ? 'rossa' : 'verde'}`}>
          {conto.puntiArtiUsati} di {conto.puntiArtiDisponibili}
        </span>}>
        <p className="glossa">Da 0 a 5; alla creazione nessuna supera 3. Zero significa ignoranza, non incapacità: si tenta con −2.</p>
        {GRUPPI_ARTI.map((g) => (
          <div key={g.gruppo} style={{ marginTop: '1rem' }}>
            <h3>{g.gruppo}</h3>
            <div className="griglia g3" style={{ marginTop: '.5rem' }}>
              {g.arti.map((a) => (
                <div key={a} className="riga riga-sparsa"
                     style={{ border: '1px solid var(--riga)', padding: '.35rem .6rem' }}>
                  <span style={{ fontSize: '.9rem' }}>{a}</span>
                  <Scaletta valore={arti[a] ?? 0} min={0} max={3}
                            muta={(n) => setArti((v) => ({ ...v, [a]: n }))} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </Foglio>

      {eFaccendiere && (
        <Foglio titolo="Reti" azione={
          <span className={`pastiglia ${puntiReti > 4 ? 'rossa' : 'verde'}`}>{puntiReti} di 4</span>}>
          <p className="glossa">Sei ambienti, da 0 a 3; alla creazione il massimo è 2. Una chiamata per stagione e per Rete.</p>
          <div className="griglia g3" style={{ marginTop: '.8rem' }}>
            {RETI.map((r) => (
              <div key={r} className="misura">
                <span className="etichetta">{ETICHETTE_RETI[r]}</span>
                <Scaletta valore={reti[r]} min={0} max={2}
                          muta={(n) => setReti((v) => ({ ...v, [r]: n }))} />
              </div>
            ))}
          </div>
        </Foglio>
      )}

      <Foglio titolo="Valori derivati">
        <div className="griglia g3">
          <Misura etichetta="Corpo" valore={corpoDi({ qualita: finale })} glossa="3 + Vigore: Ferite sopportabili" />
          <Misura etichetta="Tenuta" valore={tenutaDi({ qualita: finale })} glossa="6 + Animo: resistere a lusinghe e minacce" />
          <Misura etichetta="Guardia" valore={guardiaDi({ qualita: finale, arti: artiPulite })}
                  glossa="6 + Ingegno + Informazione + misure" />
          <Misura etichetta="Fortuna" valore={3} glossa="si rifà a ogni stagione" />
        </div>
      </Foglio>

      {conto.errori.map((e) => <div key={e} className="avviso">{e}</div>)}
      {conto.avvisi.map((a) => <div key={a} className="avviso lieto">{a}</div>)}
      {puntiReti > 4 && <div className="avviso">Punti di Rete in eccesso: {puntiReti} su 4.</div>}

      <div className="riga">
        <button className="primario" type="button" onClick={() => void crea()}
                disabled={!nome.trim() || conto.errori.length > 0 || (eFaccendiere && puntiReti > 4)}>
          {eFaccendiere ? 'Assoldarlo' : 'Metterlo in famiglia'}
        </button>
        <button type="button" onClick={() => vaiA(`/c/${campagna.id}/casato/${casato.id}`)}>Lasciar stare</button>
      </div>
    </>
  )
}
