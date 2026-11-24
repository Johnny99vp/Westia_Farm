import { useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { SlidersHorizontal } from 'lucide-react'
import { BadgeCheck } from 'lucide-react'
import { CATEGORIES } from '../data'
import { notify, now, uid, useDb, useProducts } from '../lib/db'
import { Price, ProductCard } from '../components/ProductCard'
import { useStore } from '../lib/store'
export function Catalog() {
  const PRODUCTS = useProducts()
  const [sp, setSp] = useSearchParams(); const q = (sp.get('q') ?? '').toLowerCase(), cat = sp.get('cat') ?? '', kind = sp.get('kind') ?? ''
  const [show, setShow] = useState(false); const [verified, setVerified] = useState(false); const [maxMoq, setMaxMoq] = useState('')
  const set = (k: string, v: string) => { const n = new URLSearchParams(sp); v ? n.set(k, v) : n.delete(k); setSp(n) }
  const items = PRODUCTS.filter(p => (!q || `${p.title} ${p.seller} ${p.city}`.toLowerCase().includes(q)) && (!cat || p.category === cat) && (!kind || p.kind === kind)
    && (!verified || p.verified) && (!maxMoq || p.moq <= Number(maxMoq)))
  return (<div className="mx-auto grid max-w-7xl gap-4 px-4 py-5 md:grid-cols-[220px_1fr] md:gap-6 md:py-8">
    <div className="md:col-span-2"><h1 className="text-2xl">Products</h1>
      <div className="row !gap-2 mt-3 md:!flex md:flex-wrap">{[["", "All"], ...CATEGORIES.map(c => [c.slug, c.name])].map(([v, n]) => <button key={v} onClick={() => set("cat", v)} className={`!w-auto whitespace-nowrap rounded-full border px-4 py-2 text-sm ${cat === v ? "border-forest bg-forest text-white" : "border-charcoal/15 bg-white"}`}>{n}</button>)}</div>
      <button className="btn btn-line mt-3 md:hidden" onClick={() => setShow(!show)} aria-expanded={show}><SlidersHorizontal className="h-4 w-4" />Filters</button></div>
    <aside className={`${show ? "block" : "hidden"} space-y-4 rounded-2xl bg-white p-4 text-sm md:block md:bg-transparent md:p-0`} aria-label="Filters">
      <div><label className="label" htmlFor="q">Search</label><input id="q" className="input" value={sp.get('q') ?? ''} onChange={e => set('q', e.target.value)} /></div>
            <div><label className="label" htmlFor="moq">Minimum order up to</label><input id="moq" type="number" min="1" className="input" value={maxMoq} onChange={e => setMaxMoq(e.target.value)} /></div>
      <label className="flex items-center gap-2"><input type="checkbox" checked={verified} onChange={e => setVerified(e.target.checked)} />Verified sellers only</label></aside>
    <section><p className="mb-3 text-sm text-charcoal/70">{items.length} products</p>
      {items.length ? <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-3">{items.map(p => <ProductCard key={p.id} p={p} />)}</div>
        : <p className="rounded-lg bg-white p-6">No products match these filters. Clear a filter or <Link className="underline" to="/rfq">request a quote</Link>.</p>}</section></div>)
}
export function ProductDetail() {
  const PRODUCTS = useProducts(); const { db, up } = useDb(); const nav = useNavigate(); const { id } = useParams(); const p = PRODUCTS.find(x => x.id === id); const { add } = useStore(); const [qty, setQty] = useState(p?.moq ?? 1); const [added, setAdded] = useState(false)
  if (!p) return <p className="p-10 text-center">Product not found.</p>
  return (<div className="mx-auto grid max-w-6xl gap-5 px-4 py-4 pb-28 md:grid-cols-2 md:gap-8 md:py-8 md:pb-8">
    <img src={p.img} alt={p.title} className="aspect-[4/3] w-full rounded-2xl object-cover" />
    <div><h1 className="text-3xl">{p.title}</h1>
      <p className="mt-2 flex items-center gap-1 text-sm">Sold by {p.seller}{p.verified && <BadgeCheck className="h-4 w-4 text-forest" aria-label="Verified seller" />} · {p.city}, {p.country}</p>
      <p className="mt-4 text-3xl font-semibold text-forest"><Price minor={p.priceMinor} from={p.listCurrency} /> <span className="text-base font-normal">per {p.unit}</span></p>
      {p.wholesaleMinor && <p className="mt-1 text-sm">Wholesale: <b><Price minor={p.wholesaleMinor} from={p.listCurrency} /></b> per {p.unit} for bulk orders. Final price is confirmed at checkout or in a quotation.</p>}
      <p className="mt-3 text-sm">Minimum order: {p.moq} {p.unit} · In stock: {p.stock}</p>
      <div className="safe-b fixed inset-x-0 bottom-16 z-20 flex items-end gap-2 border-t bg-white p-3 md:static md:mt-5 md:border-0 md:bg-transparent md:p-0"><div><label htmlFor="qty" className="label">Quantity ({p.unit})</label>
        <input id="qty" type="number" min={p.moq} max={p.stock} value={qty} onChange={e => setQty(Number(e.target.value))} className="input !w-24" /></div>
        <button className="btn btn-forest" disabled={qty < p.moq || qty > p.stock} onClick={() => { add(p.id, qty); setAdded(true) }}>Add to cart</button>
        <Link to={`/rfq?product=${p.id}`} className="btn btn-line">Request a quote</Link></div>
      {added && <p role="status" className="mt-3 text-sm text-forest">Added to cart. <Link className="underline" to="/cart">View cart</Link></p>}
      <button className="btn btn-line mt-4" onClick={() => { if (!db.user) return nav('/login'); const ex = db.threads.find(t => t.buyerId === db.user!.id && t.sellerId === p.sellerId); if (!ex) up(d => ({ ...d, threads: [...d.threads, { id: uid(), buyerId: d.user!.id, buyer: d.user!.name, sellerId: p.sellerId, seller: p.seller, subject: p.title }] })); nav('/account/messages') }}>Message seller</button>
      <section className="mt-6" aria-label="Reviews"><h2 className="text-lg">Reviews</h2>{db.reviews.filter(r => r.pid === p.id).map(r => <p key={r.id} className="mt-2 text-sm"><b>{r.buyer}</b> (verified purchase) · {'★'.repeat(r.rating)}<br />{r.text}</p>)}{!db.reviews.some(r => r.pid === p.id) && <p className="text-sm text-charcoal/60">No reviews yet. Only buyers with a delivered order can review.</p>}</section>
      <p className="mt-6 text-xs text-charcoal/60">Delivery cost and availability for your country are calculated at checkout. Not every product ships to every country.</p></div></div>)
}
export function Wishlist() {
  const PRODUCTS = useProducts()
  const { wish } = useStore(); const items = PRODUCTS.filter(p => wish.includes(p.id))
  return (<div className="mx-auto max-w-7xl px-4 py-6"><h1 className="text-2xl">Wishlist</h1>
    {items.length ? <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">{items.map(p => <ProductCard key={p.id} p={p} />)}</div>
      : <p className="mt-4">Nothing saved yet. <Link className="underline" to="/products">Browse products</Link>.</p>}</div>)
}
