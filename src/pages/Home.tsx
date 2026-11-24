import { Link } from 'react-router-dom'
import { Sprout, FlaskConical, Bug, Wrench, Tractor, Droplets, Beef, Wheat, Carrot, Apple, Coffee, Package, FileText, ShieldCheck, Truck, Globe } from 'lucide-react'
import { CATEGORIES } from '../data'
import { useProducts } from '../lib/db'
import { ProductCard } from '../components/ProductCard'
const icons: Record<string, typeof Sprout> = { seeds: Sprout, fertilizers: FlaskConical, pesticides: Bug, tools: Wrench, machinery: Tractor, irrigation: Droplets, feeds: Beef, grains: Wheat, roots: Carrot, vegetables: Apple, 'cash-crops': Coffee, processed: Package }
const Section = ({ title, items, to }: { title: string; items: ReturnType<typeof useProducts>; to: string }) => (
  <section className="mx-auto max-w-7xl px-4 pt-8 md:pt-12"><div className="mb-3 flex items-end justify-between"><h2 className="text-xl md:text-2xl">{title}</h2><Link to={to} className="py-2 text-sm font-semibold text-forest underline">See all</Link></div>
    <div className="row">{items.slice(0, 8).map(p => <ProductCard key={p.id} p={p} />)}</div></section>)
export function Home() {
  const PRODUCTS = useProducts()
  const sellers = [...new Map(PRODUCTS.filter(p => p.verified).map(p => [p.seller, p])).values()]
  return (<>
    <section className="relative overflow-hidden bg-forest text-white">
      <img src="https://westiafarm.vercel.app/images/original-maize-field.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
      <div className="relative mx-auto max-w-7xl px-4 py-12 md:py-24"><h1 className="max-w-3xl text-3xl leading-tight !text-white sm:text-4xl md:text-5xl">Your Global Agricultural Marketplace. Buy Smart. Sell Better. Grow Bigger.</h1>
        <p className="mt-4 max-w-2xl text-base text-white/90 md:text-lg">Connect with trusted agricultural suppliers, farmers and buyers. Source quality farm inputs and trade agricultural produce across borders.</p>
        <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap"><Link to="/products?kind=input" className="btn btn-gold">Buy Farm Inputs</Link><Link to="/products?kind=produce" className="btn bg-white text-forest hover:bg-cream">Buy Farm Produce</Link><Link to="/sell" className="btn border border-white text-white hover:bg-white/10">Sell on Westia</Link></div></div></section>
    <section className="mx-auto max-w-7xl px-4 pt-6" aria-label="Categories"><div className="row !gap-2 md:!flex md:flex-wrap">{CATEGORIES.map(c => { const I = icons[c.slug]; return (
      <Link key={c.slug} to={`/products?cat=${c.slug}`} className="!w-auto flex items-center gap-2 rounded-full border border-charcoal/10 bg-white px-4 py-2.5 text-sm hover:border-forest"><I className="h-4 w-4 text-forest" />{c.name}</Link>) })}</div></section>
    <section className="mx-auto mt-8 grid max-w-7xl gap-3 px-4 md:grid-cols-2 md:mt-10">
      <div className="relative overflow-hidden rounded-2xl bg-gold p-6"><h2 className="text-xl text-charcoal md:text-2xl">Buying in bulk? Get quotes from verified sellers</h2><p className="mt-2 text-sm">Tell us what you need, how much and where it goes. Sellers send you offers to compare.</p><Link to="/rfq" className="btn btn-forest mt-4">Request a quote</Link></div>
      <div className="rounded-2xl bg-forest p-6 text-white"><h2 className="text-xl !text-white md:text-2xl">Sell your harvest or farm supplies</h2><p className="mt-2 text-sm text-white/90">One account to buy and sell. Sellers are verified before listings go live.</p><Link to="/sell" className="btn btn-gold mt-4">Start selling</Link></div></section>
    <Section title="Featured farm inputs" items={PRODUCTS.filter(p => p.kind === 'input')} to="/products?kind=input" />
    <Section title="Fresh from farmers" items={PRODUCTS.filter(p => p.kind === 'produce')} to="/products?kind=produce" />
    <Section title="Wholesale deals" items={PRODUCTS.filter(p => p.wholesaleMinor)} to="/wholesale" />
    <section className="mx-auto max-w-7xl px-4 pt-10"><h2 className="mb-3 text-xl md:text-2xl">Verified suppliers</h2>
      <ul className="flex flex-wrap gap-2">{sellers.map(s => <li key={s.seller} className="flex items-center gap-2 rounded-full border border-charcoal/10 bg-white px-4 py-2 text-sm"><ShieldCheck className="h-4 w-4 text-forest" />{s.seller}<span className="text-xs text-charcoal/60">{s.city}</span></li>)}</ul></section>
    <section className="mx-auto mt-10 grid max-w-7xl gap-3 px-4 sm:grid-cols-3">{[[Globe, 'Trade across borders', 'Prices in your currency; shipping where available.'], [FileText, 'Quotes for large orders', 'Compare offers from sellers.'], [Truck, 'Delivery your way', 'Seller delivery, pickup or logistics partners.']].map(([I, t, d]) => { const Ic = I as typeof Globe; return (
      <div key={t as string} className="rounded-2xl bg-white p-4"><Ic className="h-6 w-6 text-forest" /><h3 className="mt-2 font-sans text-base font-semibold">{t as string}</h3><p className="text-sm text-charcoal/70">{d as string}</p></div>) })}</section></>)
}
