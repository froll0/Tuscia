import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { usaCampagna, usaMutaCampagna } from '../dati/contesto'
import { Campo, Foglio, Misura, Scaletta, Vuoto, fiorini } from './comuni'
import { CETI, RADICI, MACCHIE, SORTE_TERRA, VALORE_PATRIMONIO, RENDITA_PER_PUNTO, TENORI } from '../regole/tavole'
import { contoPuntiDiCasa } from '../regole/creazione'
import type { SceltaCasato } from '../regole/creazione'
import { casatoNuovo, nuovoId } from '../modello/fabbrica'
import { terraNuova } from '../regole/terre'
import type { Ceto, SortaTerra, Terra, Tenore } from '../modello/tipi'

const SORTE_COMPRABILI = (Object.keys(SORTE_TERRA) as SortaTerra[])
  .filter((s) => SORTE_TERRA[s].prezzo !== null)

export default function NuovoCasato() {
  const { id } = useParams()
  const campagna = usaCampagna(id)
  const muta = usaMutaCampagna(id)
  const vaiA = useNavigate()

  const [nome, setNome] = useState('')
  const [arme, setArme] = useState('')
  const [motto, setMotto] = useState('')
  const [ceto, setCeto] = useState<Ceto>('popolani-grassi')
  const [dal, setDal] = useState('')
  const [radice, setRadice] = useState(RADICI[0]!.nome)
  const [tenore, setTenore] = useState<Tenore>('onorevole')
  const [giocatori, setGiocatori] = useState('')
  const [s, setS] = useState<SceltaCasato>({
    gradoPatrimonio: 2, puntiInTerre: 4, seguito: 2, onore: 4, gradoArmi: 0,
    congiuntiOltre: 0, figliOltre: 0, magnificenza: 0, amici: 0, polizze: 0,
    beneficiPc: 0, macchie: [],
  })
  const [terre, setTerre] = useState<Terra[]>([])
  const [sorta, setSorta] = useState<SortaTerra>('podere')
  const [nomeTerra, setNomeTerra] = useState('')
  const [luogoTerra, setLuogoTerra] = useState('')

  const conto = useMemo(() => contoPuntiDiCasa(s), [s])
  const renditaSpesa = terre.reduce((t, x) => t + x.renditaBase, 0)
  const budget = s.puntiInTerre * RENDITA_PER_PUNTO
  const sfora = renditaSpesa > budget

  if (!campagna) return <Vuoto>Campagna non trovata.</Vuoto>

  const set = <K extends keyof SceltaCasato>(k: K, v: SceltaCasato[K]) => setS((x) => ({ ...x, [k]: v }))

  function aggiungiTerra() {
    if (!nomeTerra.trim()) return
    setTerre((v) => [...v, terraNuova(sorta, nomeTerra.trim(), luogoTerra.trim(), nuovoId())])
    setNomeTerra(''); setLuogoTerra('')
  }

  async function fonda() {
    const k = casatoNuovo(nome.trim(), campagna!.cittaPrincipale)
    k.arme = arme; k.motto = motto; k.ceto = ceto; k.inCittaDal = dal; k.radice = radice
    k.tenore = tenore
    k.patrimonio = VALORE_PATRIMONIO[s.gradoPatrimonio] ?? 0
    k.onore = s.onore; k.gradoArmi = s.gradoArmi; k.magnificenza = s.magnificenza
    k.terre = terre
    k.macchie = s.macchie
    k.giocatori = giocatori.split(',').map((x) => x.trim()).filter(Boolean)
    k.seguiti = [{ citta: campagna!.cittaPrincipale, valore: s.seguito, polizze: s.polizze,
                   posizione: s.seguito >= 5 ? 'reggimento' : 'aderenti', divieto: 0,
                   aSpecchio: s.macchie.includes('A specchio') }]
    if (s.macchie.includes('Debito')) {
      k.debiti = [{ id: nuovoId(), verso: 'un banco della città', quanto: 1000, interesse: 0.08, scadenza: '—' }]
    }
    if (s.macchie.includes('Infamia')) k.onore = Math.max(0, k.onore - 2)
    await muta((c) => ({ ...c, casati: [...c.casati, k] }))
    vaiA(`/c/${campagna!.id}/casato/${k.id}`)
  }

  return (
    <>
      <h1 style={{ marginBottom: '1.2rem' }}>Fondare un casato</h1>

      <Foglio titolo="Nome, arme, radice">
        <div className="griglia g2">
          <Campo etichetta="Casato"><input value={nome} onChange={(e) => setNome(e.target.value)}
            placeholder="Bencivenni, Malavolti, da Poggibonsi…" /></Campo>
          <Campo etichetta="Arme" nota="descritta secondo il blasone"><input value={arme}
            onChange={(e) => setArme(e.target.value)} placeholder="Di rosso, alla banda d'oro" /></Campo>
          <Campo etichetta="Motto"><input value={motto} onChange={(e) => setMotto(e.target.value)}
            placeholder="Chi dura vince" /></Campo>
          <Campo etichetta="In città dal"><input value={dal} onChange={(e) => setDal(e.target.value)}
            placeholder="1347" /></Campo>
          <Campo etichetta="Chi lo regge" nota="più nomi separati da virgola"><input value={giocatori}
            onChange={(e) => setGiocatori(e.target.value)} /></Campo>
          <Campo etichetta="Tenore di casa" nota={`${TENORI[tenore].spesaAnnua} fl l'anno; Onore fino a ${TENORI[tenore].onoreMax}`}>
            <select value={tenore} onChange={(e) => setTenore(e.target.value as Tenore)}>
              {(Object.keys(TENORI) as Tenore[]).map((t) =>
                <option key={t} value={t}>{TENORI[t].etichetta} — {TENORI[t].spesaAnnua} fl</option>)}
            </select>
          </Campo>
        </div>

        <div className="griglia g2" style={{ marginTop: '1rem' }}>
          <Campo etichetta="Ceto e condizione">
            <select value={ceto} onChange={(e) => setCeto(e.target.value as Ceto)}>
              {(Object.keys(CETI) as Ceto[]).map((c) => <option key={c} value={c}>{CETI[c].etichetta}</option>)}
            </select>
          </Campo>
          <Campo etichetta="Radice della ricchezza">
            <select value={radice} onChange={(e) => setRadice(e.target.value)}>
              {RADICI.map((r) => <option key={r.nome} value={r.nome}>{r.nome}</option>)}
            </select>
          </Campo>
        </div>
        <p className="glossa" style={{ marginTop: '.6rem' }}>{CETI[ceto].effetto}</p>
        <p className="glossa">{RADICI.find((r) => r.nome === radice)?.dote}</p>
      </Foglio>

      <Foglio titolo="I Punti di Casa" azione={
        <span className={`pastiglia ${conto.restanti < 0 ? 'rossa' : 'verde'}`}>
          {conto.restanti} di {conto.disponibili} da spendere
        </span>}>
        <div className="griglia g3">
          <div className="misura">
            <span className="etichetta">Patrimonio — {fiorini(conto.patrimonioFiorini)}</span>
            <Scaletta valore={s.gradoPatrimonio} min={0} max={5} muta={(n) => set('gradoPatrimonio', n)} />
            <span className="glossa">3 punti per grado</span>
          </div>
          <div className="misura">
            <span className="etichetta">Terre — {fiorini(budget)} di rendita</span>
            <Scaletta valore={s.puntiInTerre} min={0} max={12} muta={(n) => set('puntiInTerre', n)} />
            <span className="glossa">1 punto = 60 fl l&apos;anno</span>
          </div>
          <div className="misura">
            <span className="etichetta">Seguito</span>
            <Scaletta valore={s.seguito} min={0} max={5} muta={(n) => set('seguito', n)} />
            <span className="glossa">2 punti per grado; mai oltre l&apos;Onore + 2</span>
          </div>
          <div className="misura">
            <span className="etichetta">Onore</span>
            <Scaletta valore={s.onore} min={0} max={6} muta={(n) => set('onore', n)} />
            <span className="glossa">parte da 2 senza spesa</span>
          </div>
          <div className="misura">
            <span className="etichetta">Armi</span>
            <Scaletta valore={s.gradoArmi} min={0} max={5} muta={(n) => set('gradoArmi', n)} />
            <span className="glossa">3 punti per grado, e si mantengono ogni stagione</span>
          </div>
          <div className="misura">
            <span className="etichetta">Magnificenza</span>
            <Scaletta valore={s.magnificenza} min={0} max={3} muta={(n) => set('magnificenza', n)} />
            <span className="glossa">2 punti per grado</span>
          </div>
          <div className="misura">
            <span className="etichetta">Congiunti adulti oltre i gratuiti</span>
            <Scaletta valore={s.congiuntiOltre} min={0} max={6} muta={(n) => set('congiuntiOltre', n)} />
            <span className="glossa">capo, consorte, due figli e un adulto sono gratuiti</span>
          </div>
          <div className="misura">
            <span className="etichetta">Polizze già imborsate</span>
            <Scaletta valore={s.polizze} min={0} max={5} muta={(n) => set('polizze', n)} />
            <span className="glossa">2 punti l&apos;una</span>
          </div>
          <div className="misura">
            <span className="etichetta">Amici e clienti</span>
            <Scaletta valore={s.amici} min={0} max={6} muta={(n) => set('amici', n)} />
            <span className="glossa">1 punto l&apos;uno</span>
          </div>
        </div>

        <h3 style={{ marginTop: '1.2rem' }}>Il conto</h3>
        <div className="tabella">
          <table>
            <tbody>
              {conto.voci.map((v) => (
                <tr key={v.nome}><td>{v.nome}</td><td className="minuto">{v.nota}</td>
                  <td className="cifra">{v.punti}</td></tr>
              ))}
              <tr className="totale"><td>Spesi</td><td /><td className="cifra">{conto.spesi}</td></tr>
              <tr><td>Resi dalle Macchie</td><td /><td className="cifra">+{conto.guadagnati}</td></tr>
              <tr className="totale"><td>Restano</td><td /><td className="cifra">{conto.restanti}</td></tr>
            </tbody>
          </table>
        </div>
        {conto.errori.map((e) => <div key={e} className="avviso">{e}</div>)}
      </Foglio>

      <Foglio titolo="Macchie e pesi" azione={<span className="pastiglia">fino a 8 punti</span>}>
        <p className="glossa">Si può prendere zavorra in cambio di punti. L&apos;Arbitro se ne servirà.</p>
        <div className="griglia g2" style={{ marginTop: '.8rem' }}>
          {MACCHIE.map((m) => (
            <label key={m.nome} className="riga" style={{ alignItems: 'flex-start', gap: '.5rem' }}>
              <input type="checkbox" style={{ width: 'auto', marginTop: '.35rem' }}
                     checked={s.macchie.includes(m.nome)}
                     onChange={(e) => set('macchie', e.target.checked
                       ? [...s.macchie, m.nome] : s.macchie.filter((x) => x !== m.nome))} />
              <span>
                <strong>{m.nome}</strong> <span className="pastiglia">+{m.pc}</span>
                <br /><span className="glossa">{m.effetto}</span>
              </span>
            </label>
          ))}
        </div>
      </Foglio>

      <Foglio titolo="Le terre" azione={
        <span className={`pastiglia ${sfora ? 'rossa' : 'verde'}`}>
          {fiorini(renditaSpesa)} su {fiorini(budget)}
        </span>}>
        <div className="riga" style={{ alignItems: 'flex-end' }}>
          <Campo etichetta="Sorta">
            <select value={sorta} onChange={(e) => setSorta(e.target.value as SortaTerra)}>
              {SORTE_COMPRABILI.map((k) => (
                <option key={k} value={k}>{SORTE_TERRA[k].etichetta} — {SORTE_TERRA[k].rendita} fl</option>
              ))}
            </select>
          </Campo>
          <Campo etichetta="Nome"><input value={nomeTerra} onChange={(e) => setNomeTerra(e.target.value)}
            placeholder="Il podere di Rignano" /></Campo>
          <Campo etichetta="Luogo"><input value={luogoTerra} onChange={(e) => setLuogoTerra(e.target.value)}
            placeholder="Valdarno" /></Campo>
          <button type="button" onClick={aggiungiTerra} disabled={!nomeTerra.trim()}>Aggiungere</button>
        </div>

        {terre.length > 0 && (
          <div className="tabella" style={{ marginTop: '1rem' }}>
            <table>
              <thead><tr><th>Terra</th><th>Luogo</th><th>Sorta</th><th className="cifra">Rendita</th><th /></tr></thead>
              <tbody>
                {terre.map((t) => (
                  <tr key={t.id}>
                    <td>{t.nome}</td><td>{t.luogo}</td><td>{SORTE_TERRA[t.sorta].etichetta}</td>
                    <td className="cifra">{t.renditaBase} fl</td>
                    <td className="cifra"><button className="minuto" type="button"
                      onClick={() => setTerre((v) => v.filter((x) => x.id !== t.id))}>Togliere</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {sfora && <div className="avviso">Le terre eccedono i punti spesi: si aggiunga un punto in Terre o si tolga un bene.</div>}
      </Foglio>

      <div className="riga">
        <button className="primario" type="button" onClick={() => void fonda()}
                disabled={!nome.trim() || conto.errori.length > 0 || sfora}>Fondare il casato</button>
        <button type="button" onClick={() => vaiA(`/c/${campagna.id}`)}>Lasciar stare</button>
      </div>
      <Misura etichetta="Nota" valore="" glossa="Il casato si potrà correggere in ogni momento dalla sua scheda." />
    </>
  )
}
