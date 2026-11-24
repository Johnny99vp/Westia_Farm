import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { RequireUser } from './components/ui'
import { Home } from './pages/Home'
import { Catalog, ProductDetail, Wishlist } from './pages/Catalog'
import { Cart } from './pages/Cart'
import { Checkout } from './pages/Checkout'
import { Login, Register, Rfq, Sell, Wholesale } from './pages/Forms'
import { Account } from './pages/Account'
import { Seller } from './pages/Seller'
import { Admin } from './pages/Admin'
const G = ({ c }: { c: JSX.Element }) => <RequireUser>{c}</RequireUser>
export default function App() {
  return (<Routes><Route element={<Layout />}>
    <Route index element={<Home />} /><Route path="products" element={<Catalog />} /><Route path="products/:id" element={<ProductDetail />} />
    <Route path="wishlist" element={<Wishlist />} /><Route path="cart" element={<Cart />} /><Route path="checkout" element={<G c={<Checkout />} />} /><Route path="wholesale" element={<Wholesale />} />
    <Route path="rfq" element={<Rfq />} /><Route path="sell" element={<Sell />} /><Route path="login" element={<Login />} /><Route path="register" element={<Register />} />
    <Route path="account/:tab?" element={<G c={<Account />} />} /><Route path="seller/:tab?" element={<G c={<Seller />} />} /><Route path="admin/:tab?" element={<G c={<Admin />} />} />
    <Route path="*" element={<p className="p-10 text-center">Page not found.</p>} /></Route></Routes>)
}
