'use client';

const products = [
  { name: 'Wagyu Ribeye', price: 899, grade: 'A5', marble: 9, color: 'bg-red-900/60', desc: 'Intensely marbled, melt-in-your-mouth perfection. BMS 9+.' },
  { name: 'Striploin', price: 749, grade: 'A4', marble: 7, color: 'bg-rose-900/60', desc: 'Rich flavour with beautiful fat distribution. BMS 6-8.' },
  { name: 'Brisket', price: 399, grade: 'Choice', marble: 4, color: 'bg-amber-900/60', desc: 'Perfect for low-and-slow smoking. Full packer cut.' },
  { name: 'Picanha', price: 549, grade: 'Prime', marble: 6, color: 'bg-orange-900/60', desc: 'The king of Brazilian cuts. Fat cap intact.' },
  { name: 'Fillet', price: 999, grade: 'Prime', marble: 5, color: 'bg-red-800/60', desc: 'The most tender cut. Centre-cut portions.' },
  { name: 'T-bone', price: 699, grade: 'Choice', marble: 5, color: 'bg-stone-800/60', desc: 'Two steaks in one. Strip and tenderloin together.' },
  { name: 'Boerewors', price: 189, grade: 'Traditional', marble: 3, color: 'bg-yellow-900/60', desc: 'Authentic South African sausage. Coarse-ground beef and spices.' },
  { name: 'Lamb Chops', price: 449, grade: 'Premium', marble: 4, color: 'bg-pink-900/60', desc: 'Tender loin chops. Perfect on the braai or pan-seared.' },
];

const testimonials = [
  { name: 'Johan V.', role: 'Head Chef, Flames Restaurant', text: 'The Wagyu quality is consistently outstanding. Our customers keep coming back for the ribeye.' },
  { name: 'Sarah M.', role: 'Home Cook, Sandton', text: 'Same-day delivery and the meat arrives vacuum-sealed and ice cold. Truly premium service.' },
  { name: 'Thabo K.', role: 'Owner, Smoke & Bones BBQ', text: 'Their brisket is competition-grade. Best supplier in Gauteng, hands down.' },
];

const deliveryAreas = [
  'Sandton', 'Rosebank', 'Parkhurst', 'Greenside', 'Melville',
  'Bryanston', 'Fourways', 'Midrand', 'Centurion', 'Pretoria East',
  'Randburg', 'Roodepoort',
];

const reasons = [
  { title: 'Marble Score Graded', desc: 'Every cut graded on the Japanese BMS scale. You know exactly what you are getting.' },
  { title: 'Direct Sourcing', desc: 'We work directly with Wagyu breeders across South Africa. No middlemen, better prices.' },
  { title: 'Cold Chain Delivery', desc: 'Vacuum-sealed and shipped in insulated packaging. Arrives fresh, every time.' },
  { title: 'Cut to Order', desc: 'Custom portioning available. Tell us the thickness, weight, and trim you need.' },
];

