'use client';

import { useState, useEffect } from 'react';

interface CostRow {
  cut: string;
  wholesaleCost: number;
  retailPrice: number;
  margin: number;
  unit: string;
}

interface Invoice {
  id: string;
  customer: string;
  amount: number;
  status: 'pending' | 'created' | 'sent' | 'paid';
  date: string;
}

interface Integration {
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
  checking: boolean;
}

const costData: CostRow[] = [
  { cut: 'Wagyu Ribeye A5', wholesaleCost: 780, retailPrice: 1299, margin: 39.9, unit: '/kg' },
  { cut: 'Wagyu Ribeye A4', wholesaleCost: 580, retailPrice: 999, margin: 41.9, unit: '/kg' },
  { cut: 'Wagyu Striploin', wholesaleCost: 640, retailPrice: 1099, margin: 41.8, unit: '/kg' },
  { cut: 'Prime Striploin', wholesaleCost: 380, retailPrice: 699, margin: 45.6, unit: '/kg' },
  { cut: 'Full Packer Brisket', wholesaleCost: 180, retailPrice: 349, margin: 48.4, unit: '/kg' },
  { cut: 'Wagyu Brisket', wholesaleCost: 320, retailPrice: 599, margin: 46.6, unit: '/kg' },
  { cut: 'Picanha Cap', wholesaleCost: 290, retailPrice: 549, margin: 47.2, unit: '/kg' },
  { cut: 'Tomahawk Steak', wholesaleCost: 520, retailPrice: 899, margin: 42.2, unit: '/kg' },
  { cut: 'Fillet Mignon', wholesaleCost: 720, retailPrice: 1199, margin: 39.9, unit: '/kg' },
];

const pipelineStages = [
  { stage: 'Pending', count: 3, color: 'yellow' },
  { stage: 'Created', count: 5, color: 'blue' },
  { stage: 'Sent', count: 8, color: 'purple' },
  { stage: 'Paid', count: 42, color: 'green' },
];

