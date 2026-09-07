/** fasc. 10 — la casa: spese, generare, morire, doti. */
import { TENORI, SPESA_CONGIUNTO_OLTRE_QUARTO, SPESA_FAMIGLIO, FERTILITA, MORTALITA, CRESCITA_DOTI_ANNUA, DOTI_ATTESE } from './tavole'
import type { Casato, Congiunto } from '../modello/tipi'

export function speseAnnueDiCasa(casato: Casato): { tenore: number; congiunti: number; famigli: number; totale: number } {
  const tenore = TENORI[casato.tenore].spesaAnnua
  const vivi = casato.congiunti.filter((c) => c.stato !== 'morto').length
  const congiunti = Math.max(0, vivi - 4) * SPESA_CONGIUNTO_OLTRE_QUARTO
  const famigli = casato.famigli * SPESA_FAMIGLIO
  return { tenore, congiunti, famigli, totale: tenore + congiunti + famigli }
}

/** L'Onore non può superare quello che il Tenore consente (fasc. 06). */
export function onoreConsentito(casato: Casato): number {
  return TENORI[casato.tenore].onoreMax
}

/** Il Seguito non può superare l'Onore + 2 (fasc. 09 § 1). */
export function seguitoConsentito(casato: Casato): number {
  return casato.onore + 2
}

export function sogliaFertilita(etaDellaMoglie: number): number {
  return FERTILITA.find((f) => etaDellaMoglie >= f.min && etaDellaMoglie <= f.max)?.soglia ?? 99
}

export function sogliaMortalita(eta: number): number {
  if (eta < 6) return 0 // la prima infanzia si tira altrimenti
  return MORTALITA.find((m) => eta >= m.min && eta <= m.max)?.soglia ?? 30
}

export function modificatoreMortalita(c: Congiunto, malEreditario: boolean): number {
  let m = 0
  const v = c.qualita.vigore
  if (v >= 4) m -= 2
  if (v <= 1) m += 3
  if (malEreditario) m += 3
  return m
}

/** Le doti crescono del 2% l'anno dal 1450 in poi (fasc. 10 § 2). */
export function doteAttesa(rango: number, anno: number): { min: number; max: number; rango: string } {
  const riga = DOTI_ATTESE[Math.max(0, Math.min(DOTI_ATTESE.length - 1, rango))]!
  const anni = Math.max(0, anno - 1450)
  const k = Math.pow(1 + CRESCITA_DOTI_ANNUA, anni)
  return { min: Math.round(riga.min * k), max: Math.round(riga.max * k), rango: riga.rango }
}

/** fasc. 08 § 7 — il Monte delle doti. */
export function monteDelleDoti(deposito: number, anni: 7.5 | 15): number {
  return Math.round(deposito * (anni === 15 ? 5 : 2.5))
}

export function corpoDi(c: Pick<Congiunto, 'qualita'>): number { return 3 + c.qualita.vigore }
export function tenutaDi(c: Pick<Congiunto, 'qualita'>): number { return 6 + c.qualita.animo }
export function guardiaDi(c: Pick<Congiunto, 'qualita' | 'arti'>, misure = 0): number {
  return 6 + c.qualita.ingegno + (c.arti['Informazione'] ?? 0) + misure
}
