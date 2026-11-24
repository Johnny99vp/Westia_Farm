// DEMO DATA ONLY. Replace with Supabase queries (products, categories, countries, currencies, exchange_rates).
const img = (n: string) => `https://westiafarm.vercel.app/images/${n}`
export const LOGO = img('westia-farm-logo.png')
export type Product = { id: string; title: string; kind: 'input' | 'produce'; category: string; img: string; priceMinor: number;
  wholesaleMinor?: number; unit: string; moq: number; seller: string; country: string; city: string; verified: boolean; stock: number; listCurrency: string }
export const CATEGORIES = [
  { slug: 'seeds', name: 'Seeds and seedlings', kind: 'input' }, { slug: 'fertilizers', name: 'Fertilizers', kind: 'input' },
  { slug: 'pesticides', name: 'Herbicides and pesticides', kind: 'input' }, { slug: 'tools', name: 'Farm tools', kind: 'input' },
  { slug: 'machinery', name: 'Tractors and machinery', kind: 'input' }, { slug: 'irrigation', name: 'Irrigation equipment', kind: 'input' },
  { slug: 'feeds', name: 'Animal feeds', kind: 'input' }, { slug: 'grains', name: 'Maize, rice and grains', kind: 'produce' },
  { slug: 'roots', name: 'Cassava, yam and potatoes', kind: 'produce' }, { slug: 'vegetables', name: 'Tomatoes, pepper and vegetables', kind: 'produce' },
  { slug: 'cash-crops', name: 'Cocoa, coffee and cotton', kind: 'produce' }, { slug: 'processed', name: 'Processed products', kind: 'produce' },
]
export const CURRENCIES: Record<string, { symbol: string; exp: number; perNgn: number }> = {
  // perNgn values are PLACEHOLDERS for the demo; the real app reads timestamped rows from exchange_rates.
  NGN: { symbol: '₦', exp: 2, perNgn: 1 }, USD: { symbol: '$', exp: 2, perNgn: 0.00065 }, GBP: { symbol: '£', exp: 2, perNgn: 0.0005 },
  EUR: { symbol: '€', exp: 2, perNgn: 0.0006 }, GHS: { symbol: 'GH₵', exp: 2, perNgn: 0.01 }, KES: { symbol: 'KSh', exp: 2, perNgn: 0.085 },
  ZAR: { symbol: 'R', exp: 2, perNgn: 0.012 }, CAD: { symbol: 'C$', exp: 2, perNgn: 0.0009 }, AUD: { symbol: 'A$', exp: 2, perNgn: 0.001 },
}
export const COUNTRIES = [
  { code: 'NG', name: 'Nigeria', dial: '+234', currency: 'NGN' }, { code: 'GH', name: 'Ghana', dial: '+233', currency: 'GHS' },
  { code: 'KE', name: 'Kenya', dial: '+254', currency: 'KES' }, { code: 'ZA', name: 'South Africa', dial: '+27', currency: 'ZAR' },
  { code: 'GB', name: 'United Kingdom', dial: '+44', currency: 'GBP' }, { code: 'US', name: 'United States', dial: '+1', currency: 'USD' },
  { code: 'CA', name: 'Canada', dial: '+1', currency: 'CAD' }, { code: 'AU', name: 'Australia', dial: '+61', currency: 'AUD' },
  { code: 'DE', name: 'Germany', dial: '+49', currency: 'EUR' },
]
const p = (id: string, title: string, kind: 'input' | 'produce', category: string, image: string, price: number, ws: number | undefined,
  unit: string, moq: number, seller: string, city: string, verified: boolean, stock: number): Product =>
  ({ id, title, kind, category, img: img(image), priceMinor: price * 100, wholesaleMinor: ws ? ws * 100 : undefined, unit, moq, seller,
    country: 'NG', city, verified, stock, listCurrency: 'NGN' })
export const PRODUCTS: Product[] = [
  p('p1', 'Maize, freshly harvested', 'produce', 'grains', 'original-maize-cob.jpg', 28000, 25000, 'bag', 1, 'Westia Farm', 'Ibadan', true, 120),
  p('p2', 'Sweet potato, grade A', 'produce', 'roots', 'original-sweet-potato.jpg', 18000, 16000, 'bag', 2, 'Westia Farm', 'Ibadan', true, 60),
  p('p3', 'Tomatoes, fresh crates', 'produce', 'vegetables', 'original-tomato.jpg', 35000, 31000, 'crate', 1, 'Adeola Fresh Produce', 'Oyo', false, 40),
  p('p4', 'Okra, fresh', 'produce', 'vegetables', 'original-okra.jpg', 12000, undefined, 'bag', 1, 'Adeola Fresh Produce', 'Oyo', false, 25),
  p('p5', 'NPK 15-15-15 fertilizer', 'input', 'fertilizers', 'original-protected-bed.jpg', 22000, 20000, '50 kg bag', 5, 'GreenInputs Ltd', 'Lagos', true, 500),
  p('p6', 'Hybrid maize seed', 'input', 'seeds', 'original-maize-field.jpg', 9000, 8000, 'kg', 10, 'GreenInputs Ltd', 'Lagos', true, 300),
]
export const REQS: Record<string, string[]> = { // demo requirements; in production these come from the verification_requirements table, set per country by admins
  NG: ['Government-issued ID (e.g. NIN, passport or driver licence)', 'Business registration certificate, if a registered business', 'Proof of business address', 'Bank account proof'],
  default: ['Government-issued ID', 'Business registration certificate, where applicable', 'Tax identification, where applicable', 'Proof of business address', 'Bank or payout account proof'] }
export const UNITS = ['kg', 'g', 'bag', 'sack', 'tonne', 'litre', 'crate', 'bundle', 'piece', 'lb', 'bushel']
