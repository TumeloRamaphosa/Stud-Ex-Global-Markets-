'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ShoppingBag,
  ArrowRight,
  Star,
  Truck,
  Award,
  Users,
  Instagram,
  Facebook,
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  ChevronDown,
  Beef,
  Heart,
  Send,
  ExternalLink,
  Sparkles,
  Shield,
  Clock,
  Menu,
  X,
} from 'lucide-react';

// ─── Brand Constants ───────────────────────────────────────────────
const GOLD = '#D4A017';
const GOLD_DARK = '#8B6914';
const CREAM = '#FFF8F0';
const INK = '#1a1a1a';
const WHATSAPP_LINK = 'https://wa.me/27000000000';

// ─── Data ──────────────────────────────────────────────────────────
const collections = [
  {
    title: 'WAGYU COLLECTION',
    description: 'Japanese-grade Wagyu beef, marble scores 4-10+',
    href: '/store',
    icon: '🥩',
  },
  {
    title: 'ANKOLE COLLECTION',
    description: "Africa's heritage breed. Leaner, richer, raised on open pastures",
    href: '/store',
    icon: '🥓',
  },
  {
    title: 'BILTONG & DROEWORS',
    description: 'Hand-cut, air-dried perfection. Traditional South African craft',
    href: '/store',
    icon: '🍖',
  },
];

const bestSellers = [
  { name: 'Wagyu Ribeye', price: 699, unit: '/kg', badge: 'Best Seller' },
  { name: 'Wagyu Fillet', price: 632.5, unit: '/kg', badge: 'Premium' },
  { name: 'Ankole Ribeye', price: 688.85, unit: '/kg', badge: 'Popular' },
  { name: 'Wagyu Biltong', price: 500, unit: '/kg', badge: 'Signature' },
  { name: 'Wagyu Boerewors', price: 175, unit: '/kg', badge: null },
  { name: 'Ankole Rump', price: 573.85, unit: '/kg', badge: null },
];

const pillars = [
  {
    icon: Award,
    title: 'Marble Graded',
    description: 'Every cut is graded for marble score. Know exactly what you’re getting.',
  },
  {
    icon: Shield,
    title: 'Farm to Table',
    description: 'Direct from South African farms. No middlemen, no markup.',
  },
  {
    icon: Truck,
    title: 'Next-Day Delivery',
    description: 'Order today, receive tomorrow in Johannesburg. Nationwide within 3 days.',
  },
];

const footerLinks = [
  { label: 'Shop', href: '/store' },
  { label: 'About', href: '#' },
  { label: 'Contact', href: 'mailto:info@studexmeat.com' },
  { label: 'Wholesale', href: '#b2b' },
  { label: 'FAQ', href: '#' },
];

// ─── Helpers ───────────────────────────────────────────────────────
function formatZAR(amount: number): string {
  return `R${amount.toLocaleString('en-ZA', { minimumFractionDigits: amount % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 })}`;
}

// ─── Animation Variants ────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay: i * 0.12, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

// ─── Section Wrapper ───────────────────────────────────────────────
function Section({
  children,
  id,
  className = '',
  bg = 'bg-[#FFF8F0]',
}: {
  children: React.ReactNode;
  id?: string;
  className?: string;
  bg?: string;
}) {
  return (
    <section id={id} className={`${bg} ${className}`}>
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">{children}</div>
    </section>
  );
}

