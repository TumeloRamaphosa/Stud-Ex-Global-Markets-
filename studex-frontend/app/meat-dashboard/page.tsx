'use client';

import { useState } from 'react';
import {
  Beef,
  DollarSign,
  FileText,
  BarChart3,
  Link2,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Calculator,
  Mail,
  HardDrive,
  Cloud,
  Share2,
  Database,
  Server,
  Plug,
  ChevronRight,
  Package,
  Receipt,
} from 'lucide-react';

// ── Wagyu wholesale data ────────────────────────────────────────────
const wagyuProducts = [
  { name: 'Fillet',       m45: 950,  m67: 1500, m89: 1550, m10: 1650 },
  { name: 'Rib-eye',      m45: 1500, m67: 1750, m89: 1950, m10: 2250 },
  { name: 'Rump',         m45: 750,  m67: 950,  m89: 1250, m10: 1450 },
  { name: 'Picanha',      m45: 750,  m67: 850,  m89: 1250, m10: 1550 },
  { name: 'T-BONE',       m45: 0,    m67: 0,    m89: 1850, m10: 2100 },
  { name: 'Sirloin',      m45: 950,  m67: 1350, m89: 1550, m10: 1750 },
  { name: 'Silverside',   m45: 550,  m67: 650,  m89: 850,  m10: 950  },
  { name: 'Biltong cuts', m45: 450,  m67: 550,  m89: 650,  m10: 750  },
  { name: 'Chuck eye',    m45: 550,  m67: 750,  m89: 950,  m10: 1250 },
  { name: 'Brisket',      m45: 450,  m67: 750,  m89: 850,  m10: 950  },
  { name: 'Tmx',          m45: 250,  m67: 250,  m89: 250,  m10: 250  },
  { name: 'Denver',       m45: 750,  m67: 950,  m89: 1250, m10: 1450 },
  { name: 'Bavette',      m45: 650,  m67: 950,  m89: 1350, m10: 1550 },
  { name: 'Tri-Tip',      m45: 650,  m67: 1100, m89: 1350, m10: 1550 },
  { name: 'Flank',        m45: 550,  m67: 650,  m89: 750,  m10: 950  },
  { name: 'Flat Iron',    m45: 550,  m67: 650,  m89: 850,  m10: 1150 },
  { name: 'Patties',      m45: 350,  m67: 350,  m89: 350,  m10: 450  },
  { name: 'Boerewors',    m45: 350,  m67: 350,  m89: 350,  m10: 350  },
  { name: 'Biltong',      m45: 550,  m67: 550,  m89: 650,  m10: 750  },
  { name: 'Droewors',     m45: 550,  m67: 550,  m89: 650,  m10: 750  },
];

const ankoleProducts = [
  { name: 'Fillet',    cost: 1050 },
  { name: 'Rump',      cost: 770  },
  { name: 'Sirloin',   cost: 770  },
  { name: 'Ribeye',    cost: 1050 },
  { name: 'Mince',     cost: 250  },
  { name: 'Boerewors', cost: 250  },
  { name: '1kg T-Bone', cost: 1650 },
];

// ── Invoice sample data ─────────────────────────────────────────────
const pendingInvoices = [
  {
    id: 1,
    date: '22 Jan 2026',
    customer: 'The Blockman Parkhurst',
    description: '10x500g Wagyu Ribeye',
    marble: '4/5',
    weight: '5kg',
    amount: 'R8,250',
    vat: 'R1,237.50',
    final: 'R9,487.50',
    status: 'Pending',
  },
  {
    id: 2,
    date: '7 Feb 2026',
    customer: 'Daruma',
    description: '2kg Ribeye',
    marble: '7',
    weight: '3kg',
    amount: '-',
    vat: '-',
    final: '-',
    status: 'Pending',
  },
  {
    id: 3,
    date: '2 May 2026',
    customer: 'Big Mouth',
    description: '30x250g Wagyu Boerewors',
    marble: '-',
    weight: '7.5kg',
    amount: '-',
    vat: '-',
    final: '-',
    status: 'Pending',
  },
];

