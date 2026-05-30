'use client';

import { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Minus,
  X,
  Filter,
  Search,
  ShoppingBag,
  Phone,
  MessageCircle,
} from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

interface Product {
  id: number;
  name: string;
  price: number;
  category: 'steaks' | 'grinds' | 'speciality' | 'ankole';
  collection: 'wagyu' | 'ankole';
  marbleScore?: number;
  unit: string;
  isSpecial?: boolean;
}

interface CartItem {
  product: Product;
  quantity: number;
}

// ── Product data ─────────────────────────────────────────────────────────────

const products: Product[] = [
  // Wagyu Steaks
  { id: 1, name: 'Wagyu Fillet', price: 632.5, category: 'steaks', collection: 'wagyu', marbleScore: 7, unit: '/kg' },
  { id: 2, name: 'Wagyu Rib-eye', price: 699.0, category: 'steaks', collection: 'wagyu', marbleScore: 7, unit: '/kg' },
  { id: 3, name: 'Wagyu Rump', price: 530.0, category: 'steaks', collection: 'wagyu', marbleScore: 6, unit: '/kg' },
  { id: 4, name: 'Wagyu Picanha', price: 625.0, category: 'steaks', collection: 'wagyu', marbleScore: 6, unit: '' },
  { id: 5, name: 'Wagyu T-bone', price: 632.5, category: 'steaks', collection: 'wagyu', marbleScore: 6, unit: '/kg' },
  { id: 6, name: 'Wagyu Sirloin', price: 699.0, category: 'steaks', collection: 'wagyu', marbleScore: 7, unit: '/kg' },
  { id: 7, name: 'Wagyu Tomahawk', price: 159.99, category: 'steaks', collection: 'wagyu', marbleScore: 5, unit: '/kg' },
  { id: 8, name: 'Wagyu Tomahawk Frenched', price: 164.99, category: 'steaks', collection: 'wagyu', marbleScore: 5, unit: '' },
  { id: 9, name: 'Wagyu Tri-tip', price: 549.99, category: 'steaks', collection: 'wagyu', marbleScore: 5, unit: '' },
  { id: 10, name: 'Wagyu Bavette', price: 349.99, category: 'steaks', collection: 'wagyu', marbleScore: 5, unit: '' },
  { id: 11, name: 'Wagyu Chuckeye', price: 249.99, category: 'steaks', collection: 'wagyu', marbleScore: 4, unit: '/kg' },
  { id: 12, name: 'Wagyu Denver', price: 345.0, category: 'steaks', collection: 'wagyu', marbleScore: 5, unit: '' },
  { id: 13, name: 'American Tomahawk', price: 205.85, category: 'steaks', collection: 'wagyu', unit: '' },
  { id: 14, name: 'Lamb Rib/Loin Chops', price: 239.99, category: 'steaks', collection: 'wagyu', unit: '' },

  // Wagyu Grinds
  { id: 15, name: 'Wagyu Mince', price: 179.99, category: 'grinds', collection: 'wagyu', unit: '/kg' },
  { id: 16, name: 'Wagyu Boerewors', price: 175.0, category: 'grinds', collection: 'wagyu', unit: '/kg' },
  { id: 17, name: 'Wagyu Patties', price: 149.99, category: 'grinds', collection: 'wagyu', unit: '2x200g' },

  // Wagyu Speciality
  { id: 18, name: 'Wagyu Biltong', price: 500.0, category: 'speciality', collection: 'wagyu', unit: '/kg' },
  { id: 19, name: 'Wagyu Droewors', price: 350.0, category: 'speciality', collection: 'wagyu', unit: '' },
  { id: 20, name: 'de Lange Free Range Biltong', price: 450.0, category: 'speciality', collection: 'wagyu', unit: '' },
  { id: 21, name: 'Windpomp Wagyu Droewors', price: 350.0, category: 'speciality', collection: 'wagyu', unit: '' },

  // Specials
  { id: 22, name: 'SPECIAL Wagyu Rib-eye', price: 699.0, category: 'steaks', collection: 'wagyu', marbleScore: 7, unit: '/kg', isSpecial: true },
  { id: 23, name: 'SPECIAL Wagyu Chuckeye', price: 249.99, category: 'steaks', collection: 'wagyu', marbleScore: 4, unit: '/kg', isSpecial: true },

  // Ankole
  { id: 24, name: 'Ankole Fillet', price: 688.85, category: 'ankole', collection: 'ankole', marbleScore: 3, unit: '' },
  { id: 25, name: 'Ankole Rump', price: 573.85, category: 'ankole', collection: 'ankole', unit: '' },
  { id: 26, name: 'Ankole Sirloin', price: 573.85, category: 'ankole', collection: 'ankole', unit: '' },
  { id: 27, name: 'Ankole Ribeye', price: 688.85, category: 'ankole', collection: 'ankole', marbleScore: 3, unit: '' },
  { id: 28, name: 'Ankole Mince', price: 205.85, category: 'ankole', collection: 'ankole', unit: '' },
  { id: 29, name: 'Ankole Boerewors', price: 205.85, category: 'ankole', collection: 'ankole', unit: '' },
  { id: 30, name: 'Ankole Droewors', price: 493.35, category: 'ankole', collection: 'ankole', unit: '' },
  { id: 31, name: 'Ankole 200g Gourmet Patties', price: 217.35, category: 'ankole', collection: 'ankole', unit: '' },
  { id: 32, name: 'Ankole Espetada', price: 562.35, category: 'ankole', collection: 'ankole', unit: '' },
  { id: 33, name: 'Ankole Biltong', price: 527.85, category: 'ankole', collection: 'ankole', unit: '' },
  { id: 34, name: 'Ankole 1kg T-Bone', price: 573.85, category: 'ankole', collection: 'ankole', unit: '' },
  { id: 35, name: 'Ankole 1kg Tomahawk', price: 499.0, category: 'ankole', collection: 'ankole', unit: '' },
];

