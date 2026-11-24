import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Heart, Home, Menu, Search, ShoppingCart, User, X, Instagram, Mail, Phone, MapPin, Store, FileText } from 'lucide-react'
import { COUNTRIES, CURRENCIES, LOGO } from '../data'
import { useStore } from '../lib/store'
import { useDb } from '../lib/db'

const links = [['/products?kind=input', 'Farm inputs'], ['/products?kind=produce', 'Farm produce'], ['/wholesale', 'Wholesale'], ['/rfq', 'Request a quote'], ['/sell', 'Sell on Westia'], ['/seller', 'Seller centre'], ['/wishlist', 'Wishlist']]
const Badge = ({ n }: { n: number }) => n > 0 ? <b className="absolute -right-1 -top-1 min-w-4 rounded-full bg-gold px-1 text-center text-[10px] text-charcoal">{n}</b> : null
export function Layout() {
  const { cart, wish, currency, country, setCurrency, setCountry } = useStore(); const { db } = useDb()
  const [menu, setMenu] = useState(false); const [q, setQ] = useState(''); const go = useNavigate()
  const count = cart.reduce((s, l) => s + 1, 0)
  const tab = ({ isActive }: { isActive: boolean }) => `relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] ${isActive ? 'font-semibold text-forest' : 'text-charcoal/70'}`
  return (<>
    <header className="sticky top-0 z-30 bg-forest text-white">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-3 py-2 md:gap-4 md:px-4">
        <button className="p-2 md:hidden" aria-label="Open menu" onClick={() => setMenu(true)}><Menu /></button>
        <Link to="/" className="flex shrink-0 items-center gap-2"><img src={LOGO} alt="" className="h-9 w-9 rounded-full bg-white p-0.5" /><span className="font-display text-base font-semibold sm:text-lg">Westia AgroMarket</span></Link>
        <nav className="ml-4 hidden gap-5 text-sm md:flex" aria-label="Main">{links.slice(0, 6).map(([to, l]) => <NavLink key={to} to={to} className="hover:text-gold">{l}</NavLink>)}</nav>
        <div className="ml-auto flex items-center gap-1 text-sm">
          <select aria-label="Country" value={country} onChange={e => { setCountry(e.target.value); setCurrency(COUNTRIES.find(c => c.code === e.target.value)!.currency) }} className="hidden max-w-32 rounded-full bg-white/10 px-2 py-1.5 lg:block">{COUNTRIES.map(c => <option key={c.code} className="text-charcoal" value={c.code}>{c.name}</option>)}</select>
          <select aria-label="Currency" value={currency} onChange={e => setCurrency(e.target.value)} className="rounded-full bg-white/10 px-2 py-1.5">{Object.keys(CURRENCIES).map(c => <option key={c} className="text-charcoal">{c}</option>)}</select>
          <Link to="/wishlist" aria-label="Wishlist" className="relative hidden p-2 md:block"><Heart className="h-5 w-5" /><Badge n={wish.length} /></Link>
          <Link to="/cart" aria-label="Cart" className="relative p-2"><ShoppingCart className="h-5 w-5" /><Badge n={count} /></Link>
          <Link to={db.user ? '/account' : '/login'} className="btn btn-gold ml-1 hidden !min-h-9 !py-1.5 md:inline-flex">{db.user ? 'My account' : 'Sign up / Log in'}</Link></div></div>
      <form className="px-3 pb-3 md:mx-auto md:max-w-3xl" role="search" onSubmit={e => { e.preventDefault(); go(`/products?q=${encodeURIComponent(q)}`) }}>
        <div className="relative"><Search className="absolute left-4 top-3 h-5 w-5 text-charcoal/50" />
          <input value={q} onChange={e => setQ(e.target.value)} placeholder="Search maize, fertilizer, tractors or sellers" aria-label="Search products" className="min-h-11 w-full rounded-full py-2 pl-12 pr-4 text-base text-charcoal md:text-sm" /></div></form>
    </header>
    {menu && <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true" aria-label="Menu"><div className="absolute inset-0 bg-black/50" onClick={() => setMenu(false)} />
      <aside className="absolute inset-y-0 left-0 flex w-72 max-w-[85%] flex-col bg-white p-4"><button className="self-end p-2" aria-label="Close menu" onClick={() => setMenu(false)}><X /></button>
        <ul className="mt-2 divide-y text-base">{links.map(([to, l]) => <li key={to}><Link onClick={() => setMenu(false)} to={to} className="block py-3">{l}</Link></li>)}</ul>
        <Link to="/login" onClick={() => setMenu(false)} className="btn btn-forest mt-6">Sign up / Log in</Link>
        <label className="mt-6 text-sm" htmlFor="mc">Country</label><select id="mc" className="input mt-1" value={country} onChange={e => { setCountry(e.target.value); setCurrency(COUNTRIES.find(c => c.code === e.target.value)!.currency) }}>{COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.name}</option>)}</select></aside></div>}
    <main className="min-h-[60vh] pb-20 md:pb-0"><Outlet /></main>
    <footer className="bg-charcoal pb-20 text-white/80 md:mt-16 md:pb-0">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-4">
        <div className="sm:col-span-2 md:col-span-1"><div className="flex items-center gap-2"><img src={LOGO} alt="" className="h-9 w-9 rounded-full bg-white p-0.5" /><span className="font-display text-lg text-white">Westia Farm</span></div>
          <p className="mt-3 text-sm">Growing Food. Building Enterprise. Creating the Future.</p>
          <div className="mt-4 flex gap-4 text-sm"><a href="https://www.instagram.com/westiafarm" target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-gold"><Instagram className="h-4 w-4" />Instagram</a><a href="https://www.tiktok.com/@westiafarm" target="_blank" rel="noreferrer" className="hover:text-gold">TikTok</a></div></div>
        <div><h3 className="font-sans text-sm font-semibold text-gold">Shop</h3><ul className="mt-3 space-y-2 text-sm"><li><Link to="/products?kind=input">Farm inputs</Link></li><li><Link to="/products?kind=produce">Farm produce</Link></li><li><Link to="/wholesale">Wholesale</Link></li><li><Link to="/rfq">Request a quote</Link></li></ul></div>
        <div><h3 className="font-sans text-sm font-semibold text-gold">Westia</h3><ul className="mt-3 space-y-2 text-sm"><li><Link to="/sell">Sell on Westia</Link></li><li><a href="https://westiafarm.vercel.app">Corporate website</a></li></ul></div>
        <div><h3 className="font-sans text-sm font-semibold text-gold">Contact</h3><ul className="mt-3 space-y-2 text-sm">
          <li className="flex gap-2"><Mail className="h-4 w-4 shrink-0" /><a href="mailto:Westiafarm@gmail.com">Westiafarm@gmail.com</a></li><li className="flex gap-2"><Phone className="h-4 w-4 shrink-0" /><a href="tel:+2347011841749">+234 701 184 1749</a></li>
          <li className="flex gap-2"><MapPin className="h-4 w-4 shrink-0" />Ibadan, Oyo State, Nigeria</li><li><a className="text-gold" href="https://wa.me/2347011841749">Chat on WhatsApp</a></li></ul></div></div>
      <p className="border-t border-white/10 py-4 text-center text-xs">© 2026 Westia Farm. All rights reserved.</p></footer>
    <nav className="safe-b fixed inset-x-0 bottom-0 z-30 flex border-t border-charcoal/10 bg-white md:hidden" aria-label="Tabs">
      <NavLink to="/" end className={tab}><Home className="h-5 w-5" />Home</NavLink><NavLink to="/products" className={tab}><Store className="h-5 w-5" />Shop</NavLink>
      <NavLink to="/rfq" className={tab}><FileText className="h-5 w-5" />Quote</NavLink>
      <NavLink to="/cart" className={tab}><span className="relative"><ShoppingCart className="h-5 w-5" /><Badge n={count} /></span>Cart</NavLink><NavLink to="/account" className={tab}><User className="h-5 w-5" />You</NavLink></nav></>)
}
