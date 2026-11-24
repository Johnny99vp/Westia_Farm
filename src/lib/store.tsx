import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
type Line = { id: string; qty: number }
type Ctx = { cart: Line[]; wish: string[]; currency: string; country: string; setCurrency: (c: string) => void; setCountry: (c: string) => void
  add: (id: string, qty: number) => void; setQty: (id: string, qty: number) => void; remove: (id: string) => void; clear: () => void; toggleWish: (id: string) => void }
const C = createContext<Ctx>(null!)
const load = <T,>(k: string, d: T): T => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d } catch { return d } }
const save = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)) } catch { /* storage unavailable */ } }
export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Line[]>(() => load('cart', []))
  const [wish, setWish] = useState<string[]>(() => load('wish', []))
  const [currency, setCurrency] = useState(() => load('currency', 'NGN'))
  const [country, setCountry] = useState(() => load('country', 'NG'))
  useEffect(() => save('cart', cart), [cart]); useEffect(() => save('wish', wish), [wish])
  useEffect(() => save('currency', currency), [currency]); useEffect(() => save('country', country), [country])
  const add = (id: string, qty: number) => setCart(c => c.some(l => l.id === id) ? c.map(l => l.id === id ? { ...l, qty: l.qty + qty } : l) : [...c, { id, qty }])
  const setQty = (id: string, qty: number) => setCart(c => c.map(l => l.id === id ? { ...l, qty: Math.max(1, qty) } : l))
  const remove = (id: string) => setCart(c => c.filter(l => l.id !== id))
  const clear = () => setCart([])
  const toggleWish = (id: string) => setWish(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id])
  return <C.Provider value={{ cart, wish, currency, country, setCurrency, setCountry, add, setQty, remove, clear, toggleWish }}>{children}</C.Provider>
}
export const useStore = () => useContext(C)
