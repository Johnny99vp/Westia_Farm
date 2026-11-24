import { ReactNode, useState, FormEvent } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useDb, uid, now } from '../lib/db'
import { fmt } from '../lib/money'
export const m = (n: number) => fmt(n, 'NGN')
export const Pill = ({ s }: { s: string }) => <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${/approved|published|delivered|paid|accepted|resolved/.test(s) ? 'bg-green-100 text-green-800' : /reject|removed|suspend/.test(s) ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-900'}`}>{s.replace(/_/g, ' ')}</span>
export const Card = ({ children, className = '' }: { children: ReactNode; className?: string }) => <div className={`rounded-2xl border border-charcoal/10 bg-white p-4 ${className}`}>{children}</div>
export const Empty = ({ text }: { text: string }) => <p className="rounded-2xl bg-white p-6 text-sm text-charcoal/70">{text}</p>
export const Stat = ({ l, v }: { l: string; v: string | number }) => <Card><p className="text-xs text-charcoal/60">{l}</p><p className="mt-1 text-xl font-semibold text-forest">{v}</p></Card>
export function Tabs({ base, tabs, cur }: { base: string; tabs: string[][]; cur: string }) {
  return <nav className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-2" aria-label="Sections">{tabs.map(([k, l]) => <Link key={k} to={`${base}/${k}`} className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm ${cur === k ? 'border-forest bg-forest text-white' : 'border-charcoal/15 bg-white'}`}>{l}</Link>)}</nav>
}
export function RequireUser({ children }: { children: ReactNode }) { const { db } = useDb(); return db.user ? <>{children}</> : <Navigate to="/login" replace /> }
export function Inbox({ meId, who }: { meId: string; who: 'buyer' | 'seller' }) {
  const { db, up } = useDb(); const mine = db.threads.filter(t => (who === 'buyer' ? t.buyerId : t.sellerId) === meId)
  const [sel, setSel] = useState(mine[0]?.id ?? ''); const [text, setText] = useState('')
  const t = mine.find(x => x.id === sel), msgs = db.msgs.filter(x => x.thread === sel)
  const send = (e: FormEvent) => { e.preventDefault(); if (!t || !text.trim()) return; const to = who === 'buyer' ? t.sellerId : t.buyerId
    up(d => ({ ...d, msgs: [...d.msgs, { id: uid(), thread: t.id, from: meId, text: text.trim().slice(0, 2000), at: now() }], notes: [{ id: uid(), to, text: `New message: ${t.subject}`, at: now() }, ...d.notes] })); setText('') }
  if (!mine.length) return <Empty text="No conversations yet. Use Message seller on a product page to start one." />
  return <div className="grid gap-3 md:grid-cols-[240px_1fr]"><ul className="space-y-2">{mine.map(x => <li key={x.id}><button onClick={() => setSel(x.id)} className={`w-full rounded-xl border p-3 text-left text-sm ${sel === x.id ? 'border-forest bg-white' : 'border-charcoal/10 bg-white/60'}`}><b>{who === 'buyer' ? x.seller : x.buyer}</b><br />{x.subject}</button></li>)}</ul>
    <Card>{t && <><ul className="max-h-80 space-y-2 overflow-y-auto" aria-live="polite">{msgs.map(x => <li key={x.id} className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${x.from === meId ? 'ml-auto bg-forest text-white' : 'bg-cream'}`}>{x.text}</li>)}</ul>
      <form onSubmit={send} className="mt-3 flex gap-2"><input className="input" value={text} onChange={e => setText(e.target.value)} placeholder="Write a message" aria-label="Message" /><button className="btn btn-forest">Send</button></form></>}</Card></div>
}
