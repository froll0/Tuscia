import { NavLink, Route, Routes } from 'react-router-dom'
import { ProvvedeDati } from './dati/contesto'
import Elenco from './interfaccia/Elenco'
import NuovaCampagna from './interfaccia/NuovaCampagna'
import Cruscotto from './interfaccia/Cruscotto'
import NuovoCasato from './interfaccia/NuovoCasato'
import SchedaCasato from './interfaccia/SchedaCasato'
import NuovoPersonaggio from './interfaccia/NuovoPersonaggio'
import Impostazioni from './interfaccia/Impostazioni'

export default function App() {
  return (
    <ProvvedeDati>
      <div className="telaio">
        <header className="capo">
          <span className="capo-marca">
            <span className="capo-arme">Tuscia</span>
            <strong>La Prima Casa</strong>
          </span>
          <nav className="capo-vie">
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'qui' : '')}>Campagne</NavLink>
            <NavLink to="/impostazioni" className={({ isActive }) => (isActive ? 'qui' : '')}>Deposito</NavLink>
            <a href={`${import.meta.env.BASE_URL}manuale/`} target="_blank" rel="noreferrer">Manuale</a>
            <a href={`${import.meta.env.BASE_URL}schede/`} target="_blank" rel="noreferrer">Schede</a>
          </nav>
        </header>

        <main className="corpo">
          <Routes>
            <Route path="/" element={<Elenco />} />
            <Route path="/nuova" element={<NuovaCampagna />} />
            <Route path="/c/:id" element={<Cruscotto />} />
            <Route path="/c/:id/casato/nuovo" element={<NuovoCasato />} />
            <Route path="/c/:id/casato/:kid" element={<SchedaCasato />} />
            <Route path="/c/:id/casato/:kid/persona" element={<NuovoPersonaggio />} />
            <Route path="/impostazioni" element={<Impostazioni />} />
            <Route path="*" element={<p className="vuoto">Questa via non conduce a nulla.</p>} />
          </Routes>
        </main>

        <footer className="pie">
          La Prima Casa della Tuscia — programma di governo delle campagne. I dati non lasciano
          il deposito che avete scelto.
        </footer>
      </div>
    </ProvvedeDati>
  )
}