export default function StorefrontPage() {
  const orderViaWhatsApp = (productName: string) => {
    const msg = encodeURIComponent(`Hi Studex Meat! I'd like to order ${productName}. Can you help me with availability and pricing?`);
    window.open(`https://wa.me/27XXXXXXXXXX?text=${msg}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-950/40 via-gray-950 to-gray-950" />
        <div className="relative max-w-6xl mx-auto px-8 py-32 text-center">
          <div className="inline-block px-4 py-1.5 rounded-full bg-red-900/30 border border-red-800/40 text-red-400 text-xs font-medium mb-6">
            South Africa&apos;s Premium Meat Supplier
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            Premium Wagyu &<br />
            <span className="text-red-500">Quality Meats</span>
          </h1>
          <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto">
            From A5 Wagyu to heritage-breed brisket. Marble-score graded, vacuum-sealed,
            and delivered to restaurants, butcheries, and discerning home cooks across Gauteng.
          </p>
          <div className="mt-10 flex gap-4 justify-center">
            <a href="/store" className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold text-sm transition-colors">
              Shop Now
            </a>
            <button
              onClick={() => orderViaWhatsApp('premium cuts')}
              className="px-8 py-3 border border-gray-700 hover:border-green-600 rounded-lg font-semibold text-sm transition-colors"
            >
              WhatsApp Order
            </button>
          </div>
        </div>
      </section>

      {/* Product Showcase */}
      <section className="max-w-6xl mx-auto px-8 py-20">
        <h2 className="text-3xl font-bold mb-2">Our Cuts</h2>
        <p className="text-gray-500 mb-10">Hand-selected for exceptional quality and flavour.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div
              key={product.name}
              className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-red-800/50 transition-colors group"
            >
              <div className={`h-48 ${product.color} flex items-center justify-center relative`}>
                <span className="text-6xl opacity-30 group-hover:opacity-50 transition-opacity select-none">
                  {product.name === 'Lamb Chops' ? '\u{1F969}' : '\u{1F969}'}
                </span>
                <span className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full bg-amber-900/60 text-amber-300 border border-amber-700/40 font-medium">
                  BMS {product.marble}
                </span>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{product.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/30 text-red-400 border border-red-800/30">
                    {product.grade}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-4 line-clamp-2">{product.desc}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold text-red-400">R{product.price}</span>
                    <span className="text-xs text-gray-500">/kg</span>
                  </div>
                  <button
                    onClick={() => orderViaWhatsApp(product.name)}
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 rounded-lg text-xs font-medium transition-colors"
                  >
                    Order via WhatsApp
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Studex Meat */}
      <section className="border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-8 py-20">
          <h2 className="text-3xl font-bold mb-2">Why Studex Meat</h2>
          <p className="text-gray-500 mb-10">What sets us apart from every other supplier.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reasons.map((reason) => (
              <div key={reason.title} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <h3 className="font-semibold text-lg mb-2">{reason.title}</h3>
                <p className="text-sm text-gray-400">{reason.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-8 py-20">
          <h2 className="text-3xl font-bold mb-2">What Our Customers Say</h2>
          <p className="text-gray-500 mb-10">Trusted by restaurants, butcheries, and home cooks.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                <p className="text-sm text-gray-300 mb-4 leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery Info */}
      <section className="border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-8 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl font-bold mb-4">Same-Day Delivery</h2>
              <p className="text-gray-400 mb-6">
                Order before 11:00 AM and receive your premium cuts the same day.
                All deliveries are vacuum-sealed and shipped in insulated packaging with ice packs
                to maintain cold chain integrity.
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-900/40 flex items-center justify-center">
                    <span className="text-green-400 text-xs font-bold">R0</span>
                  </div>
                  <p className="text-sm text-gray-300">Free delivery on orders over R2,000</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-900/40 flex items-center justify-center">
                    <span className="text-blue-400 text-xs font-bold">24h</span>
                  </div>
                  <p className="text-sm text-gray-300">Next-day delivery for orders after 11:00 AM</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-900/40 flex items-center justify-center">
                    <span className="text-purple-400 text-xs font-bold">B2B</span>
                  </div>
                  <p className="text-sm text-gray-300">Weekly scheduled deliveries for restaurants</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Delivery Areas (Johannesburg &amp; Pretoria)</h3>
              <div className="flex flex-wrap gap-2">
                {deliveryAreas.map(area => (
                  <span key={area} className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg text-xs text-gray-400">
                    {area}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-600 mt-4">
                Don&apos;t see your area? Contact us -- we may still be able to deliver to you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-8 py-20 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Order?</h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Whether you are a restaurant, butchery, or just someone who appreciates exceptional meat,
            we have got you covered. Reach out for wholesale pricing or place your order online.
          </p>
          <div className="flex gap-4 justify-center">
            <a href="/store" className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold text-sm transition-colors">
              Browse Our Store
            </a>
            <a href="mailto:orders@studexmeat.com" className="px-8 py-3 border border-gray-700 hover:border-gray-500 rounded-lg font-semibold text-sm transition-colors">
              orders@studexmeat.com
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 bg-gray-900/30">
        <div className="max-w-6xl mx-auto px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center font-bold text-sm">SM</div>
                <span className="font-bold">Studex Meat</span>
              </div>
              <p className="text-sm text-gray-500">Premium Wagyu and quality meats. Gauteng, South Africa.</p>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Contact</h4>
              <div className="space-y-1 text-sm text-gray-500">
                <p>orders@studexmeat.com</p>
                <p>+27 60 000 0000</p>
                <p>WhatsApp available</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-3">Hours</h4>
              <div className="space-y-1 text-sm text-gray-500">
                <p>Mon - Fri: 07:00 - 17:00</p>
                <p>Sat: 08:00 - 13:00</p>
                <p>Sun: Closed</p>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-xs text-gray-600 text-center">
            Studex Meat (Pty) Ltd. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
