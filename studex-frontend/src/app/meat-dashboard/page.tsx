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

const integrations: Integration[] = [
  { name: 'QuickBooks', status: 'connected', lastSync: '2 min ago' },
  { name: 'Shopify', status: 'connected', lastSync: '5 min ago' },
  { name: 'Google Sheets', status: 'connected', lastSync: '10 min ago' },
  { name: 'n8n Workflows', status: 'connected', lastSync: '1 min ago' },
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

  const [invoiceForm, setInvoiceForm] = useState({
    customerName: '', email: '', cut: '', weight: '', marbleScore: '',
  });
  const [invoiceStatus, setInvoiceStatus] = useState('');

  useEffect(() => {
    fetch('/api/quickbooks?action=invoices')
      .then((r) => r.json())
      .then((d) => { if (d.invoices) setInvoices(d.invoices); })
      .catch(() => {});
  }, []);

  const createInvoice = async () => {
    setInvoiceStatus('Creating invoice...');
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
            description: `${invoiceForm.cut} (Marble: ${invoiceForm.marbleScore})`,
          }],
        }),
      });
      const data = await res.json();
      setInvoiceStatus(data.ok ? `Invoice created: ${data.invoice?.Id}` : `Error: ${JSON.stringify(data)}`);
    } catch {
      setInvoiceStatus('Failed to create invoice');
    }
  };

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-900/50 text-yellow-400',
    created: 'bg-blue-900/50 text-blue-400',
    sent: 'bg-purple-900/50 text-purple-400',
    paid: 'bg-green-900/50 text-green-400',
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Operations Dashboard</h1>
          <p className="text-sm text-gray-500">Cost management, invoicing, and integrations</p>
        </div>

        {/* Invoice Pipeline */}
        <div className="grid grid-cols-4 gap-4 mb-8">
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

        <div className="grid grid-cols-3 gap-6 mb-8">
          {/* Integration Status */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h2 className="font-semibold text-sm mb-4">Integrations</h2>
            <div className="space-y-3">
              {integrations.map((intg) => (
                <div key={intg.name} className="flex items-center justify-between bg-gray-800/50 border border-gray-800 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${
                      intg.status === 'connected' ? 'bg-green-400' :
                      intg.status === 'error' ? 'bg-red-400' : 'bg-gray-500'
                    }`} />
                    <span className="text-sm font-medium">{intg.name}</span>
                  </div>
                  <span className="text-xs text-gray-500">{intg.lastSync}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Invoice Form */}
          <div className="col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5">
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
              className="mt-4 w-full py-2.5 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-semibold transition-colors"
            >
              Create Invoice (15% VAT)
            </button>
            {invoiceStatus && <p className="text-xs text-gray-400 mt-2">{invoiceStatus}</p>}
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
