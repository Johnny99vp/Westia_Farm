import { FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { COUNTRIES } from '../data'
import { useStore } from '../lib/store'
import { notify, now, uid, useDb, useProducts, Sub } from '../lib/db'
import { Card, m } from '../components/ui'
export function Checkout() {
  const { cart, clear } = useStore(); const { db, up } = useDb(); const nav = useNavigate(); const PRODUCTS = useProducts()
  const lines = cart.flatMap(l => { const p = PRODUCTS.find(x => x.id === l.id); return p ? [{ l, p }] : [] })
  const [f, setF] = useState({ name: db.user?.name ?? '', phone: db.user?.phone ?? '', country: db.user?.country ?? 'NG', city: '', address: '' })
  const [delivery, setDelivery] = useState('Seller delivery'); const [pay, setPay] = useState('Card'); const [err, setErr] = useState('')
  const total = lines.reduce((s, { l, p }) => s + l.qty * p.priceMinor, 0), set = (k: string, v: string) => setF({ ...f, [k]: v })
  if (!lines.length) return <p className="p-10 text-center">Your cart is empty. <Link className="underline" to="/products">Browse products</Link>.</p>
  const place = (e: FormEvent) => { e.preventDefault(); setErr('')
    if (!db.countries[f.country]) return setErr('We do not deliver to this country yet. Delivery is only offered where it is supported.')
    for (const { l, p } of lines) { if (l.qty < p.moq) return setErr(`${p.title}: minimum order is ${p.moq} ${p.unit}.`); if (l.qty > p.stock) return setErr(`${p.title}: only ${p.stock} ${p.unit} in stock.`) }
    const bySeller: Record<string, Sub> = {}
    lines.forEach(({ l, p }) => { const s = (bySeller[p.sellerId] ??= { sellerId: p.sellerId, seller: p.seller, status: 'awaiting_acceptance', tracking: '', itemsMinor: 0 }); s.itemsMinor += l.qty * p.priceMinor })
    const id = 'ORD-' + uid().toUpperCase()
    up(d => { let n = { ...d, products: d.products.map(p => { const x = lines.find(y => y.p.id === p.id); return x ? { ...p, stock: p.stock - x.l.qty } : p }),
      orders: [{ id, buyerId: d.user!.id, buyer: d.user!.name, items: lines.map(({ l, p }) => ({ pid: p.id, title: p.title, qty: l.qty, unitMinor: p.priceMinor, sellerId: p.sellerId })), subs: Object.values(bySeller), totalMinor: total,
        ship: `${f.name}, ${f.phone}, ${f.address}, ${f.city}, ${f.country}`, delivery, payment: pay, at: now() }, ...d.orders] }
      Object.keys(bySeller).forEach(s => { n = notify(n, s, `New order ${id}`) }); return notify(n, d.user!.id, `Order ${id} placed`) })
    clear(); nav('/account/orders') }
  return <div className="mx-auto grid max-w-5xl gap-4 px-4 py-6 md:grid-cols-[1fr_320px]"><form onSubmit={place} className="space-y-3"><h1 className="text-2xl">Checkout</h1>
    <Card className="space-y-3"><h2 className="font-sans text-base font-semibold">Delivery address</h2>
      {([['name', 'Full name'], ['phone', 'Phone'], ['city', 'City'], ['address', 'Street address']] as const).map(([k, l]) => <div key={k}><label className="label" htmlFor={k}>{l}</label><input id={k} className="input" required value={f[k]} onChange={e => set(k, e.target.value)} /></div>)}
      <div><label className="label" htmlFor="c">Country</label><select id="c" className="input" value={f.country} onChange={e => set('country', e.target.value)}>{COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}</select></div>
      <div><label className="label" htmlFor="d">Delivery</label><select id="d" className="input" value={delivery} onChange={e => setDelivery(e.target.value)}><option>Seller delivery</option><option>Pickup</option></select></div></Card>
    <Card><h2 className="font-sans text-base font-semibold">Payment</h2><select aria-label="Payment method" className="input mt-2" value={pay} onChange={e => setPay(e.target.value)}><option>Card</option><option>Bank transfer</option></select>
      <p className="mt-2 text-xs text-charcoal/60">Demo: no payment is taken. In production this opens the payment provider and the order is confirmed only after the server verifies the payment.</p></Card>
    {err && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{err}</p>}<button className="btn btn-forest w-full">Place order · {m(total)}</button></form>
    <Card className="h-fit"><h2 className="font-sans text-base font-semibold">Summary</h2><ul className="mt-2 space-y-1 text-sm">{lines.map(({ l, p }) => <li key={p.id} className="flex justify-between gap-2"><span>{p.title} × {l.qty}</span><b>{m(l.qty * p.priceMinor)}</b></li>)}</ul>
      <p className="mt-3 flex justify-between border-t pt-2"><span>Items</span><b>{m(total)}</b></p><p className="text-xs text-charcoal/60">Charged in NGN, the listing currency. Shipping is arranged by each seller and shown separately when confirmed.</p></Card></div>
}
