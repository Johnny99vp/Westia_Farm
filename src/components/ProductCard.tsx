import { useState } from 'react'
import { Link } from 'react-router-dom'
import { BadgeCheck, Heart, Plus, Check } from 'lucide-react'
import { Product } from '../data'
import { useStore } from '../lib/store'
import { convert, fmt } from '../lib/money'
export function Price({ minor, from }: { minor: number; from: string }) {
  const { currency } = useStore()
  return <span>{fmt(convert(minor, from, currency), currency)}{currency !== from && <span className="ml-1 text-xs text-charcoal/60" title={`Listed at ${fmt(minor, from)}. Converted price is indicative.`}>≈</span>}</span>
}
export function ProductCard({ p }: { p: Product }) {
  const { wish, toggleWish, add } = useStore(); const [done, setDone] = useState(false)
  return (<article className="flex flex-col overflow-hidden rounded-2xl border border-charcoal/10 bg-white">
    <div className="relative"><Link to={`/products/${p.id}`}><img src={p.img} alt={p.title} loading="lazy" className="aspect-[4/3] w-full object-cover" /></Link>
      <button onClick={() => toggleWish(p.id)} aria-label="Save to wishlist" className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-white"><Heart className={`h-4 w-4 ${wish.includes(p.id) ? 'fill-red-600 text-red-600' : ''}`} /></button>
      {p.wholesaleMinor && <span className="absolute left-2 top-2 rounded-full bg-gold px-2 py-0.5 text-[11px] font-semibold">Bulk price</span>}</div>
    <div className="flex flex-1 flex-col p-3"><Link to={`/products/${p.id}`} className="line-clamp-2 text-sm font-medium leading-snug">{p.title}</Link>
      <p className="mt-1 text-base font-semibold text-forest"><Price minor={p.priceMinor} from={p.listCurrency} /><span className="text-xs font-normal text-charcoal/70"> / {p.unit}</span></p>
      <p className="text-xs text-charcoal/70">Min. order {p.moq} {p.unit}</p>
      <p className="mt-1 flex items-center gap-1 text-xs">{p.seller}{p.verified && <BadgeCheck className="h-4 w-4 shrink-0 text-forest" aria-label="Verified seller" />}</p>
      <p className="text-xs text-charcoal/60">{p.city}, {p.country}</p>
      <button className="btn btn-forest mt-3 w-full !py-2" onClick={() => { add(p.id, p.moq); setDone(true); setTimeout(() => setDone(false), 1500) }}>{done ? <><Check className="h-4 w-4" />Added</> : <><Plus className="h-4 w-4" />Add</>}</button></div></article>)
}
