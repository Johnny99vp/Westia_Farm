import { FormEvent, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { notify, now, uid, useDb, useProducts } from '../lib/db'
import { COUNTRIES, CURRENCIES } from '../data'
import { ProductCard } from '../components/ProductCard'
const Field = ({ id, label, ...r }: { id: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) => <div><label className="label" htmlFor={id}>{label}</label><input id={id} name={id} className="input" {...r} /></div>
function Page({ title, children, narrow = true }: { title: string; children: React.ReactNode; narrow?: boolean }) {
  return <div className={`mx-auto px-4 py-10 ${narrow ? 'max-w-xl' : 'max-w-4xl'}`}><h1 className="mb-4 text-2xl sm:text-3xl">{title}</h1>{children}</div>
}
export function Login() {
  const { db, up } = useDb(); const nav = useNavigate(); const [email, setEmail] = useState(''); const [msg, setMsg] = useState('')
  const submit = (e: FormEvent) => { e.preventDefault(); const u = db.users.find(x => x.email.toLowerCase() === email.trim().toLowerCase()) // demo: no password check. Production: supabase.auth.signInWithPassword
    if (!u) return setMsg('No account with that email in this demo. Create an account first.'); up(d => ({ ...d, user: u })); nav('/account') }
  return <Page title="Log in"><form onSubmit={submit} className="space-y-4 rounded-2xl bg-white p-4 sm:p-5"><Field id="email" label="Email address" type="email" required autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} />
    <Field id="password" label="Password" type="password" autoComplete="current-password" /><button className="btn btn-forest w-full">Log in</button>
    {msg && <p role="alert" className="text-sm text-red-700">{msg}</p>}<p className="text-xs text-charcoal/60">Demo mode: accounts are stored in this browser only and passwords are not checked.</p><p className="text-sm">New here? <Link className="underline" to="/register">Create an account</Link></p></form></Page>
}
export function Register() {
  const { up } = useDb(); const nav = useNavigate(); const [country, setCountry] = useState('NG'); const [f, setF] = useState({ name: '', email: '', phone: '' }); const c = COUNTRIES.find(x => x.code === country)!
  const submit = (e: FormEvent) => { e.preventDefault(); const u = { id: 'u-' + uid(), name: f.name.slice(0, 80), email: f.email.trim(), country, phone: `${c.dial} ${f.phone}`.trim(), admin: false } // production: supabase.auth.signUp + email verification
    up(d => d.users.some(x => x.email.toLowerCase() === u.email.toLowerCase()) ? d : { ...d, users: [...d.users, u], user: u }); nav('/account') }
  return <Page title="Create your account"><form onSubmit={submit} className="space-y-4 rounded-2xl bg-white p-4 sm:p-5">
    <Field id="name" label="Full name" required value={f.name} onChange={e => setF({ ...f, name: e.target.value })} /><Field id="email" label="Email address" type="email" required value={f.email} onChange={e => setF({ ...f, email: e.target.value })} />
    <div><label className="label" htmlFor="country">Country</label><select id="country" className="input" value={country} onChange={e => setCountry(e.target.value)}>{COUNTRIES.map(x => <option key={x.code} value={x.code}>{x.name}</option>)}</select></div>
    <div className="flex gap-2"><div className="w-24"><label className="label" htmlFor="dial">Code</label><input id="dial" className="input" value={c.dial} readOnly /></div><div className="flex-1"><Field id="phone" label="Phone number" type="tel" required value={f.phone} onChange={e => setF({ ...f, phone: e.target.value })} /></div></div>
    <div className="grid grid-cols-2 gap-3"><Field id="region" label="State or region" /><Field id="city" label="City" /></div><Field id="postal" label="Postal code (if applicable)" />
    <fieldset><legend className="label">I am a (choose all that apply)</legend><div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">{['Farmer', 'Agricultural supplier', 'Buyer', 'Wholesaler', 'Retailer', 'Processor', 'Distributor', 'Importer/exporter', 'Company'].map(t => <label key={t} className="flex gap-2"><input type="checkbox" />{t}</label>)}</div></fieldset>
    <div className="grid grid-cols-2 gap-3"><div><label className="label" htmlFor="lang">Language</label><select id="lang" className="input"><option>English</option></select></div>
      <div><label className="label" htmlFor="cur">Currency</label><select id="cur" className="input" defaultValue={c.currency} key={c.currency}>{Object.keys(CURRENCIES).map(k => <option key={k}>{k}</option>)}</select></div></div>
    <Field id="pw" label="Password" type="password" minLength={10} required autoComplete="new-password" /><button className="btn btn-forest w-full">Create account</button>
    <p className="text-xs text-charcoal/60">Demo mode: the account is saved in this browser only. You can buy and sell with the same account.</p></form></Page>
}
export function Sell() {
  return <Page title="Sell on Westia" narrow={false}><p className="max-w-2xl">Farmers, suppliers and agribusinesses can sell on the marketplace after verification. You use the same account for buying and selling.</p>
    <ol className="mt-6 grid gap-3 md:grid-cols-4">{['Create an account', 'Set up your store', 'Submit verification documents for your country', 'Publish listings after approval'].map((s, i) => <li key={s} className="rounded-lg bg-white p-4 text-sm"><b className="text-forest">Step {i + 1}</b><br />{s}</li>)}</ol>
    <p className="mt-4 text-sm text-charcoal/70">Required documents depend on your country and business type. Subscription plans and commissions are set by Westia Farm.</p>
    <Link to="/register" className="btn btn-gold mt-5">Get started</Link></Page>
}
export function Wholesale() {
  const PRODUCTS = useProducts()
  return <Page title="Wholesale and bulk trading" narrow={false}><p className="max-w-2xl">Bulk prices, minimum order quantities and quotations for produce, inputs and machinery.</p>
    <Link to="/rfq" className="btn btn-forest mt-4">Request a quotation</Link>
    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{PRODUCTS.filter(p => p.wholesaleMinor).map(p => <ProductCard key={p.id} p={p} />)}</div></Page>
}
export function Rfq() {
  const [sp] = useSearchParams(); const PRODUCTS = useProducts(); const { db, up } = useDb(); const nav = useNavigate(); const prod = PRODUCTS.find(p => p.id === sp.get('product'))
  const [f, setF] = useState({ item: prod?.title ?? '', qty: '', unit: prod?.unit ?? '', dest: 'Nigeria', date: '', notes: '' })
  if (!db.user) return <Page title="Request a quotation"><p className="rounded-2xl bg-white p-5 text-sm">Please <Link className="underline" to="/login">log in</Link> or <Link className="underline" to="/register">create an account</Link> to request quotations.</p></Page>
  const submit = (e: FormEvent) => { e.preventDefault(); const u = db.user!
    up(d => { let n = { ...d, rfqs: [{ id: 'RFQ-' + uid().toUpperCase(), buyerId: u.id, buyer: u.name, item: f.item.slice(0, 120), qty: Number(f.qty), unit: f.unit, dest: f.dest, date: f.date, notes: f.notes.slice(0, 1000), status: 'open' as const, quotes: [], won: '' }, ...d.rfqs] }
      d.shops.filter(s => s.status === 'approved').forEach(s => { n = notify(n, s.id, `New quotation request: ${f.item}`) }); return n }); nav('/account/quotes') }
  const set = (k: string, v: string) => setF({ ...f, [k]: v })
  return <Page title="Request a quotation"><form onSubmit={submit} className="space-y-4 rounded-2xl bg-white p-4 sm:p-5">
    <Field id="item" label="What do you need?" required value={f.item} onChange={e => set('item', e.target.value)} />
    <div className="grid grid-cols-2 gap-3"><Field id="qty" label="Quantity" type="number" min="1" required value={f.qty} onChange={e => set('qty', e.target.value)} /><Field id="unit" label="Unit" required value={f.unit} onChange={e => set('unit', e.target.value)} /></div>
    <div><label className="label" htmlFor="dest">Delivery country</label><select id="dest" className="input" value={f.dest} onChange={e => set('dest', e.target.value)}>{COUNTRIES.map(c => <option key={c.code}>{c.name}</option>)}</select></div>
    <Field id="date" label="Preferred delivery date" type="date" value={f.date} onChange={e => set('date', e.target.value)} /><div><label className="label" htmlFor="notes">Requirements</label><textarea id="notes" className="input" rows={3} value={f.notes} onChange={e => set('notes', e.target.value)} /></div>
    <button className="btn btn-forest w-full">Send request</button></form></Page>
}
