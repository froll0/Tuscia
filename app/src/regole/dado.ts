/** La sorte. Seminabile, perché un tiro condiviso dev'essere riproducibile. */

export interface Sorte {
  d6(): number
  d2d6(): [number, number]
  d20(): number
  d100(): number
}

function mulberry32(seme: number): () => number {
  let a = seme >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function creaSorte(seme?: number): Sorte {
  const r = seme === undefined ? Math.random : mulberry32(seme)
  const d = (facce: number) => 1 + Math.floor(r() * facce)
  return {
    d6: () => d(6),
    d2d6: () => [d(6), d(6)],
    d20: () => d(20),
    d100: () => d(100),
  }
}

export const sorte = creaSorte()