type CategoryFilter = 'all' | 'steaks' | 'grinds' | 'speciality' | 'ankole';

const categoryLabels: Record<CategoryFilter, string> = {
  all: 'All',
  steaks: 'Steaks',
  grinds: 'Grinds',
  speciality: 'Speciality',
  ankole: 'Ankole',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(amount: number): string {
  return `R${amount.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ── Page Component ───────────────────────────────────────────────────────────

export default function StorePage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Cart helpers
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity + delta }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const vatAmount = subtotal * (15 / 115); // VAT is already included
  const total = subtotal;

  // Filtering
  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // WhatsApp order
  const buildWhatsAppMessage = () => {
    if (cart.length === 0) return '';
    let msg = 'Hi, I would like to place an order:\n\n';
    cart.forEach((item) => {
      msg += `- ${item.product.name} x${item.quantity} @ ${formatPrice(item.product.price)} = ${formatPrice(item.product.price * item.quantity)}\n`;
    });
    msg += `\nSubtotal (incl. VAT): ${formatPrice(total)}`;
    msg += `\nVAT (15%): ${formatPrice(vatAmount)}`;
    msg += `\nTotal: ${formatPrice(total)}`;
    msg += '\n\nPlease confirm availability. Thank you!';
    return encodeURIComponent(msg);
  };

  const whatsappUrl = `https://wa.me/27000000000?text=${buildWhatsAppMessage()}`;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF8F0' }}>
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <header className="relative overflow-hidden">
        {/* Subtle decorative line */}
        <div
          className="absolute top-0 left-0 right-0 h-[1px]"
          style={{ backgroundColor: '#D4A017', opacity: 0.4 }}
        />

        <div className="max-w-7xl mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="flex flex-col items-center text-center">
            {/* Japanese decorative element */}
            <div className="flex items-center gap-4 mb-8">
              <div
                className="w-12 h-[1px]"
                style={{ backgroundColor: '#D4A017' }}
              />
              <span
                className="text-xs tracking-[0.4em] uppercase"
                style={{ color: '#8B6914' }}
              >
                Premium Selection
              </span>
              <div
                className="w-12 h-[1px]"
                style={{ backgroundColor: '#D4A017' }}
              />
            </div>

            <h1
              className="text-5xl md:text-7xl lg:text-8xl font-light tracking-[0.15em] mb-4"
              style={{ color: '#1a1a1a' }}
            >
              STUDEX
            </h1>
            <h2
              className="text-2xl md:text-3xl lg:text-4xl font-extralight tracking-[0.3em] mb-8"
              style={{ color: '#D4A017' }}
            >
              MEAT
            </h2>

            <p
              className="max-w-xl text-sm md:text-base font-light leading-relaxed tracking-wide"
              style={{ color: '#666' }}
            >
              Wagyu and Ankole beef, carefully sourced and delivered to your
              table. Every cut tells a story of heritage, craft, and
              uncompromising quality.
            </p>

            {/* Japanese decorative dot */}
            <div
              className="mt-10 w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: '#D4A017' }}
            />
          </div>
        </div>

        {/* Bottom decorative line */}
        <div
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-[1px]"
          style={{ backgroundColor: '#D4A017', opacity: 0.5 }}
        />
      </header>

      {/* ── Sticky toolbar ────────────────────────────────────────────── */}
      <div
        className="sticky top-0 z-30 border-b backdrop-blur-md"
        style={{
          backgroundColor: 'rgba(255,248,240,0.92)',
          borderColor: 'rgba(212,160,23,0.15)',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: '#999' }}
            />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-none border bg-white/60 focus:outline-none focus:border-[#D4A017] transition-colors"
              style={{
                borderColor: 'rgba(212,160,23,0.2)',
                color: '#1a1a1a',
              }}
            />
          </div>

          {/* Filter toggle (mobile) */}
          <button
            onClick={() => setFiltersOpen(!filtersOpen)}
            className="md:hidden p-2.5 border transition-colors"
            style={{
              borderColor: 'rgba(212,160,23,0.2)',
              color: activeCategory !== 'all' ? '#D4A017' : '#666',
            }}
            aria-label="Toggle filters"
          >
            <Filter size={18} />
          </button>

          {/* Cart button */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative p-2.5 border transition-colors hover:border-[#D4A017]"
            style={{ borderColor: 'rgba(212,160,23,0.2)', color: '#1a1a1a' }}
            aria-label="Open cart"
          >
            <ShoppingCart size={18} />
            {cartCount > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 w-5 h-5 flex items-center justify-center text-[10px] font-medium rounded-full text-white"
                style={{ backgroundColor: '#D4A017' }}
              >
                {cartCount}
              </span>
            )}
          </button>
        </div>

        {/* Category filters - desktop always visible, mobile toggle */}
        <div
          className={`${filtersOpen ? 'block' : 'hidden'} md:block border-t`}
          style={{ borderColor: 'rgba(212,160,23,0.1)' }}
        >
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-1 overflow-x-auto">
            {(Object.keys(categoryLabels) as CategoryFilter[]).map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setActiveCategory(cat);
                  setFiltersOpen(false);
                }}
                className="px-5 py-2 text-xs tracking-[0.15em] uppercase whitespace-nowrap transition-all"
                style={{
                  backgroundColor:
                    activeCategory === cat ? '#D4A017' : 'transparent',
                  color: activeCategory === cat ? '#fff' : '#666',
                }}
              >
                {categoryLabels[cat]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Product grid ──────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-6 py-12 md:py-16">
        {/* Collection header when filtering Ankole */}
        {activeCategory === 'ankole' && (
          <div className="mb-12 text-center">
            <span
              className="text-xs tracking-[0.4em] uppercase"
              style={{ color: '#8B6914' }}
            >
              Heritage Breed
            </span>
            <h3
              className="text-3xl font-light tracking-[0.1em] mt-2"
              style={{ color: '#1a1a1a' }}
            >
              Ankole Collection
            </h3>
          </div>
        )}

        {activeCategory !== 'ankole' && activeCategory !== 'all' && (
          <div className="mb-12 text-center">
            <span
              className="text-xs tracking-[0.4em] uppercase"
              style={{ color: '#8B6914' }}
            >
              Wagyu Selection
            </span>
            <h3
              className="text-3xl font-light tracking-[0.1em] mt-2"
              style={{ color: '#1a1a1a' }}
            >
              {categoryLabels[activeCategory]}
            </h3>
          </div>
        )}

        {filteredProducts.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag
              size={40}
              className="mx-auto mb-4"
              style={{ color: '#ccc' }}
            />
            <p className="text-sm" style={{ color: '#999' }}>
              No products found.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                className="group bg-white border relative transition-all duration-300 hover:shadow-lg"
                style={{
                  borderColor: 'rgba(212,160,23,0.12)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor =
                    'rgba(212,160,23,0.4)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.borderColor =
                    'rgba(212,160,23,0.12)';
                }}
              >
                {/* Special badge */}
                {product.isSpecial && (
                  <div
                    className="absolute top-0 left-0 px-3 py-1 text-[10px] tracking-[0.2em] uppercase text-white"
                    style={{ backgroundColor: '#D4A017' }}
                  >
                    Special
                  </div>
                )}

                {/* Product image placeholder - minimal abstract pattern */}
                <div
                  className="relative h-44 flex items-center justify-center overflow-hidden"
                  style={{ backgroundColor: '#FEFAF4' }}
                >
                  {/* Abstract marbling pattern */}
                  <div className="absolute inset-0 opacity-[0.04]">
                    <div
                      className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full"
                      style={{
                        background:
                          'radial-gradient(ellipse, #D4A017 0%, transparent 70%)',
                      }}
                    />
                    <div
                      className="absolute bottom-1/4 right-1/4 w-24 h-24 rounded-full"
                      style={{
                        background:
                          'radial-gradient(ellipse, #8B6914 0%, transparent 70%)',
                      }}
                    />
                  </div>

                  {/* Collection label */}
                  <span
                    className="text-[10px] tracking-[0.3em] uppercase font-light"
                    style={{ color: '#bbb' }}
                  >
                    {product.collection === 'wagyu' ? 'Wagyu' : 'Ankole'}
                  </span>

                  {/* Marble score badge */}
                  {product.marbleScore && (
                    <div
                      className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center border"
                      style={{
                        borderColor: 'rgba(212,160,23,0.3)',
                        color: '#D4A017',
                      }}
                    >
                      <span className="text-[10px] font-medium">
                        M{product.marbleScore}
                      </span>
                    </div>
                  )}
                </div>

                {/* Product info */}
                <div className="p-5">
                  <h4
                    className="text-sm font-medium tracking-wide leading-snug mb-1"
                    style={{ color: '#1a1a1a' }}
                  >
                    {product.name}
                  </h4>

                  {product.unit && (
                    <span
                      className="text-[11px] tracking-wide"
                      style={{ color: '#aaa' }}
                    >
                      {product.unit}
                    </span>
                  )}

                  <div className="flex items-end justify-between mt-4">
                    <span
                      className="text-lg font-light"
                      style={{ color: '#1a1a1a' }}
                    >
                      {formatPrice(product.price)}
                    </span>

                    <button
                      onClick={() => addToCart(product)}
                      className="p-2 border transition-all duration-200 hover:text-white"
                      style={{
                        borderColor: 'rgba(212,160,23,0.3)',
                        color: '#D4A017',
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#D4A017';
                        (e.currentTarget as HTMLButtonElement).style.borderColor = '#D4A017';
                        (e.currentTarget as HTMLButtonElement).style.color = '#fff';
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                        (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(212,160,23,0.3)';
                        (e.currentTarget as HTMLButtonElement).style.color = '#D4A017';
                      }}
                      aria-label={`Add ${product.name} to cart`}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* VAT notice */}
        <div className="mt-16 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div
              className="w-8 h-[1px]"
              style={{ backgroundColor: '#D4A017', opacity: 0.4 }}
            />
            <span
              className="text-[11px] tracking-[0.3em] uppercase"
              style={{ color: '#999' }}
            >
              All prices include 15% VAT
            </span>
            <div
              className="w-8 h-[1px]"
              style={{ backgroundColor: '#D4A017', opacity: 0.4 }}
            />
          </div>
        </div>
      </main>

      {/* ── Cart overlay ──────────────────────────────────────────────── */}
      {cartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/20 backdrop-blur-sm"
            onClick={() => setCartOpen(false)}
          />

          {/* Cart panel */}
          <div
            className="relative w-full max-w-md h-full overflow-y-auto border-l flex flex-col"
            style={{
              backgroundColor: '#FFF8F0',
              borderColor: 'rgba(212,160,23,0.15)',
            }}
          >
            {/* Cart header */}
            <div
              className="sticky top-0 z-10 px-6 py-5 flex items-center justify-between border-b"
              style={{
                backgroundColor: 'rgba(255,248,240,0.95)',
                borderColor: 'rgba(212,160,23,0.15)',
              }}
            >
              <div className="flex items-center gap-3">
                <ShoppingBag size={18} style={{ color: '#D4A017' }} />
                <h3
                  className="text-sm tracking-[0.15em] uppercase font-medium"
                  style={{ color: '#1a1a1a' }}
                >
                  Your Order
                </h3>
                {cartCount > 0 && (
                  <span
                    className="text-[11px] px-2 py-0.5"
                    style={{ color: '#D4A017' }}
                  >
                    {cartCount} {cartCount === 1 ? 'item' : 'items'}
                  </span>
                )}
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="p-1 transition-colors"
                style={{ color: '#999' }}
                aria-label="Close cart"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cart items */}
            <div className="flex-1 px-6 py-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <ShoppingCart
                    size={36}
                    className="mb-4"
                    style={{ color: '#ddd' }}
                  />
                  <p
                    className="text-sm font-light"
                    style={{ color: '#999' }}
                  >
                    Your cart is empty.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="flex items-start gap-4 py-4 border-b"
                      style={{ borderColor: 'rgba(212,160,23,0.1)' }}
                    >
                      {/* Item info */}
                      <div className="flex-1 min-w-0">
                        <h4
                          className="text-sm font-medium leading-snug mb-0.5"
                          style={{ color: '#1a1a1a' }}
                        >
                          {item.product.name}
                        </h4>
                        <span
                          className="text-xs"
                          style={{ color: '#999' }}
                        >
                          {formatPrice(item.product.price)} each
                        </span>
                      </div>

                      {/* Quantity controls */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, -1)
                          }
                          className="w-7 h-7 flex items-center justify-center border transition-colors hover:border-[#D4A017]"
                          style={{ borderColor: 'rgba(212,160,23,0.2)' }}
                          aria-label="Decrease quantity"
                        >
                          <Minus size={12} style={{ color: '#666' }} />
                        </button>
                        <span
                          className="w-6 text-center text-sm"
                          style={{ color: '#1a1a1a' }}
                        >
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(item.product.id, 1)
                          }
                          className="w-7 h-7 flex items-center justify-center border transition-colors hover:border-[#D4A017]"
                          style={{ borderColor: 'rgba(212,160,23,0.2)' }}
                          aria-label="Increase quantity"
                        >
                          <Plus size={12} style={{ color: '#666' }} />
                        </button>
                      </div>

                      {/* Line total + remove */}
                      <div className="flex flex-col items-end gap-1">
                        <span
                          className="text-sm font-medium"
                          style={{ color: '#1a1a1a' }}
                        >
                          {formatPrice(item.product.price * item.quantity)}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-[11px] transition-colors hover:text-[#D4A017]"
                          style={{ color: '#ccc' }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart footer */}
            {cart.length > 0 && (
              <div
                className="sticky bottom-0 px-6 py-6 border-t"
                style={{
                  backgroundColor: 'rgba(255,248,240,0.98)',
                  borderColor: 'rgba(212,160,23,0.15)',
                }}
              >
                {/* Totals */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#999' }}>Subtotal (incl. VAT)</span>
                    <span style={{ color: '#1a1a1a' }}>
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: '#999' }}>VAT (15%)</span>
                    <span style={{ color: '#999' }}>
                      {formatPrice(vatAmount)}
                    </span>
                  </div>
                  <div
                    className="flex justify-between text-base font-medium pt-2 border-t"
                    style={{ borderColor: 'rgba(212,160,23,0.15)' }}
                  >
                    <span style={{ color: '#1a1a1a' }}>Total</span>
                    <span style={{ color: '#D4A017' }}>
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-3 py-3.5 text-sm tracking-[0.1em] uppercase text-white transition-all duration-200 hover:opacity-90"
                  style={{ backgroundColor: '#D4A017' }}
                >
                  <MessageCircle size={16} />
                  Order via WhatsApp
                </a>

                <a
                  href="tel:+27000000000"
                  className="w-full flex items-center justify-center gap-3 py-3 mt-3 text-sm tracking-[0.1em] uppercase border transition-colors hover:border-[#D4A017]"
                  style={{
                    borderColor: 'rgba(212,160,23,0.3)',
                    color: '#666',
                  }}
                >
                  <Phone size={14} />
                  Call to Order
                </a>

                <p
                  className="text-center text-[10px] mt-4 tracking-wide"
                  style={{ color: '#bbb' }}
                >
                  All prices include 15% VAT
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer
        className="border-t"
        style={{ borderColor: 'rgba(212,160,23,0.12)' }}
      >
        <div className="max-w-7xl mx-auto px-6 py-12 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div
              className="w-8 h-[1px]"
              style={{ backgroundColor: '#D4A017', opacity: 0.3 }}
            />
            <span
              className="text-xs tracking-[0.3em] uppercase font-light"
              style={{ color: '#bbb' }}
            >
              Studex Global Markets
            </span>
            <div
              className="w-8 h-[1px]"
              style={{ backgroundColor: '#D4A017', opacity: 0.3 }}
            />
          </div>
          <p
            className="text-[11px] tracking-wide"
            style={{ color: '#ccc' }}
          >
            Premium Wagyu &amp; Ankole Beef -- South Africa
          </p>
        </div>
      </footer>
    </div>
  );
}
