import { FormEvent, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { COUNTRIES } from '../data'
import { audit, day, Order, Sub, uid, now, useDb, notify } from '../lib/db'
import { Card, Empty, Inbox, Pill, Stat, Tabs, m } from '../components/ui'
const invoice = (o: Order) => { const t = [`INVOICE ${o.id}`, `Date: ${day(o.at)}`, `Buyer: ${o.buyer}`, '', ...o.items.map(i => `${i.title} x ${i.qty} @ ${m(i.unitMinor)} = ${m(i.qty * i.unitMinor)}`), '', `Total: ${m(o.totalMinor)}`, 'Currency: NGN'].join('\n')
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([t], { type: 'text/plain' })); a.download = `${o.id}.txt`; a.click(); URL.revokeObjectURL(a.href) }
function ReviewForm({ o, pid, title }: { o: Order; pid: string; title: string }) {
  const { db, up } = useDb(); const [r, setR] = useState(5); const [t, setT] = useState('')
  if (db.reviews.some(x => x.orderId === o.id && x.pid === pid)) return <p className="text-xs text-charcoal/60">Reviewed: {title}</p>
  return <form className="mt-1 flex flex-wrap items-end gap-2" onSubmit={(e: FormEvent) => { e.preventDefault(); up(d => ({ ...d, reviews: [...d.reviews, { id: uid(), pid, orderId: o.id, buyer: d.user!.name, rating: r, text: t.slice(0, 1000) }] })) }}>
    <span className="text-sm">Review {title}</span><select aria-label="Rating" className="input !w-20" value={r} onChange={e => setR(Number(e.target.value))}>{[5, 4, 3, 2, 1].map(n => <option key={n}>{n}</option>)}</select>
    <input aria-label="Review" className="input !w-auto min-w-40 flex-1" value={t} onChange={e => setT(e.target.value)} placeholder="How was it?" /><button className="btn btn-line !py-1.5">Submit</button></form>
}
function DisputeForm({ o, s }: { o: Order; s: Sub }) {
  const { db, up } = useDb(); const [open, setOpen] = useState(false); const [why, setWhy] = useState('')
  if (db.disputes.some(x => x.orderId === o.id && x.sellerId === s.sellerId)) return <p className="text-xs">Dispute opened</p>
  if (!open) return <button className="text-xs underline" onClick={() => setOpen(true)}>Report a problem</button>
  return <form className="flex gap-2" onSubmit={(e: FormEvent) => { e.preventDefault(); up(d => notify({ ...d, disputes: [...d.disputes, { id: uid(), orderId: o.id, sellerId: s.sellerId, buyerId: o.buyerId, reason: why.slice(0, 1000), status: 'open', resolution: '' }] }, 'admin', `Dispute on ${o.id}`)) }}>
    <input aria-label="Problem" required className="input" value={why} onChange={e => setWhy(e.target.value)} placeholder="Describe the problem" /><button className="btn btn-forest !py-1.5">Send</button></form>
}
export function Account() {
  const { tab = 'orders' } = useParams(); const { db, up } = useDb(); const nav = useNavigate(); const u = db.user!
  const [p, setP] = useState({ name: u.name, phone: u.phone, country: u.country }); const [saved, setSaved] = useState(false)
  const orders = db.orders.filter(o => o.buyerId === u.id), rfqs = db.rfqs.filter(r => r.buyerId === u.id), notes = db.notes.filter(n => n.to === u.id)
  const tabs = [['orders', 'Orders'], ['quotes', 'Quotes'], ['messages', 'Messages'], ['notifications', `Alerts (${notes.length})`], ['profile', 'Profile'], ['security', 'Security']]
  return <div className="mx-auto max-w-5xl px-4 py-6"><h1 className="text-2xl">My account</h1><p className="mb-3 text-sm text-charcoal/70">{u.name} · {u.email} · <Link className="underline" to="/seller">Seller centre</Link>{u.admin && <> · <Link className="underline" to="/admin">Admin</Link></>}</p>
    <Tabs base="/account" tabs={tabs} cur={tab} />
    {tab === 'orders' && (orders.length ? <ul className="space-y-3">{orders.map(o => <li key={o.id}><Card><div className="flex flex-wrap justify-between gap-2"><b>{o.id}</b><span className="text-sm">{day(o.at)} · {m(o.totalMinor)}</span></div>
      <ul className="mt-2 space-y-3">{o.subs.map(s => <li key={s.sellerId} className="rounded-xl bg-cream p-3 text-sm"><div className="flex flex-wrap items-center justify-between gap-2"><b>{s.seller}</b><Pill s={s.status} /></div>
        {s.tracking && <p>Tracking: {s.tracking}</p>}<ul className="mt-1 list-disc pl-5">{o.items.filter(i => i.sellerId === s.sellerId).map(i => <li key={i.pid}>{i.title} × {i.qty}</li>)}</ul>
        {s.status === 'delivered' && o.items.filter(i => i.sellerId === s.sellerId).map(i => <ReviewForm key={i.pid} o={o} pid={i.pid} title={i.title} />)}{s.status !== 'rejected' && <DisputeForm o={o} s={s} />}</li>)}</ul>
      <button className="btn btn-line mt-3 !py-1.5" onClick={() => invoice(o)}>Download invoice</button></Card></li>)}</ul> : <Empty text="No orders yet." />)}
    {tab === 'quotes' && (rfqs.length ? <ul className="space-y-3">{rfqs.map(r => <li key={r.id}><Card><div className="flex justify-between gap-2"><b>{r.item} · {r.qty} {r.unit}</b><Pill s={r.status} /></div><p className="text-sm text-charcoal/70">To {r.dest}{r.date && `, by ${r.date}`}</p>
      {r.quotes.length ? <ul className="mt-2 space-y-2">{r.quotes.map(q => <li key={q.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-cream p-3 text-sm"><span><b>{q.seller}</b>: {m(q.unitMinor)} per {r.unit}, valid to {q.valid}<br />{q.terms}</span>
        {r.status === 'open' ? <button className="btn btn-forest !py-1.5" onClick={() => up(d => notify({ ...d, rfqs: d.rfqs.map(x => x.id === r.id ? { ...x, status: 'awarded', won: q.id } : x) }, q.sellerId, `Your quote for ${r.item} was accepted`))}>Accept</button> : r.won === q.id && <Pill s="accepted" />}</li>)}</ul> : <p className="mt-2 text-sm">Waiting for seller quotations.</p>}</Card></li>)}</ul>
      : <Empty text="No quotation requests yet." />)}
    {tab === 'messages' && <Inbox meId={u.id} who="buyer" />}
    {tab === 'notifications' && (notes.length ? <ul className="space-y-2">{notes.map(n => <li key={n.id}><Card className="text-sm">{n.text}<span className="block text-xs text-charcoal/60">{day(n.at)}</span></Card></li>)}</ul> : <Empty text="No notifications." />)}
    {tab === 'profile' && <Card><form className="space-y-3" onSubmit={(e: FormEvent) => { e.preventDefault(); up(d => ({ ...d, user: { ...d.user!, ...p }, users: d.users.map(x => x.id === u.id ? { ...x, ...p } : x) })); setSaved(true) }}>
      <div><label className="label" htmlFor="pn">Full name</label><input id="pn" className="input" required value={p.name} onChange={e => setP({ ...p, name: e.target.value })} /></div>
      <div><label className="label" htmlFor="pp">Phone</label><input id="pp" className="input" type="tel" value={p.phone} onChange={e => setP({ ...p, phone: e.target.value })} /></div>
      <div><label className="label" htmlFor="pc">Country</label><select id="pc" className="input" value={p.country} onChange={e => setP({ ...p, country: e.target.value })}>{COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}</select></div>
      <button className="btn btn-forest">Save</button>{saved && <span role="status" className="ml-3 text-sm">Saved</span>}</form></Card>}
    {tab === 'security' && <Card className="space-y-3 text-sm"><p>Two-factor login, password change and active sessions are provided by Supabase Auth in production.</p>
      <button className="btn btn-line" onClick={() => { up(d => ({ ...d, user: null })); nav('/') }}>Log out</button>
      <div className="rounded-xl bg-yellow-50 p-3"><b>Demo only: admin access</b><p className="mb-2">In production, admin rights are granted only by a super-admin. This switch exists to let you preview the admin screens and must be removed.</p>
        <button className="btn btn-gold" onClick={() => up(d => audit({ ...d, user: { ...d.user!, admin: !d.user!.admin }, users: d.users.map(x => x.id === u.id ? { ...x, admin: !u.admin } : x) }, u.name, 'toggled demo admin'))}>{u.admin ? 'Turn admin preview off' : 'Turn admin preview on'}</button></div></Card>}
  </div>
}
