'use client';

import { useState, useMemo } from 'react';

interface Product {
  id: number;
  name: string;
  cut: string;
  marbleScore: number;
  weight: string;
  pricePerKg: number;
  description: string;
  color: string;
}

interface CartItem {
  product: Product;
  quantity: number;
  weightKg: number;
}

const products: Product[] = [
  { id: 1, name: 'Wagyu Ribeye', cut: 'Ribeye', marbleScore: 9, weight: '1kg', pricePerKg: 899, description: 'Intensely marbled, melt-in-your-mouth perfection. BMS 9+.', color: 'bg-red-900/60' },
  { id: 2, name: 'Striploin', cut: 'Striploin', marbleScore: 7, weight: '1kg', pricePerKg: 749, description: 'Rich flavour with beautiful fat distribution.', color: 'bg-rose-900/60' },
  { id: 3, name: 'Brisket', cut: 'Brisket', marbleScore: 4, weight: '1kg', pricePerKg: 399, description: 'Perfect for low-and-slow smoking. Full packer cut.', color: 'bg-amber-900/60' },
  { id: 4, name: 'Picanha', cut: 'Picanha', marbleScore: 6, weight: '1kg', pricePerKg: 549, description: 'The king of Brazilian cuts. Fat cap intact.', color: 'bg-orange-900/60' },
  { id: 5, name: 'Fillet', cut: 'Fillet', marbleScore: 5, weight: '1kg', pricePerKg: 999, description: 'The most tender cut. Centre-cut portions.', color: 'bg-red-800/60' },
  { id: 6, name: 'T-bone', cut: 'T-bone', marbleScore: 5, weight: '1kg', pricePerKg: 699, description: 'Two steaks in one. Strip and tenderloin together.', color: 'bg-stone-800/60' },
  { id: 7, name: 'Boerewors', cut: 'Sausage', marbleScore: 3, weight: '1kg', pricePerKg: 189, description: 'Authentic South African sausage. Coarse-ground.', color: 'bg-yellow-900/60' },
  { id: 8, name: 'Lamb Chops', cut: 'Lamb', marbleScore: 4, weight: '1kg', pricePerKg: 449, description: 'Tender loin chops. Perfect on the braai.', color: 'bg-pink-900/60' },
  { id: 9, name: 'Tomahawk Steak', cut: 'Ribeye', marbleScore: 6, weight: '1.2kg', pricePerKg: 899, description: 'Show-stopping bone-in ribeye.', color: 'bg-red-950/60' },
  { id: 10, name: 'Wagyu Cheek', cut: 'Other', marbleScore: 8, weight: '500g', pricePerKg: 449, description: 'Melt-in-your-mouth braising cut.', color: 'bg-rose-950/60' },
  { id: 11, name: 'Short Rib Plate', cut: 'Other', marbleScore: 6, weight: '2kg', pricePerKg: 399, description: 'Cross-cut short ribs, great for Korean BBQ.', color: 'bg-amber-950/60' },
  { id: 12, name: 'Wagyu Brisket', cut: 'Brisket', marbleScore: 7, weight: '1kg', pricePerKg: 599, description: 'Wagyu brisket for competition-level BBQ.', color: 'bg-orange-950/60' },
];

const cutTypes = ['All', 'Ribeye', 'Striploin', 'Brisket', 'Picanha', 'Fillet', 'T-bone', 'Sausage', 'Lamb', 'Other'];
const marbleRanges = ['All', '3-5', '6-7', '8-10'];
const VAT_RATE = 0.15;

