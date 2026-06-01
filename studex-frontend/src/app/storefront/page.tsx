'use client';

const featuredProducts = [
  { name: 'Wagyu Ribeye', grade: 'A5', price: 'R1,299', per: '/kg', description: 'Intensely marbled, melt-in-your-mouth perfection. BMS 9+.' },
  { name: 'Wagyu Striploin', grade: 'A4', price: 'R999', per: '/kg', description: 'Rich flavour with beautiful fat distribution. BMS 6-8.' },
  { name: 'Premium Brisket', grade: 'Choice', price: 'R349', per: '/kg', description: 'Perfect for low-and-slow smoking. Full packer cut.' },
  { name: 'Picanha Cap', grade: 'Prime', price: 'R549', per: '/kg', description: 'The king of Brazilian cuts. Fat cap intact.' },
];

const reasons = [
  { title: 'Marble Score Graded', desc: 'Every cut graded on the Japanese BMS scale. You know exactly what you are getting.' },
  { title: 'Direct Sourcing', desc: 'We work directly with Wagyu breeders across South Africa. No middlemen, better prices.' },
  { title: 'Cold Chain Delivery', desc: 'Vacuum-sealed and shipped in insulated packaging. Arrives fresh, every time.' },
  { title: 'Cut to Order', desc: 'Custom portioning available. Tell us the thickness, weight, and trim you need.' },
];

export default function StorefrontPage() {
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
            <a
              href="/store"
              className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold text-sm transition-colors"
            >
              Shop Now
            </a>
            <a
              href="https://wa.me/27600000000?text=Hi%20Studex%20Meat%2C%20I%27d%20like%20to%20place%20an%20order"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 border border-gray-700 hover:border-gray-500 rounded-lg font-semibold text-sm transition-colors"
            >
              WhatsApp Order
            </a>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-6xl mx-auto px-8 py-20">
        <h2 className="text-3xl font-bold mb-2">Featured Cuts</h2>
        <p className="text-gray-500 mb-10">Hand-selected for exceptional quality and flavour.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <div
              key={product.name}
              className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-red-800/50 transition-colors group"
            >
              <div className="h-48 bg-gray-800 flex items-center justify-center">
                <div className="text-6xl opacity-20 group-hover:opacity-30 transition-opacity">🥩</div>
              </div>
              <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{product.name}</h3>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/30 text-red-400 border border-red-800/30">
                    {product.grade}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-4">{product.description}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-red-400">{product.price}</span>
                  <span className="text-xs text-gray-500">{product.per}</span>
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

      {/* CTA */}
      <section className="border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-8 py-20 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Order?</h2>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Whether you are a restaurant, butchery, or just someone who appreciates exceptional meat,
            we have got you covered. Reach out for wholesale pricing or place your order online.
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/store"
              className="px-8 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold text-sm transition-colors"
            >
              Browse Our Store
            </a>
            <a
              href="mailto:orders@studexmeat.com"
              className="px-8 py-3 border border-gray-700 hover:border-gray-500 rounded-lg font-semibold text-sm transition-colors"
            >
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
