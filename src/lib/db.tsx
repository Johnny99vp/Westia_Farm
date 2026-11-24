// DEMO DATA LAYER: everything lives in this browser's localStorage so the full UI can be exercised.
// It is NOT secure and is shared by nobody. Replace each mutation with a Supabase RPC / Edge Function call.
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { PRODUCTS, Product, COUNTRIES } from '../data'
export type Status = 'unsubmitted' | 'pending' | 'under_review' | 'approved' | 'rejected' | 'suspended'
export type User = { id: string; name: string; email: string; country: string; phone: string; admin: boolean }
export type Doc = { type: string; file: string }
export type Shop = { id: string; name: string; owner: string; country: string; kind: string; status: Status; docs: Doc[]; note: string; plan: string }
export type Item = { pid: string; title: string; qty: number; unitMinor: number; sellerId: string }
export type Sub = { sellerId: string; seller: string; status: 'awaiting_acceptance' | 'accepted' | 'rejected' | 'dispatched' | 'delivered'; tracking: string; itemsMinor: number }
export type Order = { id: string; buyerId: string; buyer: string; items: Item[]; subs: Sub[]; totalMinor: number; ship: string; delivery: string; payment: string; at: string }
export type Quote = { id: string; sellerId: string; seller: string; unitMinor: number; valid: string; terms: string }
export type Rfq = { id: string; buyerId: string; buyer: string; item: string; qty: number; unit: string; dest: string; date: string; notes: string; status: 'open' | 'awarded'; quotes: Quote[]; won: string }
export type Thread = { id: string; buyerId: string; buyer: string; sellerId: string; seller: string; subject: string }
export type Msg = { id: string; thread: string; from: string; text: string; at: string }
export type Review = { id: string; pid: string; orderId: string; buyer: string; rating: number; text: string }
export type Dispute = { id: string; orderId: string; sellerId: string; buyerId: string; reason: string; status: 'open' | 'resolved'; resolution: string }
export type Payout = { id: string; sellerId: string; seller: string; amountMinor: number; status: 'requested' | 'approved' | 'paid' | 'rejected' }
export type Note = { id: string; to: string; text: string; at: string }
export type Plan = { code: string; name: string; priceMinor: number | null }
export type PP = Product & { sellerId: string; status: 'pending_review' | 'published' | 'removed' }
export type Db = { user: User | null; users: User[]; shops: Shop[]; products: PP[]; orders: Order[]; rfqs: Rfq[]; threads: Thread[]; msgs: Msg[]; reviews: Review[]
  disputes: Dispute[]; payouts: Payout[]; notes: Note[]; audit: { id: string; actor: string; action: string; at: string }[]; commissionBps: number; countries: Record<string, boolean>; plans: Plan[] }
export const uid = () => Math.random().toString(36).slice(2, 9)
export const now = () => new Date().toISOString()
export const day = (iso: string) => iso.slice(0, 10)
export const parseMinor = (s: string): number | null => /^\d+(\.\d{1,2})?$/.test(s.trim()) ? (([w, f = ''] = s.trim().split('.')) => Number(w) * 100 + Number((f + '00').slice(0, 2)))() : null
export const notify = (d: Db, to: string, text: string): Db => ({ ...d, notes: [{ id: uid(), to, text, at: now() }, ...d.notes] })
export const audit = (d: Db, actor: string, action: string): Db => ({ ...d, audit: [{ id: uid(), actor, action, at: now() }, ...d.audit] })
export const stats = (d: Db, sid: string) => {
  const subs = d.orders.flatMap(o => o.subs.filter(s => s.sellerId === sid)), gross = subs.filter(s => s.status === 'delivered').reduce((a, s) => a + s.itemsMinor, 0)
  const commission = Math.round(gross * d.commissionBps / 10000), paid = d.payouts.filter(p => p.sellerId === sid && p.status !== 'rejected').reduce((a, p) => a + p.amountMinor, 0)
  return { gross, commission, net: gross - commission, paid, avail: gross - commission - paid }
}
const sid = (s: string) => s === 'Westia Farm' ? 's-westia' : s === 'Adeola Fresh Produce' ? 's-adeola' : 's-green'
const sh = (id: string, name: string, status: Status): Shop => ({ id, name, owner: 'u-' + id, country: 'NG', kind: 'Farm', status, docs: [], note: '', plan: 'starter' })
const seed = (): Db => ({ user: null, users: [], shops: [sh('s-westia', 'Westia Farm', 'approved'), sh('s-adeola', 'Adeola Fresh Produce', 'pending'), sh('s-green', 'GreenInputs Ltd', 'approved')],
  products: PRODUCTS.map(p => ({ ...p, sellerId: sid(p.seller), status: 'published' as const })), orders: [], rfqs: [], threads: [], msgs: [], reviews: [], disputes: [], payouts: [], notes: [], audit: [],
  commissionBps: 500, // placeholder: the real default is set by Westia Farm administrators
  countries: Object.fromEntries(COUNTRIES.map(c => [c.code, c.code === 'NG'])),
  plans: [{ code: 'starter', name: 'Free Starter', priceMinor: 0 }, { code: 'growth', name: 'Growth', priceMinor: null }, { code: 'business', name: 'Business', priceMinor: null }, { code: 'enterprise', name: 'Enterprise', priceMinor: null }] })
const Ctx = createContext<{ db: Db; up: (f: (d: Db) => Db) => void }>(null!)
export function DbProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<Db>(() => { try { const v = localStorage.getItem('db1'); if (v) return JSON.parse(v) } catch { /* ignore */ } return seed() })
  useEffect(() => { try { localStorage.setItem('db1', JSON.stringify(db)) } catch { /* ignore */ } }, [db])
  return <Ctx.Provider value={{ db, up: setDb }}>{children}</Ctx.Provider>
}
export const useDb = () => useContext(Ctx)
export const useProducts = () => useDb().db.products.filter(p => p.status === 'published')
