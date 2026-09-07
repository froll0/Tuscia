/**
 * Le chiavi delle campagne che questo browser conosce.
 * Una chiave è come la chiave di casa: chi la possiede entra. Si conserva qui,
 * e si dà a mano a chi si vuole al tavolo.
 */
const CHIAVE = 'tuscia:chiavi'

export interface ChiaveCampagna { id: string; nome: string; chiave: string }

export function chiaviNote(): ChiaveCampagna[] {
  try {
    const s = localStorage.getItem(CHIAVE)
    return s ? (JSON.parse(s) as ChiaveCampagna[]) : []
  } catch { return [] }
}

function scrivi(v: ChiaveCampagna[]): void {
  try { localStorage.setItem(CHIAVE, JSON.stringify(v)) } catch { /* archiviazione negata */ }
}

export function ricorda(c: ChiaveCampagna): void {
  const v = chiaviNote().filter((x) => x.chiave !== c.chiave && x.id !== c.id)
  scrivi([c, ...v])
}

export function scorda(chiave: string): void {
  scrivi(chiaviNote().filter((x) => x.chiave !== chiave))
}

export function chiaveDi(id: string): string | null {
  return chiaviNote().find((x) => x.id === id)?.chiave ?? null
}
