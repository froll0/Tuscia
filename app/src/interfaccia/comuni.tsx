import type { ReactNode } from 'react'

export function Foglio({ titolo, azione, children }: { titolo?: string; azione?: ReactNode; children: ReactNode }) {
  return (
    <section className="foglio">
      {titolo && (
        <h2 className="riga riga-sparsa">
          <span>{titolo}</span>
          {azione}
        </h2>
      )}
      {children}
    </section>
  )
}

export function Campo({ etichetta, nota, children }: { etichetta: string; nota?: string; children: ReactNode }) {
  return (
    <label className="campo">
      <span>{etichetta}{nota && <i> — {nota}</i>}</span>
      {children}
    </label>
  )
}

export function Misura({ etichetta, valore, glossa }: { etichetta: string; valore: ReactNode; glossa?: string }) {
  return (
    <div className="misura">
      <span className="etichetta">{etichetta}</span>
      <span className="valore">{valore}</span>
      {glossa && <span className="glossa">{glossa}</span>}
    </div>
  )
}

export function Scaletta({ valore, min, max, muta, disabilitato }:
  { valore: number; min: number; max: number; muta: (n: number) => void; disabilitato?: boolean }) {
  return (
    <div className="scaletta">
      <button type="button" onClick={() => muta(Math.max(min, valore - 1))}
              disabled={disabilitato || valore <= min} aria-label="meno">−</button>
      <span className="valore">{valore}</span>
      <button type="button" onClick={() => muta(Math.min(max, valore + 1))}
              disabled={disabilitato || valore >= max} aria-label="più">+</button>
    </div>
  )
}

const PIP: Record<number, number[]> = {
  1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8],
}
export function Dado({ valore, rosso }: { valore: number; rosso?: boolean }) {
  return (
    <span className={`dado${rosso ? ' rossa' : ''}`} aria-label={`dado: ${valore}`}>
      {Array.from({ length: 9 }, (_, i) => (
        <i key={i} style={{ visibility: PIP[valore]?.includes(i) ? 'visible' : 'hidden' }} />
      ))}
    </span>
  )
}

export function Vuoto({ children }: { children: ReactNode }) {
  return <p className="vuoto">{children}</p>
}

export function fiorini(n: number): string {
  return `${Math.round(n).toLocaleString('it-IT')} fl`
}
