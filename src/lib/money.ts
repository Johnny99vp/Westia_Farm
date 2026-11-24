import { CURRENCIES } from '../data'
// All amounts are integer minor units. Formatting uses integer division, never float division.
export function fmt(minor: number, cur: string): string {
  const c = CURRENCIES[cur], d = 10 ** c.exp
  const whole = Math.floor(minor / d), frac = String(minor % d).padStart(c.exp, '0')
  return `${c.symbol}${whole.toLocaleString('en-US')}.${frac}`
}
// Indicative display conversion only. The charged amount is computed server-side with a locked, stored rate.
export function convert(minor: number, from: string, to: string): number {
  if (from === to) return minor
  return Math.round((minor * CURRENCIES[to].perNgn) / CURRENCIES[from].perNgn)
}