export default function StorePage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [filterCut, setFilterCut] = useState('All');
  const [filterMarble, setFilterMarble] = useState('All');

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (filterCut !== 'All' && p.cut !== filterCut) return false;
      if (filterMarble !== 'All') {
        const [min, max] = filterMarble.split('-').map(Number);
        if (p.marbleScore < min || p.marbleScore > max) return false;
      }
      return true;
    });
  }, [filterCut, filterMarble]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.product.id === product.id);
      if (existing) {
        return prev.map((c) => c.product.id === product.id ? { ...c, quantity: c.quantity + 1, weightKg: c.weightKg + 1 } : c);
      }
      return [...prev, { product, quantity: 1, weightKg: 1 }];
    });
    setCartOpen(true);
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((c) => c.product.id !== productId));
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart((prev) => {
      return prev.map((c) => {
        if (c.product.id !== productId) return c;
        const newQty = c.weightKg + delta;
        if (newQty <= 0) return c;
        return { ...c, quantity: newQty, weightKg: newQty };
      }).filter(c => c.weightKg > 0);
    });
  };

  const subtotal = cart.reduce((s, c) => s + c.product.pricePerKg * c.weightKg, 0);
  const vat = Math.round(subtotal * VAT_RATE);
  const total = subtotal + vat;

  const checkoutWhatsApp = () => {
    const lines = cart.map(c => `- ${c.weightKg}kg ${c.product.name}`);
    const message = `Hi! I'd like to order:\n${lines.join('\n')}\nTotal: R${total.toLocaleString()} (incl. VAT)`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/27XXXXXXXXXX?text=${encoded}`, '_blank');
  };

  const cartCount = cart.reduce((s, c) => s + c.weightKg, 0);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900/50 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Store</h1>
            <p className="text-xs text-gray-500">Premium cuts, delivered fresh</p>
          </div>
          <button
            onClick={() => setCartOpen(!cartOpen)}
            className="relative px-5 py-2.5 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium transition-colors"
          >
            Cart ({cartCount}kg)
            {cart.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-400 rounded-full text-xs flex items-center justify-center font-bold">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8 flex gap-8">
        {/* Filters */}
        <div className="w-56 shrink-0">
          <div className="sticky top-24 space-y-6">
            <div>
              <h3 className="text-sm font-semibold mb-3 text-gray-400 uppercase tracking-wider">Cut Type</h3>
              <div className="space-y-1">
                {cutTypes.map((cut) => (
                  <button
                    key={cut}
                    onClick={() => setFilterCut(cut)}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      filterCut === cut ? 'bg-red-600/20 text-red-400' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                    }`}
                  >
                    {cut}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold mb-3 text-gray-400 uppercase tracking-wider">Marble Score</h3>
              <div className="space-y-1">
                {marbleRanges.map((range) => (
                  <button
                    key={range}
                    onClick={() => setFilterMarble(range)}
                    className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      filterMarble === range ? 'bg-red-600/20 text-red-400' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                    }`}
                  >
                    {range === 'All' ? 'All Scores' : `BMS ${range}`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          <p className="text-sm text-gray-500 mb-6">{filtered.length} products</p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((product) => (
              <div
                key={product.id}
                className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-red-800/50 transition-colors group"
              >
                <div className={`h-40 ${product.color} flex items-center justify-center relative`}>
                  <span className="text-5xl opacity-20 group-hover:opacity-30 transition-opacity select-none">{'\u{1F969}'}</span>
                  <span className="absolute top-3 right-3 text-xs px-2 py-0.5 rounded-full bg-amber-900/60 text-amber-300 border border-amber-700/40 font-medium">
                    BMS {product.marbleScore}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="font-semibold text-sm">{product.name}</h3>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{product.description}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-red-400">R{product.pricePerKg.toLocaleString()}</span>
                      <span className="text-xs text-gray-500 ml-1">/kg</span>
                    </div>
                    <button
                      onClick={() => addToCart(product)}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-lg text-xs font-medium transition-colors"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/50" onClick={() => setCartOpen(false)} />
          <div className="relative w-[420px] bg-gray-900 border-l border-gray-800 h-full flex flex-col">
            <div className="p-6 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-lg font-bold">Your Cart</h2>
              <button onClick={() => setCartOpen(false)} className="text-gray-500 hover:text-gray-300 text-2xl leading-none">&times;</button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 && <p className="text-gray-500 text-sm text-center py-8">Your cart is empty</p>}
              {cart.map((item) => (
                <div key={item.product.id} className="bg-gray-800/50 border border-gray-800 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-medium">{item.product.name}</h4>
                      <p className="text-xs text-gray-500">R{item.product.pricePerKg}/kg</p>
                    </div>
                    <button onClick={() => removeFromCart(item.product.id)} className="text-gray-500 hover:text-red-400 text-xs">Remove</button>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium flex items-center justify-center transition-colors"
                      >
                        -
                      </button>
                      <div className="w-16 text-center">
                        <span className="text-sm font-semibold">{item.weightKg}kg</span>
                      </div>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="w-8 h-8 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-medium flex items-center justify-center transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-sm font-bold text-red-400">R{(item.product.pricePerKg * item.weightKg).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div className="p-6 border-t border-gray-800 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Subtotal</span>
                  <span>R{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">VAT (15%)</span>
                  <span>R{vat.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base font-bold pt-3 border-t border-gray-800">
                  <span>Total</span>
                  <span className="text-red-400">R{total.toLocaleString()}</span>
                </div>
                <button
                  onClick={checkoutWhatsApp}
                  className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-semibold text-sm transition-colors mt-2"
                >
                  Checkout via WhatsApp
                </button>
                <p className="text-xs text-gray-600 text-center">
                  Opens WhatsApp with your order summary
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