// ── Margin data ─────────────────────────────────────────────────────
const marginExamples = [
  { product: 'Wagyu Ribeye 4/5',  retail: 2800, wholesale: 1500, unit: '/kg' },
  { product: 'Wagyu Fillet 8/9',  retail: 3200, wholesale: 1550, unit: '/kg' },
  { product: 'Ankole Ribeye',     retail: 1950, wholesale: 1050, unit: '/kg' },
  { product: 'Wagyu Boerewors',   retail: 650,  wholesale: 350,  unit: '/kg' },
  { product: 'Wagyu Biltong',     retail: 1200, wholesale: 550,  unit: '/kg' },
];

// ── Monthly revenue (mock) ──────────────────────────────────────────
const monthlyRevenue = [
  { month: 'Jan', value: 125000 },
  { month: 'Feb', value: 98000  },
  { month: 'Mar', value: 142000 },
  { month: 'Apr', value: 167000 },
  { month: 'May', value: 189000 },
  { month: 'Jun', value: 156000 },
];

// ── Integration statuses ────────────────────────────────────────────
const integrations = [
  { name: 'Fly.io',          status: 'active',  detail: 'Active ($5/month, JNB region)',   icon: Server  },
  { name: 'n8n Cloud',       status: 'active',  detail: 'studexgroup.app.n8n.cloud',       icon: Cloud   },
  { name: 'QuickBooks',      status: 'active',  detail: 'Connected - Invoice sync active', icon: Receipt },
  { name: 'Google Sheets',   status: 'active',  detail: 'Production Sheet Connected',      icon: Database },
  { name: 'Google Drive',    status: 'active',  detail: 'Invoice Upload Folder Connected', icon: HardDrive },
  { name: 'Facebook MCP',    status: 'ready',   detail: 'Ready to connect',                icon: Share2  },
  { name: 'Manus VM',        status: 'ready',   detail: 'Ready to connect',                icon: Plug    },
];