export default function MeatDashboardPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([
    { id: 'INV-001', customer: 'The Blockman Parkhurst', amount: 12500, status: 'paid', date: '2026-05-28' },
    { id: 'INV-002', customer: 'Flames Restaurant', amount: 8900, status: 'sent', date: '2026-05-29' },
    { id: 'INV-003', customer: 'Urban Grill Co', amount: 15200, status: 'created', date: '2026-05-30' },
    { id: 'INV-004', customer: 'Smoke & Bones BBQ', amount: 6800, status: 'pending', date: '2026-05-31' },
    { id: 'INV-005', customer: 'Cape Cuts Butchery', amount: 22000, status: 'paid', date: '2026-05-27' },
  ]);

  const [integrations, setIntegrations] = useState<Integration[]>([
    { name: 'QuickBooks', status: 'connected', lastSync: 'Checking...', checking: true },
    { name: 'Shopify', status: 'connected', lastSync: 'Checking...', checking: true },
    { name: 'Google Sheets', status: 'connected', lastSync: 'Checking...', checking: true },
    { name: 'n8n Workflows', status: 'connected', lastSync: 'Checking...', checking: true },
  ]);

  const [invoiceForm, setInvoiceForm] = useState({
    customerName: '', email: '', cut: '', weight: '', marbleScore: '',
  });
  const [invoiceStatus, setInvoiceStatus] = useState('');
  const [invoiceCreating, setInvoiceCreating] = useState(false);
  const [sheetsSyncStatus, setSheetsSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');

  // Check real integration statuses on mount
  useEffect(() => {
    const checkIntegrations = async () => {
      const endpoints = [
        { name: 'QuickBooks', url: '/api/quickbooks?action=health' },
        { name: 'Shopify', url: '/api/shopify?resource=orders&limit=1' },
        { name: 'Google Sheets', url: '/api/sheets?action=health' },
        { name: 'n8n Workflows', url: '/api/n8n' },
      ];

      const results = await Promise.all(
        endpoints.map(async (ep) => {
          try {
            const res = await fetch(ep.url);
            if (res.ok) {
              return { name: ep.name, status: 'connected' as const, lastSync: 'Just now' };
            }
            return { name: ep.name, status: 'error' as const, lastSync: 'Failed' };
          } catch {
            return { name: ep.name, status: 'disconnected' as const, lastSync: 'Unreachable' };
          }
        })
      );

      setIntegrations(results.map(r => ({ ...r, checking: false })));
    };

    checkIntegrations();

    fetch('/api/quickbooks?action=invoices')
      .then((r) => r.json())
      .then((d) => { if (d.invoices) setInvoices(d.invoices); })
      .catch(() => {});
  }, []);

  const createInvoice = async () => {
    if (!invoiceForm.customerName || !invoiceForm.cut || !invoiceForm.weight) {
      setInvoiceStatus('Please fill in customer name, cut, and weight.');
      return;
    }
    setInvoiceCreating(true);
    setInvoiceStatus('Creating invoice via QuickBooks...');
    try {
      const res = await fetch('/api/quickbooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'invoice_create',
          customerId: '1',
          customerName: invoiceForm.customerName,
          email: invoiceForm.email,
          items: [{
            cut: invoiceForm.cut,
            marbleScore: invoiceForm.marbleScore,
            weight: parseFloat(invoiceForm.weight),
            description: `${invoiceForm.cut} (Marble: ${invoiceForm.marbleScore}) - ${invoiceForm.weight}kg`,
          }],
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setInvoiceStatus(`Invoice created successfully: ${data.invoice?.Id || 'ID pending'}`);
        setInvoiceForm({ customerName: '', email: '', cut: '', weight: '', marbleScore: '' });
      } else {
        setInvoiceStatus(`Error: ${data.error || JSON.stringify(data)}`);
      }
    } catch {
      setInvoiceStatus('Failed to connect to QuickBooks API');
    } finally {
      setInvoiceCreating(false);
    }
  };

  const syncSheets = async () => {
    setSheetsSyncStatus('syncing');
    try {
      const res = await fetch('/api/sheets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sync' }),
      });
      const data = await res.json();
      setSheetsSyncStatus(data.ok ? 'synced' : 'error');
    } catch {
      setSheetsSyncStatus('error');
    }
    setTimeout(() => setSheetsSyncStatus('idle'), 3000);
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-900/50 text-yellow-400',
    created: 'bg-blue-900/50 text-blue-400',
    sent: 'bg-purple-900/50 text-purple-400',
    paid: 'bg-green-900/50 text-green-400',
  };

  const integrationStatusColor = (status: string) => {
    if (status === 'connected') return 'bg-green-400';
    if (status === 'error') return 'bg-red-400';
    return 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Operations Dashboard</h1>
          <p className="text-sm text-gray-500">Cost management, invoicing, and integrations</p>
        </div>

        {/* Invoice Pipeline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {pipelineStages.map((p) => {
            const colorMap: Record<string, string> = {
              yellow: 'border-yellow-800 bg-yellow-950/20',
              blue: 'border-blue-800 bg-blue-950/20',
              purple: 'border-purple-800 bg-purple-950/20',
              green: 'border-green-800 bg-green-950/20',
            };
            return (
              <div key={p.stage} className={`border rounded-xl p-5 ${colorMap[p.color]}`}>
                <p className="text-xs text-gray-400 mb-1">{p.stage}</p>
                <p className="text-3xl font-bold">{p.count}</p>
                <p className="text-xs text-gray-500 mt-1">invoices</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Integration Status */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="font-semibold text-sm mb-4">Integrations</h2>
            <div className="space-y-3">
              {integrations.map((intg) => (
                <div key={intg.name} className="flex items-center justify-between bg-gray-800/50 border border-gray-800 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${
                      intg.checking ? 'bg-yellow-400 animate-pulse' : integrationStatusColor(intg.status)
                    }`} />
                    <div>
                      <span className="text-sm font-medium">{intg.name}</span>
                      <p className={`text-xs ${
                        intg.status === 'connected' ? 'text-green-500' :
                        intg.status === 'error' ? 'text-red-500' : 'text-gray-500'
                      }`}>
                        {intg.checking ? 'Checking...' : intg.status}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{intg.lastSync}</span>
                </div>
              ))}
            </div>

            {/* Google Sheets Sync */}
            <div className="mt-5 pt-4 border-t border-gray-800">
              <h3 className="text-sm font-semibold mb-3">Google Sheets Sync</h3>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    sheetsSyncStatus === 'syncing' ? 'bg-yellow-400 animate-pulse' :
                    sheetsSyncStatus === 'synced' ? 'bg-green-400' :
                    sheetsSyncStatus === 'error' ? 'bg-red-400' : 'bg-gray-500'
                  }`} />
                  <span className="text-xs text-gray-400">
                    {sheetsSyncStatus === 'syncing' ? 'Syncing...' :
                     sheetsSyncStatus === 'synced' ? 'Synced successfully' :
                     sheetsSyncStatus === 'error' ? 'Sync failed' : 'Ready to sync'}
                  </span>
                </div>
              </div>
              <button
                onClick={syncSheets}
                disabled={sheetsSyncStatus === 'syncing'}
                className="w-full py-2 bg-green-600/20 border border-green-800/50 hover:bg-green-600/30 disabled:opacity-50 rounded-lg text-xs font-medium text-green-400 transition-colors"
              >
                {sheetsSyncStatus === 'syncing' ? 'Syncing...' : 'Sync Google Sheets'}
              </button>
            </div>
          </div>

          {/* Quick Invoice Form */}
          <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="font-semibold text-sm mb-4">Create Invoice</h2>
            <div className="grid grid-cols-2 gap-3">
              <input
                placeholder="Customer Name"
                value={invoiceForm.customerName}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, customerName: e.target.value })}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-500"
              />
              <input
                placeholder="Email"
                value={invoiceForm.email}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, email: e.target.value })}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-500"
              />
              <input
                placeholder="Cut (e.g. Rib-eye)"
                value={invoiceForm.cut}
                onChange={(e) => setInvoiceForm({ ...invoiceForm, cut: e.target.value })}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-500"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="Weight (kg)"
                  type="number"
                  value={invoiceForm.weight}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, weight: e.target.value })}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-500"
                />
                <input
                  placeholder="Marble Score"
                  value={invoiceForm.marbleScore}
                  onChange={(e) => setInvoiceForm({ ...invoiceForm, marbleScore: e.target.value })}
                  className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
            <button
              onClick={createInvoice}
              disabled={invoiceCreating}
              className="mt-4 w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg text-sm font-semibold transition-colors"
            >
              {invoiceCreating ? 'Creating...' : 'Create Invoice (15% VAT)'}
            </button>
            {invoiceStatus && (
              <p className={`text-xs mt-2 ${
                invoiceStatus.startsWith('Error') || invoiceStatus.startsWith('Failed') || invoiceStatus.startsWith('Please')
                  ? 'text-red-400' : invoiceStatus.includes('success') ? 'text-green-400' : 'text-gray-400'
              }`}>
                {invoiceStatus}
              </p>
            )}
          </div>
        </div>

        {/* Cost Breakdown Table */}
        <div className="mb-8">
          <h2 className="font-semibold text-sm mb-4">Cost Breakdown</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-800/50 text-gray-400">
                <tr>
                  <th className="text-left px-5 py-3">Cut</th>
                  <th className="text-right px-5 py-3">Wholesale Cost</th>
                  <th className="text-right px-5 py-3">Retail Price</th>
                  <th className="text-right px-5 py-3">Margin</th>
                  <th className="text-right px-5 py-3">Profit / kg</th>
                </tr>
              </thead>
              <tbody>
                {costData.map((row) => (
                  <tr key={row.cut} className="border-t border-gray-800 hover:bg-gray-800/30">
                    <td className="px-5 py-3 font-medium">{row.cut}</td>
                    <td className="px-5 py-3 text-right text-gray-400">R{row.wholesaleCost}{row.unit}</td>
                    <td className="px-5 py-3 text-right text-gray-300">R{row.retailPrice}{row.unit}</td>
                    <td className="px-5 py-3 text-right">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        row.margin >= 45 ? 'bg-green-900/50 text-green-400' :
                        row.margin >= 40 ? 'bg-yellow-900/50 text-yellow-400' :
                        'bg-red-900/50 text-red-400'
                      }`}>{row.margin}%</span>
                    </td>
                    <td className="px-5 py-3 text-right text-green-400">R{row.retailPrice - row.wholesaleCost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Invoices */}
        <div>
          <h2 className="font-semibold text-sm mb-4">Recent Invoices</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-800/50 text-gray-400">
                <tr>
                  <th className="text-left px-5 py-3">Invoice</th>
                  <th className="text-left px-5 py-3">Customer</th>
                  <th className="text-right px-5 py-3">Amount</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-left px-5 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-t border-gray-800 hover:bg-gray-800/30">
                    <td className="px-5 py-3 font-mono text-red-400">{inv.id}</td>
                    <td className="px-5 py-3">{inv.customer}</td>
                    <td className="px-5 py-3 text-right">R{inv.amount.toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColors[inv.status]}`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-400">{inv.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
