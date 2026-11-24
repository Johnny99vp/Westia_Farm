import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { useProducts } from '../lib/db'
import { useStore } from '../lib/store'
import { convert, fmt } from '../lib/money'
export function Cart() {
  const PRODUCTS = useProducts()
  const { cart, setQty, remove, currency } = useStore()
  const lines = cart.flatMap(l => { const p = PRODUCTS.find(x => x.id === l.id); return p ? [{ ...l, p }] : [] })
  const bySeller = lines.reduce<Record<string, typeof lines>>((a, l) => ((a[l.p.seller] ??= []).push(l), a), {})
  const total = lines.reduce((s, l) => s + convert(l.p.priceMinor * l.qty, l.p.listCurrency, currency), 0)
  if (!lines.length) return <p className="p-10 text-center">Your cart is empty. <Link className="underline" to="/products">Browse products</Link>.</p>
  return (<div className="mx-auto max-w-4xl px-4 py-6 pb-52 md:pb-8"><h1 className="text-2xl">Cart</h1>
    {Object.entries(bySeller).map(([seller, ls]) => <section key={seller} className="mt-5 rounded-2xl border border-charcoal/10 bg-white p-4"><h2 className="font-sans text-base">Sold by {seller}</h2>
      <ul className="divide-y">{ls.map(l => <li key={l.id} className="flex flex-wrap items-center gap-3 py-3 text-sm"><img src={l.p.img} alt="" className="h-14 w-14 rounded object-cover" />
        <span className="min-w-40 flex-1">{l.p.title}</span><input aria-label="Quantity" type="number" min={l.p.moq} value={l.qty} onChange={e => setQty(l.id, Number(e.target.value))} className="input w-20" />
        <b>{fmt(convert(l.p.priceMinor * l.qty, l.p.listCurrency, currency), currency)}</b><button aria-label="Remove" onClick={() => remove(l.id)}><Trash2 className="h-4 w-4" /></button></li>)}</ul></section>)}
    <div className="safe-b fixed inset-x-0 bottom-16 z-20 border-t bg-white p-4 md:static md:mt-5 md:rounded-2xl md:border-0"><p className="flex justify-between text-lg"><span>Items subtotal (indicative)</span><b>{fmt(total, currency)}</b></p>
      <p className="mt-1 text-xs text-charcoal/60">Shipping is shown separately at checkout. The amount charged is confirmed by the server in the payment currency, using the exchange rate shown at that time.</p>
      <Link to="/checkout" className="btn btn-forest mt-3 w-full">Checkout</Link></div></div>)
}