// ─── Gold Divider ──────────────────────────────────────────────────
function GoldDivider({ className = '' }: { className?: string }) {
  return (
    <motion.div
      initial={{ scaleX: 0 }}
      whileInView={{ scaleX: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
      className={`mx-auto h-px w-24 origin-center ${className}`}
      style={{ backgroundColor: GOLD }}
    />
  );
}

// ─── Section Title ─────────────────────────────────────────────────
function SectionTitle({ overline, title, subtitle }: { overline?: string; title: string; subtitle?: string }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={fadeUp}
      className="mb-16 text-center"
    >
      {overline && (
        <p
          className="mb-3 text-xs font-medium uppercase tracking-[0.3em]"
          style={{ color: GOLD }}
        >
          {overline}
        </p>
      )}
      <h2
        className="text-3xl font-light tracking-wide sm:text-4xl lg:text-5xl"
        style={{ color: INK }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-neutral-500 sm:text-lg">
          {subtitle}
        </p>
      )}
      <GoldDivider className="mt-8" />
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════
// MAIN PAGE
// ════════════════════════════════════════════════════════════════════
export default function StorefrontPage() {
  const [email, setEmail] = useState('');
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const navBg = useTransform(scrollY, [0, 80], ['rgba(255,248,240,0)', 'rgba(255,248,240,0.97)']);
  const navShadow = useTransform(scrollY, [0, 80], ['0 0 0 rgba(0,0,0,0)', '0 1px 12px rgba(0,0,0,0.06)']);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) setEmailSubmitted(true);
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: CREAM, scrollBehavior: 'smooth' }}>
      {/* ─── Sticky Nav ─────────────────────────────────────────── */}
      <motion.nav
        style={{ backgroundColor: navBg, boxShadow: navShadow }}
        className="fixed left-0 right-0 top-0 z-50 backdrop-blur-md"
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 sm:px-8 lg:px-12">
          <Link href="/storefront" className="flex items-center gap-2">
            <span
              className="text-lg font-semibold tracking-[0.25em]"
              style={{ color: INK }}
            >
              STUDEX
            </span>
            <span
              className="text-lg font-light tracking-[0.25em]"
              style={{ color: GOLD }}
            >
              MEAT
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-8 md:flex">
            {['Shop', 'Collections', 'Wholesale'].map((item) => (
              <Link
                key={item}
                href={item === 'Shop' ? '/store' : item === 'Wholesale' ? '#b2b' : '#collections'}
                className="text-sm font-medium tracking-widest text-neutral-500 transition-colors hover:text-neutral-900"
              >
                {item.toUpperCase()}
              </Link>
            ))}
            <Link
              href="/store"
              className="flex items-center gap-2 rounded-none border px-5 py-2 text-xs font-medium tracking-widest transition-all"
              style={{ borderColor: GOLD, color: GOLD }}
            >
              <ShoppingBag size={14} />
              SHOP NOW
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} style={{ color: INK }} /> : <Menu size={22} style={{ color: INK }} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-t border-neutral-200 px-6 py-6 md:hidden"
            style={{ backgroundColor: CREAM }}
          >
            <div className="flex flex-col gap-5">
              {['Shop', 'Collections', 'Wholesale'].map((item) => (
                <Link
                  key={item}
                  href={item === 'Shop' ? '/store' : item === 'Wholesale' ? '#b2b' : '#collections'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm font-medium tracking-widest text-neutral-600"
                >
                  {item.toUpperCase()}
                </Link>
              ))}
              <Link
                href="/store"
                onClick={() => setMobileMenuOpen(false)}
                className="mt-2 flex items-center justify-center gap-2 py-3 text-xs font-medium tracking-widest text-white"
                style={{ backgroundColor: GOLD }}
              >
                <ShoppingBag size={14} />
                SHOP NOW
              </Link>
            </div>
          </motion.div>
        )}
      </motion.nav>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 1. HERO                                                    */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6" style={{ backgroundColor: CREAM }}>
        {/* Subtle radial glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 60% 50% at 50% 40%, rgba(212,160,23,0.06) 0%, transparent 70%)`,
          }}
        />

        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="relative z-10 text-center"
        >
          {/* Overline */}
          <motion.p
            variants={fadeUp}
            custom={0}
            className="mb-6 text-[11px] font-medium uppercase tracking-[0.4em] text-neutral-400"
          >
            Est. South Africa
          </motion.p>

          {/* Main title */}
          <motion.h1
            variants={fadeUp}
            custom={1}
            className="text-5xl font-extralight tracking-[0.3em] sm:text-7xl lg:text-8xl xl:text-9xl"
            style={{ color: INK }}
          >
            STUDEX
          </motion.h1>
          <motion.h1
            variants={fadeUp}
            custom={2}
            className="mt-1 text-5xl font-extralight tracking-[0.3em] sm:text-7xl lg:text-8xl xl:text-9xl"
            style={{ color: GOLD }}
          >
            MEAT
          </motion.h1>

          {/* Divider */}
          <motion.div
            variants={fadeUp}
            custom={3}
            className="mx-auto my-8 h-px w-20"
            style={{ backgroundColor: GOLD }}
          />

          {/* Tagline */}
          <motion.p
            variants={fadeUp}
            custom={4}
            className="mx-auto max-w-md text-sm font-light leading-relaxed tracking-widest text-neutral-500 sm:text-base"
          >
            Premium Wagyu &amp; Ankole Beef — South Africa
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeUp}
            custom={5}
            className="mt-12 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          >
            <Link
              href="/store"
              className="group flex items-center gap-3 px-10 py-4 text-xs font-semibold tracking-[0.25em] text-white transition-all duration-300 hover:shadow-lg"
              style={{ backgroundColor: GOLD }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = GOLD_DARK)}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = GOLD)}
            >
              SHOP NOW
              <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#collections"
              className="flex items-center gap-3 border px-10 py-4 text-xs font-semibold tracking-[0.25em] transition-all duration-300 hover:bg-neutral-50"
              style={{ borderColor: '#d4d0c8', color: INK }}
            >
              VIEW MENU
              <ChevronDown size={14} />
            </a>
          </motion.div>

          {/* Delivery note */}
          <motion.p
            variants={fadeUp}
            custom={6}
            className="mt-10 flex items-center justify-center gap-2 text-xs tracking-wider text-neutral-400"
          >
            <Truck size={13} />
            Free delivery on orders over R2,000 in Johannesburg
          </motion.p>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <ChevronDown size={20} className="text-neutral-300" />
        </motion.div>
      </section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 2. FEATURED COLLECTIONS                                    */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <Section id="collections" className="py-28 lg:py-36">
        <SectionTitle
          overline="Curated"
          title="Collections"
          subtitle="Three distinct lineages, one standard of excellence."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          {collections.map((col, i) => (
            <motion.div key={col.title} variants={fadeUp} custom={i}>
              <Link href={col.href} className="group block">
                <div className="overflow-hidden border border-neutral-100 bg-white transition-all duration-500 hover:border-[#D4A017]/40 hover:shadow-lg">
                  {/* Image placeholder */}
                  <div className="flex h-64 items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 transition-colors duration-500 group-hover:from-[#FFF8F0] group-hover:to-[#f5eadb]">
                    <span className="text-6xl opacity-40 transition-all duration-500 group-hover:scale-110 group-hover:opacity-70">
                      {col.icon}
                    </span>
                  </div>
                  {/* Content */}
                  <div className="p-8">
                    <div className="mb-1 h-px w-8 transition-all duration-500 group-hover:w-12" style={{ backgroundColor: GOLD }} />
                    <h3
                      className="mt-4 text-sm font-semibold tracking-[0.2em]"
                      style={{ color: INK }}
                    >
                      {col.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-neutral-500">
                      {col.description}
                    </p>
                    <div className="mt-6 flex items-center gap-2 text-xs font-medium tracking-widest transition-colors" style={{ color: GOLD }}>
                      EXPLORE
                      <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 3. BEST SELLERS                                            */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <Section className="py-28 lg:py-36" bg="bg-white">
        <SectionTitle
          overline="Most Popular"
          title="Best Sellers"
          subtitle="Our customers' favourites, selected for exceptional quality and taste."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {bestSellers.map((product, i) => (
            <motion.div key={product.name} variants={fadeUp} custom={i}>
              <div className="group relative border border-neutral-100 bg-[#FFF8F0] transition-all duration-500 hover:border-[#D4A017]/30 hover:shadow-md">
                {/* Badge */}
                {product.badge && (
                  <div
                    className="absolute right-4 top-4 z-10 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white"
                    style={{ backgroundColor: GOLD }}
                  >
                    {product.badge}
                  </div>
                )}

                {/* Image placeholder */}
                <div className="flex h-52 items-center justify-center bg-gradient-to-br from-neutral-50 to-neutral-100 transition-all duration-500 group-hover:from-[#FFF8F0] group-hover:to-[#f5eadb]">
                  <Beef
                    size={48}
                    className="text-neutral-200 transition-all duration-500 group-hover:text-[#D4A017]/40 group-hover:scale-110"
                  />
                </div>

                {/* Details */}
                <div className="p-6">
                  <h3 className="text-sm font-semibold tracking-wide" style={{ color: INK }}>
                    {product.name}
                  </h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-xl font-light" style={{ color: GOLD_DARK }}>
                      {formatZAR(product.price)}
                    </span>
                    <span className="text-xs text-neutral-400">{product.unit}</span>
                  </div>

                  {/* Stars */}
                  <div className="mt-3 flex gap-0.5">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={12} fill={GOLD} stroke={GOLD} />
                    ))}
                  </div>

                  {/* Add to Cart */}
                  <Link
                    href="/store"
                    className="mt-5 flex w-full items-center justify-center gap-2 border py-3 text-xs font-medium tracking-[0.2em] transition-all duration-300 hover:text-white"
                    style={{ borderColor: GOLD, color: GOLD }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = GOLD;
                      e.currentTarget.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = GOLD;
                    }}
                  >
                    <ShoppingBag size={13} />
                    ADD TO CART
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* View all */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mt-14 text-center"
        >
          <Link
            href="/store"
            className="inline-flex items-center gap-2 text-sm font-medium tracking-widest transition-colors hover:underline"
            style={{ color: GOLD }}
          >
            VIEW FULL MENU
            <ArrowRight size={14} />
          </Link>
        </motion.div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 4. WHY STUDEX                                              */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <Section className="py-28 lg:py-36">
        <SectionTitle
          overline="The Difference"
          title="Why StudEx Meat"
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="grid gap-12 sm:grid-cols-3"
        >
          {pillars.map((pillar, i) => (
            <motion.div key={pillar.title} variants={fadeUp} custom={i} className="text-center">
              <div
                className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full"
                style={{ backgroundColor: `${GOLD}12` }}
              >
                <pillar.icon size={24} style={{ color: GOLD }} />
              </div>
              <h3 className="text-sm font-semibold tracking-[0.2em]" style={{ color: INK }}>
                {pillar.title.toUpperCase()}
              </h3>
              <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-neutral-500">
                {pillar.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 5. INSTAGRAM / SOCIAL PROOF                                */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <Section className="py-28 lg:py-36" bg="bg-white">
        <SectionTitle
          overline="@studexmeat"
          title="Follow Us"
          subtitle="Join our community of meat connoisseurs."
        />

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
          variants={stagger}
          className="grid grid-cols-2 gap-4 lg:grid-cols-4"
        >
          {[0, 1, 2, 3].map((i) => (
            <motion.div key={i} variants={fadeUp} custom={i}>
              <a
                href="https://instagram.com/studexmeat"
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block aspect-square overflow-hidden bg-gradient-to-br from-neutral-100 to-neutral-50"
              >
                {/* Placeholder content */}
                <div className="flex h-full w-full items-center justify-center transition-colors duration-500 group-hover:bg-neutral-100/50">
                  <div className="text-center">
                    <span className="text-4xl opacity-30 group-hover:opacity-50 transition-opacity duration-300">
                      {['🥩', '🔥', '🥓', '🍖'][i]}
                    </span>
                  </div>
                </div>
                {/* Hover overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-300 group-hover:bg-black/40">
                  <div className="flex items-center gap-3 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <Heart size={18} />
                    <Instagram size={18} />
                  </div>
                </div>
              </a>
            </motion.div>
          ))}
        </motion.div>

        {/* Followers badge */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          className="mt-10 flex items-center justify-center gap-3"
        >
          <a
            href="https://instagram.com/studexmeat"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 border border-neutral-200 px-6 py-3 text-sm tracking-wider transition-all duration-300 hover:border-[#D4A017]/40"
            style={{ color: INK }}
          >
            <Instagram size={16} style={{ color: GOLD }} />
            <span className="font-semibold">86.3K</span>
            <span className="text-neutral-400">Followers</span>
            <ExternalLink size={12} className="text-neutral-300" />
          </a>
        </motion.div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 6. B2B SECTION                                             */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <Section id="b2b" className="py-28 lg:py-36">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} custom={0}>
              <Users size={28} className="mx-auto mb-6" style={{ color: GOLD }} />
            </motion.div>

            <motion.p
              variants={fadeUp}
              custom={1}
              className="mb-3 text-xs font-medium uppercase tracking-[0.3em]"
              style={{ color: GOLD }}
            >
              For Business
            </motion.p>

            <motion.h2
              variants={fadeUp}
              custom={2}
              className="text-3xl font-light tracking-wide sm:text-4xl"
              style={{ color: INK }}
            >
              Wholesale &amp; Restaurant Partners
            </motion.h2>

            <GoldDivider className="my-8" />

            <motion.p
              variants={fadeUp}
              custom={3}
              className="text-base leading-relaxed text-neutral-500 sm:text-lg"
            >
              Premium cuts for your kitchen. Dedicated account manager, flexible ordering,
              competitive wholesale pricing.
            </motion.p>

            <motion.p
              variants={fadeUp}
              custom={4}
              className="mt-6 text-sm italic text-neutral-400"
            >
              Trusted by The Blockman Parkhurst, Daruma, and more
            </motion.p>

            <motion.div variants={fadeUp} custom={5} className="mt-10">
              <a
                href="mailto:info@studexmeat.com"
                className="inline-flex items-center gap-3 px-10 py-4 text-xs font-semibold tracking-[0.25em] text-white transition-all duration-300 hover:shadow-lg"
                style={{ backgroundColor: GOLD }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = GOLD_DARK)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = GOLD)}
              >
                <Mail size={14} />
                CONTACT US
              </a>
            </motion.div>
          </motion.div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 7. NEWSLETTER                                              */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <Section className="py-28 lg:py-36" bg="bg-white">
        <div className="mx-auto max-w-2xl text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
          >
            <motion.div variants={fadeUp} custom={0}>
              <Sparkles size={24} className="mx-auto mb-6" style={{ color: GOLD }} />
            </motion.div>

            <motion.p
              variants={fadeUp}
              custom={1}
              className="mb-3 text-xs font-medium uppercase tracking-[0.3em]"
              style={{ color: GOLD }}
            >
              Exclusive
            </motion.p>

            <motion.h2
              variants={fadeUp}
              custom={2}
              className="text-3xl font-light tracking-wide sm:text-4xl"
              style={{ color: INK }}
            >
              Join the Inner Circle
            </motion.h2>

            <GoldDivider className="my-8" />

            <motion.p
              variants={fadeUp}
              custom={3}
              className="text-base leading-relaxed text-neutral-500"
            >
              Be the first to know about new drops, specials, and exclusive cuts.
            </motion.p>

            <motion.div variants={fadeUp} custom={4} className="mt-10">
              {emailSubmitted ? (
                <div className="flex items-center justify-center gap-3 py-4 text-sm tracking-wider" style={{ color: GOLD }}>
                  <Sparkles size={16} />
                  Welcome to the inner circle.
                </div>
              ) : (
                <form onSubmit={handleEmailSubmit} className="flex flex-col gap-3 sm:flex-row">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="flex-1 border border-neutral-200 bg-[#FFF8F0] px-5 py-4 text-sm tracking-wider text-neutral-800 placeholder-neutral-300 outline-none transition-all focus:border-[#D4A017]/50"
                  />
                  <button
                    type="submit"
                    className="flex items-center justify-center gap-2 px-8 py-4 text-xs font-semibold tracking-[0.25em] text-white transition-all duration-300 hover:shadow-lg"
                    style={{ backgroundColor: GOLD }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = GOLD_DARK)}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = GOLD)}
                  >
                    SUBSCRIBE
                    <Send size={13} />
                  </button>
                </form>
              )}
            </motion.div>
          </motion.div>
        </div>
      </Section>

      {/* ═══════════════════════════════════════════════════════════ */}
      {/* 8. FOOTER                                                  */}
      {/* ═══════════════════════════════════════════════════════════ */}
      <footer style={{ backgroundColor: INK }}>
        <div className="mx-auto max-w-7xl px-6 py-20 sm:px-8 lg:px-12">
          <div className="grid gap-14 md:grid-cols-3">
            {/* Brand column */}
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold tracking-[0.25em] text-white">
                  STUDEX
                </span>
                <span className="text-lg font-light tracking-[0.25em]" style={{ color: GOLD }}>
                  MEAT
                </span>
              </div>
              <p className="mt-5 max-w-xs text-sm leading-relaxed text-neutral-400">
                Premium Wagyu &amp; Ankole beef, delivered to your door across South Africa.
              </p>
              {/* Social icons */}
              <div className="mt-6 flex gap-4">
                <a
                  href="https://instagram.com/studexmeat"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-700 text-neutral-400 transition-all duration-300 hover:border-[#D4A017] hover:text-[#D4A017]"
                >
                  <Instagram size={16} />
                </a>
                <a
                  href="#"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-700 text-neutral-400 transition-all duration-300 hover:border-[#D4A017] hover:text-[#D4A017]"
                >
                  <Facebook size={16} />
                </a>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-700 text-neutral-400 transition-all duration-300 hover:border-[#25D366] hover:text-[#25D366]"
                >
                  <MessageCircle size={16} />
                </a>
              </div>
            </div>

            {/* Links column */}
            <div>
              <h4 className="mb-5 text-xs font-semibold tracking-[0.25em] text-neutral-300">
                QUICK LINKS
              </h4>
              <div className="flex flex-col gap-3">
                {footerLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-sm text-neutral-400 transition-colors duration-300 hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Contact column */}
            <div>
              <h4 className="mb-5 text-xs font-semibold tracking-[0.25em] text-neutral-300">
                GET IN TOUCH
              </h4>
              <div className="flex flex-col gap-4">
                <a
                  href="mailto:info@studexmeat.com"
                  className="flex items-center gap-3 text-sm text-neutral-400 transition-colors duration-300 hover:text-white"
                >
                  <Mail size={14} style={{ color: GOLD }} />
                  info@studexmeat.com
                </a>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-neutral-400 transition-colors duration-300 hover:text-white"
                >
                  <MessageCircle size={14} style={{ color: GOLD }} />
                  WhatsApp Order
                </a>
                <div className="flex items-center gap-3 text-sm text-neutral-400">
                  <MapPin size={14} style={{ color: GOLD }} />
                  Johannesburg, South Africa
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-16 border-t border-neutral-800 pt-8">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between">
              <p className="text-xs tracking-wider text-neutral-500">
                &copy; 2026 StudEx Meat (Pty) Ltd. All prices include 15% VAT.
              </p>
              <div className="flex items-center gap-1 text-xs text-neutral-600">
                <span>Crafted with</span>
                <Heart size={10} fill={GOLD} stroke={GOLD} />
                <span>in South Africa</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* ─── Floating WhatsApp Button ───────────────────────────── */}
      <a
        href={WHATSAPP_LINK}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
        style={{ backgroundColor: '#25D366' }}
        aria-label="Order on WhatsApp"
      >
        <MessageCircle size={24} className="text-white" />
      </a>
    </div>
  );
}
