import { ChangeEvent, FormEvent, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CATEGORIES, COUNTRIES, REQS, UNITS } from '../data'
import { audit, day, Shop, notify, now, parseMinor, stats, uid, useDb } from '../lib/db'
import { Card, Empty, Inbox, Pill, Stat, Tabs, m } from '../components/ui'
const Field = ({ id, label, ...r }: { id: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) => <div><label className="label" htmlFor={id}>{label}</label><input id={id} className="input" {...r} /></div>
function Verification({ shop }: { shop?: Shop }) {
  const { db, up } = useDb(); const u = db.user!; const [f, setF] = useState({ name: '', kind: 'Farmer', country: u.country }); const [err, setErr] = useState('')
  if (!shop) return <Card><h2 className="font-sans text-lg font-semibold">Open your store</h2><form className="mt-3 space-y-3" onSubmit={(e: FormEvent) => { e.preventDefault()
    if (!db.countries[f.country]) return setErr('Selling is not enabled for this country yet.')
    up(d => ({ ...d, shops: [...d.shops, { id: 's-' + uid(), name: f.name.slice(0, 80), owner: u.id, country: f.country, kind: f.kind, status: 'unsubmitted', docs: [], note: '', plan: 'starter' }] })) }}>
    <Field id="sn" label="Store name" required value={f.name} onChange={e => setF({ ...f, name: e.target.value })} />
    <div><label className="label" htmlFor="sk">Business type</label><select id="sk" className="input" value={f.kind} onChange={e => setF({ ...f, kind: e.target.value })}>{['Farmer', 'Agricultural supplier', 'Wholesaler', 'Retailer', 'Processor', 'Distributor', 'Importer/exporter', 'Company'].map(k => <option key={k}>{k}</option>)}</select></div>
    <div><label className="label" htmlFor="sc">Country</label><select id="sc" className="input" value={f.country} onChange={e => setF({ ...f, country: e.target.value })}>{COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}{db.countries[c.code] ? '' : ' (not yet enabled)'}</option>)}</select></div>
    {err && <p role="alert" className="text-sm text-red-700">{err}</p>}<button className="btn btn-forest">Create store</button></form></Card>
  const reqs = REQS[shop.country] ?? REQS.default, has = (t: string) => shop.docs.find(d => d.type === t)
  const upload = (t: string) => (e: ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (!file) return
    if (file.size > 5_000_000 || !/\.(pdf|jpe?g|png)$/i.test(file.name)) return setErr('Use a PDF, JPG or PNG under 5 MB.'); setErr('')
    up(d => ({ ...d, shops: d.shops.map(s => s.id === shop.id ? { ...s, docs: [...s.docs.filter(x => x.type !== t), { type: t, file: file.name }] } : s) })) } // production: signed upload to private bucket
  const ready = reqs.every(r => has(r)) && ['unsubmitted', 'rejected', 'under_review'].includes(shop.status)
  return <Card><div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-sans text-lg font-semibold">{shop.name}</h2><Pill s={shop.status} /></div>
    {shop.note && <p className="mt-2 rounded-xl bg-yellow-50 p-3 text-sm">Message from Westia: {shop.note}</p>}
    <p className="mt-3 text-sm text-charcoal/70">Documents required for {COUNTRIES.find(c => c.code === shop.country)?.name} (demo requirements; configured per country by Westia Farm).</p>
    <ul className="mt-3 space-y-3">{reqs.map(r => <li key={r} className="rounded-xl bg-cream p-3 text-sm"><label className="block font-medium" htmlFor={r}>{r}</label>
      <p className="text-xs">{has(r) ? `Uploaded: ${has(r)!.file}` : 'Not uploaded'}</p><input id={r} type="file" accept=".pdf,.jpg,.jpeg,.png" className="mt-1 text-sm" onChange={upload(r)} /></li>)}</ul>
    {err && <p role="alert" className="mt-2 text-sm text-red-700">{err}</p>}
    <button disabled={!ready} className="btn btn-forest mt-4" onClick={() => up(d => notify(audit({ ...d, shops: d.shops.map(s => s.id === shop.id ? { ...s, status: 'pending' } : s) }, u.name, `submitted verification for ${shop.name}`), 'admin', `${shop.name} submitted verification`))}>Submit for review</button></Card>
}
function Products({ shop }: { shop: Shop }) {
  const { db, up } = useDb(); const mine = db.products.filter(p => p.sellerId === shop.id && p.status !== 'removed'); const [err, setErr] = useState('')
  const [f, setF] = useState({ title: '', category: 'grains', price: '', ws: '', unit: 'kg', moq: '1', stock: '', city: '', img: '' })
  const submit = (e: FormEvent) => { e.preventDefault(); const price = parseMinor(f.price), ws = f.ws ? parseMinor(f.ws) : undefined
    if (price === null || ws === null || !(Number(f.moq) > 0) || !(Number(f.stock) >= 0)) return setErr('Check the price (up to 2 decimals), minimum order and stock.'); setErr('')
    const cat = CATEGORIES.find(c => c.slug === f.category)!
    up(d => notify({ ...d, products: [{ id: 'p-' + uid(), title: f.title.slice(0, 120), kind: cat.kind as 'input' | 'produce', category: f.category, img: f.img || 'https://westiafarm.vercel.app/images/original-maize-field.jpg', priceMinor: price, wholesaleMinor: ws, unit: f.unit,
      moq: Number(f.moq), seller: shop.name, sellerId: shop.id, country: shop.country, city: f.city, verified: true, stock: Number(f.stock), listCurrency: 'NGN', status: 'pending_review' }, ...d.products] }, 'admin', `Listing awaiting review: ${f.title}`)) ; setF({ ...f, title: '', price: '', ws: '', stock: '' }) }
  return <div className="space-y-4"><Card><h2 className="font-sans text-lg font-semibold">Add a listing</h2><form onSubmit={submit} className="mt-3 grid gap-3 sm:grid-cols-2">
    <div className="sm:col-span-2"><Field id="t" label="Product name" required value={f.title} onChange={e => setF({ ...f, title: e.target.value })} /></div>
    <div><label className="label" htmlFor="cat">Category</label><select id="cat" className="input" value={f.category} onChange={e => setF({ ...f, category: e.target.value })}>{CATEGORIES.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}</select></div>
    <div><label className="label" htmlFor="u">Unit</label><select id="u" className="input" value={f.unit} onChange={e => setF({ ...f, unit: e.target.value })}>{UNITS.map(x => <option key={x}>{x}</option>)}</select></div>
    <Field id="pr" label="Retail price (NGN)" inputMode="decimal" required value={f.price} onChange={e => setF({ ...f, price: e.target.value })} /><Field id="ws" label="Wholesale price (NGN, optional)" inputMode="decimal" value={f.ws} onChange={e => setF({ ...f, ws: e.target.value })} />
    <Field id="mq" label="Minimum order" type="number" min="1" required value={f.moq} onChange={e => setF({ ...f, moq: e.target.value })} /><Field id="st" label="Quantity in stock" type="number" min="0" required value={f.stock} onChange={e => setF({ ...f, stock: e.target.value })} />
    <Field id="ct" label="Product location (city)" required value={f.city} onChange={e => setF({ ...f, city: e.target.value })} /><Field id="im" label="Image link (optional)" type="url" value={f.img} onChange={e => setF({ ...f, img: e.target.value })} />
    {err && <p role="alert" className="text-sm text-red-700 sm:col-span-2">{err}</p>}<button className="btn btn-forest sm:col-span-2">Submit for review</button></form></Card>
    {mine.length ? <ul className="space-y-2">{mine.map(p => <li key={p.id}><Card className="flex flex-wrap items-center justify-between gap-2 text-sm"><span><b>{p.title}</b><br />{m(p.priceMinor)} / {p.unit} · MOQ {p.moq}</span><span className="flex items-center gap-2"><Pill s={p.status} />
      <button className="underline" onClick={() => up(d => ({ ...d, products: d.products.map(x => x.id === p.id ? { ...x, status: 'removed' } : x) }))}>Remove</button></span></Card></li>)}</ul> : <Empty text="No listings yet." />}</div>
}
function Orders({ shop }: { shop: Shop }) {
  const { db, up } = useDb(); const [trk, setTrk] = useState<Record<string, string>>({})
  const rows = db.orders.flatMap(o => o.subs.filter(s => s.sellerId === shop.id).map(s => ({ o, s })))
  const set = (oid: string, status: 'accepted' | 'rejected' | 'dispatched' | 'delivered', tracking?: string) => up(d => { const o = d.orders.find(x => x.id === oid)!
    return notify({ ...d, orders: d.orders.map(x => x.id === oid ? { ...x, subs: x.subs.map(s => s.sellerId === shop.id ? { ...s, status, tracking: tracking ?? s.tracking } : s) } : x),
      products: status === 'rejected' ? d.products.map(p => { const i = o.items.find(it => it.pid === p.id && it.sellerId === shop.id); return i ? { ...p, stock: p.stock + i.qty } : p }) : d.products }, o.buyerId, `Order ${oid}: ${status.replace('_', ' ')}`) })
  return rows.length ? <ul className="space-y-3">{rows.map(({ o, s }) => <li key={o.id}><Card className="text-sm"><div className="flex flex-wrap justify-between gap-2"><b>{o.id}</b><Pill s={s.status} /></div><p>{o.buyer} · {m(s.itemsMinor)} · {o.delivery}</p><p className="text-charcoal/70">{o.ship}</p>
    <ul className="list-disc pl-5">{o.items.filter(i => i.sellerId === shop.id).map(i => <li key={i.pid}>{i.title} × {i.qty}</li>)}</ul>
    <div className="mt-2 flex flex-wrap gap-2">{s.status === 'awaiting_acceptance' && <><button className="btn btn-forest !py-1.5" onClick={() => set(o.id, 'accepted')}>Accept</button><button className="btn btn-line !py-1.5" onClick={() => set(o.id, 'rejected')}>Reject</button></>}
      {s.status === 'accepted' && <><input aria-label="Tracking reference" className="input !w-auto" placeholder="Tracking or driver details" value={trk[o.id] ?? ''} onChange={e => setTrk({ ...trk, [o.id]: e.target.value })} /><button className="btn btn-forest !py-1.5" onClick={() => set(o.id, 'dispatched', (trk[o.id] ?? '').slice(0, 200))}>Mark dispatched</button></>}
      {s.status === 'dispatched' && <button className="btn btn-forest !py-1.5" onClick={() => set(o.id, 'delivered')}>Mark delivered</button>}</div>{s.tracking && <p className="mt-1">Tracking: {s.tracking}</p>}</Card></li>)}</ul> : <Empty text="No orders yet." />
}
function Quotes({ shop }: { shop: Shop }) {
  const { db, up } = useDb(); const [q, setQ] = useState<Record<string, { p: string; v: string; t: string }>>({}); const [err, setErr] = useState('')
  const open = db.rfqs.filter(r => r.status === 'open' && !r.quotes.some(x => x.sellerId === shop.id))
  return <div className="space-y-3">{err && <p role="alert" className="text-sm text-red-700">{err}</p>}{open.length ? open.map(r => { const v = q[r.id] ?? { p: '', v: '', t: '' }, set = (k: string, x: string) => setQ({ ...q, [r.id]: { ...v, [k]: x } })
    return <Card key={r.id}><b>{r.item} · {r.qty} {r.unit}</b><p className="text-sm text-charcoal/70">{r.buyer} · to {r.dest}{r.date && `, by ${r.date}`}</p>{r.notes && <p className="text-sm">{r.notes}</p>}
      <form className="mt-2 grid gap-2 sm:grid-cols-3" onSubmit={(e: FormEvent) => { e.preventDefault(); const p = parseMinor(v.p); if (p === null) return setErr('Enter the unit price in NGN, up to 2 decimals.'); setErr('')
        up(d => notify({ ...d, rfqs: d.rfqs.map(x => x.id === r.id ? { ...x, quotes: [...x.quotes, { id: uid(), sellerId: shop.id, seller: shop.name, unitMinor: p, valid: v.v, terms: v.t.slice(0, 500) }] } : x) }, r.buyerId, `New quotation for ${r.item}`)) }}>
        <input aria-label="Unit price NGN" className="input" placeholder="Unit price (NGN)" inputMode="decimal" required value={v.p} onChange={e => set('p', e.target.value)} /><input aria-label="Valid until" type="date" required className="input" value={v.v} onChange={e => set('v', e.target.value)} />
        <input aria-label="Terms" className="input" placeholder="Terms and delivery" value={v.t} onChange={e => set('t', e.target.value)} /><button className="btn btn-forest sm:col-span-3">Send quotation</button></form></Card> }) : <Empty text="No open quotation requests." />}</div>
}
export function Seller() {
  const { tab = 'overview' } = useParams(); const { db, up } = useDb(); const u = db.user!; const shop = db.shops.find(s => s.owner === u.id); const ok = shop?.status === 'approved'
  const cur = !ok && tab !== 'verification' ? 'verification' : tab
  const tabs = [['overview', 'Overview'], ['verification', 'Verification'], ['products', 'Products'], ['inventory', 'Stock'], ['orders', 'Orders'], ['quotes', 'Quotes'], ['messages', 'Messages'], ['earnings', 'Earnings'], ['plan', 'Plan'], ['alerts', 'Alerts']]
  const st = shop ? stats(db, shop.id) : null, mine = shop ? db.products.filter(p => p.sellerId === shop.id && p.status !== 'removed') : [], notes = shop ? db.notes.filter(n => n.to === shop.id) : []
  const [amt, setAmt] = useState(''); const [err, setErr] = useState('')
  return <div className="mx-auto max-w-5xl px-4 py-6"><h1 className="text-2xl">Seller centre</h1><p className="mb-3 text-sm text-charcoal/70">One account for buying and selling. <Link className="underline" to="/account">My account</Link></p>
    <Tabs base="/seller" tabs={ok ? tabs : [['verification', 'Verification']]} cur={cur} />
    {cur === 'overview' && shop && st && <div className="grid grid-cols-2 gap-3 md:grid-cols-4"><Stat l="Listings" v={mine.length} /><Stat l="Orders" v={db.orders.filter(o => o.subs.some(s => s.sellerId === shop.id)).length} /><Stat l="Sales delivered" v={m(st.gross)} /><Stat l="Available to withdraw" v={m(st.avail)} /></div>}
    {cur === 'verification' && <Verification shop={shop} />}
    {cur === 'products' && shop && <Products shop={shop} />}
    {cur === 'inventory' && shop && (mine.length ? <ul className="space-y-2">{mine.map(p => <li key={p.id}><Card className="flex flex-wrap items-center justify-between gap-2 text-sm"><span><b>{p.title}</b>{p.stock < 10 && <span className="ml-2 rounded-full bg-red-100 px-2 text-xs text-red-800">Low stock</span>}</span>
      <label className="flex items-center gap-2">Stock ({p.unit})<input type="number" min="0" className="input !w-24" value={p.stock} onChange={e => up(d => ({ ...d, products: d.products.map(x => x.id === p.id ? { ...x, stock: Math.max(0, Number(e.target.value)) } : x) }))} /></label></Card></li>)}</ul> : <Empty text="No stock to manage yet." />)}
    {cur === 'orders' && shop && <Orders shop={shop} />}
    {cur === 'quotes' && shop && <Quotes shop={shop} />}
    {cur === 'messages' && shop && <Inbox meId={shop.id} who="seller" />}
    {cur === 'earnings' && shop && st && <div className="space-y-3"><div className="grid grid-cols-2 gap-3 md:grid-cols-4"><Stat l="Delivered sales" v={m(st.gross)} /><Stat l={`Commission (${db.commissionBps / 100}%)`} v={m(st.commission)} /><Stat l="Your earnings" v={m(st.net)} /><Stat l="Available" v={m(st.avail)} /></div>
      <Card><form className="flex flex-wrap items-end gap-2" onSubmit={(e: FormEvent) => { e.preventDefault(); const a = parseMinor(amt); if (a === null || a <= 0 || a > st.avail) return setErr('Enter an amount up to your available balance.'); setErr('')
        up(d => notify(audit({ ...d, payouts: [{ id: uid(), sellerId: shop.id, seller: shop.name, amountMinor: a, status: 'requested' }, ...d.payouts] }, shop.name, 'requested payout'), 'admin', `Payout request from ${shop.name}`)); setAmt('') }}>
        <Field id="pa" label="Request a payout (NGN)" inputMode="decimal" value={amt} onChange={e => setAmt(e.target.value)} /><button className="btn btn-forest">Request</button></form>{err && <p role="alert" className="mt-2 text-sm text-red-700">{err}</p>}
        <p className="mt-2 text-xs text-charcoal/60">Payouts need a verified payout account and a supported provider. The commission rate is set by Westia Farm.</p></Card>
      <ul className="space-y-2">{db.payouts.filter(p => p.sellerId === shop.id).map(p => <li key={p.id}><Card className="flex justify-between text-sm"><span>{m(p.amountMinor)}</span><Pill s={p.status} /></Card></li>)}</ul></div>}
    {cur === 'plan' && shop && <div className="grid gap-3 sm:grid-cols-2">{db.plans.map(p => <Card key={p.code}><b>{p.name}</b><p className="text-sm">{p.priceMinor === null ? 'Price not set yet' : p.priceMinor === 0 ? 'Free' : `${m(p.priceMinor)} / month`}</p>
      {shop.plan === p.code ? <Pill s="active" /> : <button disabled={p.priceMinor === null} className="btn btn-line mt-2 !py-1.5" onClick={() => up(d => ({ ...d, shops: d.shops.map(s => s.id === shop.id ? { ...s, plan: p.code } : s) }))}>Choose</button>}</Card>)}
      <p className="text-xs text-charcoal/60 sm:col-span-2">Prices are set by Westia Farm. Billing, renewals and trials connect with the payment provider.</p></div>}
    {cur === 'alerts' && (notes.length ? <ul className="space-y-2">{notes.map(n => <li key={n.id}><Card className="text-sm">{n.text}<span className="block text-xs text-charcoal/60">{day(n.at)}</span></Card></li>)}</ul> : <Empty text="No alerts." />)}</div>
}