// ── Helpers ──────────────────────────────────────────────────────────
function StatusDot({ status }: { status: string }) {
  const color =
    status === 'active'
      ? 'bg-emerald-500'
      : status === 'ready'
      ? 'bg-amber-400'
      : 'bg-red-500';
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${color}`} />;
}

// ══════════════════════════════════════════════════════════════════════
// Page
// ══════════════════════════════════════════════════════════════════════
type Tab = 'costs' | 'invoices' | 'analytics' | 'integrations';

const tabs: { key: Tab; label: string; icon: React.ElementType }[] = [
  { key: 'costs',        label: 'Cost Management',   icon: DollarSign },
  { key: 'invoices',     label: 'Invoice Automation', icon: FileText   },
  { key: 'analytics',    label: 'Analytics & Ads',    icon: BarChart3  },
  { key: 'integrations', label: 'Integrations',       icon: Link2      },
];

export default function MeatDashboardPage() {
  const [activeTab, setActiveTab] = useState<Tab>('costs');

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FFF8F0' }}>
      {/* ── Header ─────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-30 border-b"
        style={{ backgroundColor: '#FFF8F0', borderColor: '#E8DCC8' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#D4A017' }}
            >
              <Beef className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide" style={{ color: '#1A1207' }}>
                STUDEX MEAT
              </h1>
              <p className="text-xs tracking-widest uppercase" style={{ color: '#8B6914' }}>
                Management Dashboard
              </p>
            </div>
          </div>
          <p className="hidden sm:block text-sm" style={{ color: '#8B6914' }}>
            Internal Operations
          </p>
        </div>

        {/* ── Tab Navigation ───────────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1 overflow-x-auto pb-px -mb-px scrollbar-hide">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    flex items-center gap-2 px-4 py-3 text-sm font-medium
                    whitespace-nowrap border-b-2 transition-colors
                    ${
                      isActive
                        ? 'border-current'
                        : 'border-transparent hover:border-gray-300'
                    }
                  `}
                  style={{
                    color: isActive ? '#D4A017' : '#6B5C3E',
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* ── Content ────────────────────────────────────────────────── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'costs' && <CostManagement />}
        {activeTab === 'invoices' && <InvoiceAutomation />}
        {activeTab === 'analytics' && <AnalyticsAds />}
        {activeTab === 'integrations' && <Integrations />}
      </main>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// Tab 1 : Cost Management
// ══════════════════════════════════════════════════════════════════════
function CostManagement() {
  return (
    <div className="space-y-10">
      {/* ── Wagyu Table ────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5" style={{ color: '#D4A017' }} />
          <h2 className="text-lg font-semibold" style={{ color: '#1A1207' }}>
            Wagyu Wholesale Prices
          </h2>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#F5E6C8', color: '#8B6914' }}>
            per kg
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: '#E8DCC8' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#F5E6C8' }}>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: '#1A1207' }}>
                  Product
                </th>
                <th className="text-right px-4 py-3 font-semibold" style={{ color: '#1A1207' }}>
                  Marble 4/5
                </th>
                <th className="text-right px-4 py-3 font-semibold" style={{ color: '#1A1207' }}>
                  Marble 6/7
                </th>
                <th className="text-right px-4 py-3 font-semibold" style={{ color: '#1A1207' }}>
                  Marble 8/9
                </th>
                <th className="text-right px-4 py-3 font-semibold" style={{ color: '#1A1207' }}>
                  Marble 10+
                </th>
              </tr>
            </thead>
            <tbody>
              {wagyuProducts.map((p, i) => (
                <tr
                  key={p.name}
                  style={{
                    backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#FFFAF2',
                  }}
                  className="border-t"
                >
                  <td className="px-4 py-2.5 font-medium" style={{ color: '#1A1207', borderColor: '#F0E4D0' }}>
                    {p.name}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums" style={{ color: p.m45 === 0 ? '#C4B896' : '#1A1207', borderColor: '#F0E4D0' }}>
                    {p.m45 === 0 ? '-' : `R${p.m45.toLocaleString()}`}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums" style={{ color: p.m67 === 0 ? '#C4B896' : '#1A1207', borderColor: '#F0E4D0' }}>
                    {p.m67 === 0 ? '-' : `R${p.m67.toLocaleString()}`}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums" style={{ color: '#1A1207', borderColor: '#F0E4D0' }}>
                    R{p.m89.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums" style={{ color: '#1A1207', borderColor: '#F0E4D0' }}>
                    R{p.m10.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Ankole Table ───────────────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Package className="w-5 h-5" style={{ color: '#D4A017' }} />
          <h2 className="text-lg font-semibold" style={{ color: '#1A1207' }}>
            Ankole Wholesale Prices
          </h2>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#F5E6C8', color: '#8B6914' }}>
            per kg
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: '#E8DCC8' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#F5E6C8' }}>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: '#1A1207' }}>
                  Product
                </th>
                <th className="text-right px-4 py-3 font-semibold" style={{ color: '#1A1207' }}>
                  Cost (R/kg)
                </th>
              </tr>
            </thead>
            <tbody>
              {ankoleProducts.map((p, i) => (
                <tr
                  key={p.name}
                  style={{ backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#FFFAF2' }}
                  className="border-t"
                >
                  <td className="px-4 py-2.5 font-medium" style={{ color: '#1A1207', borderColor: '#F0E4D0' }}>
                    {p.name}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular-nums" style={{ color: '#1A1207', borderColor: '#F0E4D0' }}>
                    R{p.cost.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// Tab 2 : Invoice Automation
// ══════════════════════════════════════════════════════════════════════
function InvoiceAutomation() {
  const connectionCards = [
    { name: 'Google Sheets', status: 'Active', detail: 'Production Sheet Connected', icon: Database },
    { name: 'QuickBooks',    status: 'Active', detail: 'Connected',                  icon: Receipt  },
    { name: 'Google Drive',  status: 'Active', detail: 'Invoice Upload Folder Connected', icon: HardDrive },
    { name: 'Gmail',         status: 'Active', detail: 'info@studexmeat.com',        icon: Mail     },
    { name: 'n8n Cloud',     status: 'Active', detail: 'studexgroup.app.n8n.cloud',  icon: Cloud    },
  ];

  const workflowSteps = [
    'Google Sheets',
    'Transform / Calculate',
    'QuickBooks (Create Invoice)',
    'Google Drive (PDF)',
    'Email (info@studexmeat.com)',
  ];

  return (
    <div className="space-y-10">
      {/* ── Integration Status Cards ───────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold mb-4" style={{ color: '#1A1207' }}>
          Integration Status
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {connectionCards.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.name}
                className="rounded-xl border p-4"
                style={{ borderColor: '#E8DCC8', backgroundColor: '#FFFFFF' }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className="w-4 h-4" style={{ color: '#D4A017' }} />
                  <span className="text-sm font-semibold" style={{ color: '#1A1207' }}>
                    {c.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mb-1">
                  <StatusDot status="active" />
                  <span className="text-xs font-medium text-emerald-700">{c.status}</span>
                </div>
                <p className="text-xs" style={{ color: '#8B6914' }}>{c.detail}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Workflow Visualization ─────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold mb-4" style={{ color: '#1A1207' }}>
          n8n Workflow Pipeline
        </h2>
        <div
          className="rounded-xl border p-6 overflow-x-auto"
          style={{ borderColor: '#E8DCC8', backgroundColor: '#FFFFFF' }}
        >
          <div className="flex items-center gap-2 min-w-max">
            {workflowSteps.map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <div
                  className="rounded-lg px-4 py-3 text-xs font-medium text-center whitespace-nowrap"
                  style={{
                    backgroundColor: i === 0 ? '#D4A017' : '#F5E6C8',
                    color: i === 0 ? '#FFFFFF' : '#1A1207',
                  }}
                >
                  {step}
                </div>
                {i < workflowSteps.length - 1 && (
                  <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: '#D4A017' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Calculation Logic ──────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold mb-4" style={{ color: '#1A1207' }}>
          Calculation Logic
        </h2>
        <div
          className="rounded-xl border p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          style={{ borderColor: '#E8DCC8', backgroundColor: '#FFFFFF' }}
        >
          {[
            { label: 'Item Total',  formula: 'Weight x Price' },
            { label: 'Subtotal',    formula: 'Sum of Items' },
            { label: 'VAT',         formula: 'Subtotal x 15%' },
            { label: 'Grand Total', formula: 'Subtotal + VAT' },
          ].map((c) => (
            <div key={c.label} className="flex items-start gap-3">
              <Calculator className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: '#D4A017' }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: '#1A1207' }}>{c.label}</p>
                <p className="text-xs" style={{ color: '#8B6914' }}>{c.formula}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pending Invoices Table ─────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold mb-4" style={{ color: '#1A1207' }}>
          Pending Invoices
        </h2>
        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: '#E8DCC8' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#F5E6C8' }}>
                {['ID', 'Date', 'Customer', 'Description', 'Marble', 'Weight', 'Amount', 'VAT 15%', 'Final', 'Status'].map(
                  (h) => (
                    <th
                      key={h}
                      className="text-left px-3 py-3 font-semibold whitespace-nowrap"
                      style={{ color: '#1A1207' }}
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {pendingInvoices.map((inv, i) => (
                <tr
                  key={inv.id}
                  style={{ backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#FFFAF2' }}
                  className="border-t"
                >
                  <td className="px-3 py-2.5" style={{ color: '#1A1207', borderColor: '#F0E4D0' }}>{inv.id}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: '#1A1207', borderColor: '#F0E4D0' }}>{inv.date}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap font-medium" style={{ color: '#1A1207', borderColor: '#F0E4D0' }}>{inv.customer}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap" style={{ color: '#1A1207', borderColor: '#F0E4D0' }}>{inv.description}</td>
                  <td className="px-3 py-2.5" style={{ color: '#1A1207', borderColor: '#F0E4D0' }}>{inv.marble}</td>
                  <td className="px-3 py-2.5" style={{ color: '#1A1207', borderColor: '#F0E4D0' }}>{inv.weight}</td>
                  <td className="px-3 py-2.5 tabular-nums" style={{ color: '#1A1207', borderColor: '#F0E4D0' }}>{inv.amount}</td>
                  <td className="px-3 py-2.5 tabular-nums" style={{ color: '#1A1207', borderColor: '#F0E4D0' }}>{inv.vat}</td>
                  <td className="px-3 py-2.5 tabular-nums font-medium" style={{ color: '#1A1207', borderColor: '#F0E4D0' }}>{inv.final}</td>
                  <td className="px-3 py-2.5" style={{ borderColor: '#F0E4D0' }}>
                    <span
                      className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}
                    >
                      <Clock className="w-3 h-3" />
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// Tab 3 : Analytics & Ads
// ══════════════════════════════════════════════════════════════════════
function AnalyticsAds() {
  const maxRevenue = Math.max(...monthlyRevenue.map((m) => m.value));

  return (
    <div className="space-y-10">
      {/* ── Revenue Metrics ────────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold mb-4" style={{ color: '#1A1207' }}>
          Revenue Metrics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Monthly Revenue',  value: 'R189,000', change: '+12%', up: true  },
            { label: 'Avg Order Value',   value: 'R4,850',   change: '+5%',  up: true  },
            { label: 'Total Orders',      value: '47',       change: '+8%',  up: true  },
            { label: 'Return Rate',       value: '1.2%',     change: '-0.3%', up: false },
          ].map((m) => (
            <div
              key={m.label}
              className="rounded-xl border p-5"
              style={{ borderColor: '#E8DCC8', backgroundColor: '#FFFFFF' }}
            >
              <p className="text-xs mb-1" style={{ color: '#8B6914' }}>{m.label}</p>
              <p className="text-2xl font-bold tabular-nums" style={{ color: '#1A1207' }}>
                {m.value}
              </p>
              <div className="flex items-center gap-1 mt-1">
                {m.up ? (
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
                )}
                <span className="text-xs font-medium text-emerald-600">{m.change}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Monthly Revenue Chart ──────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold mb-4" style={{ color: '#1A1207' }}>
          Monthly Revenue (2026)
        </h2>
        <div
          className="rounded-xl border p-6"
          style={{ borderColor: '#E8DCC8', backgroundColor: '#FFFFFF' }}
        >
          <div className="flex items-end gap-3 h-48">
            {monthlyRevenue.map((m) => {
              const heightPct = (m.value / maxRevenue) * 100;
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-medium tabular-nums" style={{ color: '#8B6914' }}>
                    R{(m.value / 1000).toFixed(0)}k
                  </span>
                  <div
                    className="w-full rounded-t-md transition-all"
                    style={{
                      height: `${heightPct}%`,
                      backgroundColor: '#D4A017',
                      minHeight: '8px',
                    }}
                  />
                  <span className="text-xs" style={{ color: '#6B5C3E' }}>{m.month}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Margin Analysis ────────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold mb-4" style={{ color: '#1A1207' }}>
          Margin Analysis
        </h2>
        <p className="text-sm mb-4" style={{ color: '#8B6914' }}>
          Gross Margin = Retail Price - Wholesale Cost
        </p>
        <div className="overflow-x-auto rounded-xl border" style={{ borderColor: '#E8DCC8' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ backgroundColor: '#F5E6C8' }}>
                <th className="text-left px-4 py-3 font-semibold" style={{ color: '#1A1207' }}>Product</th>
                <th className="text-right px-4 py-3 font-semibold" style={{ color: '#1A1207' }}>Retail</th>
                <th className="text-right px-4 py-3 font-semibold" style={{ color: '#1A1207' }}>Wholesale</th>
                <th className="text-right px-4 py-3 font-semibold" style={{ color: '#1A1207' }}>Gross Margin</th>
                <th className="text-right px-4 py-3 font-semibold" style={{ color: '#1A1207' }}>Margin %</th>
              </tr>
            </thead>
            <tbody>
              {marginExamples.map((m, i) => {
                const margin = m.retail - m.wholesale;
                const marginPct = ((margin / m.retail) * 100).toFixed(1);
                return (
                  <tr
                    key={m.product}
                    style={{ backgroundColor: i % 2 === 0 ? '#FFFFFF' : '#FFFAF2' }}
                    className="border-t"
                  >
                    <td className="px-4 py-2.5 font-medium" style={{ color: '#1A1207', borderColor: '#F0E4D0' }}>
                      {m.product}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums" style={{ color: '#1A1207', borderColor: '#F0E4D0' }}>
                      R{m.retail.toLocaleString()}{m.unit}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums" style={{ color: '#1A1207', borderColor: '#F0E4D0' }}>
                      R{m.wholesale.toLocaleString()}{m.unit}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums font-medium" style={{ color: '#166534', borderColor: '#F0E4D0' }}>
                      R{margin.toLocaleString()}{m.unit}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular-nums" style={{ borderColor: '#F0E4D0' }}>
                      <span
                        className="inline-block px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{ backgroundColor: '#D1FAE5', color: '#065F46' }}
                      >
                        {marginPct}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Ads Connection ─────────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold mb-4" style={{ color: '#1A1207' }}>
          Advertising
        </h2>
        <div
          className="rounded-xl border p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          style={{ borderColor: '#E8DCC8', backgroundColor: '#FFFFFF' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#F5E6C8' }}>
              <Share2 className="w-5 h-5" style={{ color: '#D4A017' }} />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: '#1A1207' }}>
                Facebook / Instagram Ads
              </p>
              <p className="text-xs" style={{ color: '#8B6914' }}>
                Connect Meta Ads to track campaign performance
              </p>
            </div>
          </div>
          <button
            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-90 ml-auto"
            style={{ backgroundColor: '#D4A017', color: '#FFFFFF' }}
          >
            Connect Meta Ads
          </button>
        </div>
      </section>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
// Tab 4 : Integrations
// ══════════════════════════════════════════════════════════════════════
function Integrations() {
  return (
    <div className="space-y-10">
      {/* ── All Services ───────────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold mb-4" style={{ color: '#1A1207' }}>
          Connected Services
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map((svc) => {
            const Icon = svc.icon;
            return (
              <div
                key={svc.name}
                className="rounded-xl border p-5 flex items-start gap-4"
                style={{ borderColor: '#E8DCC8', backgroundColor: '#FFFFFF' }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: '#F5E6C8' }}
                >
                  <Icon className="w-5 h-5" style={{ color: '#D4A017' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold truncate" style={{ color: '#1A1207' }}>
                      {svc.name}
                    </p>
                    <StatusDot status={svc.status} />
                  </div>
                  <p className="text-xs truncate" style={{ color: '#8B6914' }}>{svc.detail}</p>
                </div>
                {svc.status === 'active' ? (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-500 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Fly.io ↔ Manus VM ──────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold mb-4" style={{ color: '#1A1207' }}>
          Infrastructure Link
        </h2>
        <div
          className="rounded-xl border p-6"
          style={{ borderColor: '#E8DCC8', backgroundColor: '#FFFFFF' }}
        >
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center">
            {/* Fly.io */}
            <div className="flex items-center gap-2 rounded-lg px-4 py-3" style={{ backgroundColor: '#F5E6C8' }}>
              <Server className="w-5 h-5" style={{ color: '#D4A017' }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: '#1A1207' }}>Fly.io</p>
                <p className="text-xs" style={{ color: '#8B6914' }}>$5/month &middot; JNB region</p>
              </div>
              <StatusDot status="active" />
            </div>

            {/* Arrow */}
            <div className="flex flex-col items-center gap-0.5">
              <div className="flex items-center gap-1">
                <ArrowRight className="w-5 h-5" style={{ color: '#D4A017' }} />
                <ArrowRight className="w-5 h-5 rotate-180" style={{ color: '#D4A017' }} />
              </div>
              <span className="text-xs" style={{ color: '#8B6914' }}>Bidirectional</span>
            </div>

            {/* Manus VM */}
            <div className="flex items-center gap-2 rounded-lg px-4 py-3" style={{ backgroundColor: '#F5E6C8' }}>
              <Plug className="w-5 h-5" style={{ color: '#D4A017' }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: '#1A1207' }}>Manus VM</p>
                <p className="text-xs" style={{ color: '#8B6914' }}>Ready to connect</p>
              </div>
              <StatusDot status="ready" />
            </div>
          </div>
          <p className="text-center text-xs mt-4" style={{ color: '#8B6914' }}>
            Connection pending configuration. Fly.io instance active in Johannesburg region.
          </p>
        </div>
      </section>
    </div>
  );
}
