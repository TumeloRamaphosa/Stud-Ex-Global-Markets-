'use client';

import { useEffect, useState } from 'react';
import { Check, CreditCard, ShieldCheck, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useAuth } from '@/components/providers/AuthProvider';
import {
  BILLING_PLANS,
  paymentsApi,
  type BillingPlan,
  type PaymentStatus,
} from '@/lib/payments';

export default function BillingPage() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({
    status: 'none',
  });
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [syncingCallback, setSyncingCallback] = useState(false);

  useEffect(() => {
    async function loadPaymentStatus() {
      if (!user) return;

      try {
        const params = new URLSearchParams(window.location.search);
        const callback = {
          id: params.get('id') || undefined,
          status: params.get('status') || undefined,
          externalReference: params.get('externalReference') || undefined,
        };

        if (callback.id || callback.externalReference) {
          setSyncingCallback(true);
          const synced = await paymentsApi.syncStitchCallback(callback);
          setPaymentStatus(synced);
          window.history.replaceState({}, document.title, window.location.pathname);
          toast.success('Stitch payment status updated');
          return;
        }

        const latest = await paymentsApi.getPaymentStatus(user.uid);
        setPaymentStatus(latest);
      } catch (error) {
        console.warn('Unable to load payment status:', error);
      } finally {
        setSyncingCallback(false);
      }
    }

    loadPaymentStatus();
  }, [user]);

  const handleCheckout = async (plan: BillingPlan) => {
    setLoadingPlan(plan.id);
    try {
      const { url } = await paymentsApi.createPaymentRequest(plan);
      window.location.href = url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to start Stitch payment.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const isPaid = paymentStatus.status === 'completed';

  return (
    <div className="min-h-screen bg-gradient-light text-slate-900">
      <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 overflow-auto">
          <div className="mx-auto w-full max-w-6xl p-4 sm:p-6 lg:p-8">
            <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-primary-100 bg-white/80 px-3 py-1 text-sm font-medium text-primary-700 shadow-sm">
                  <CreditCard size={16} />
                  Stitch-ready payment gateway
                </div>
                <h1 className="mb-2 text-3xl font-bold sm:text-4xl">
                  Stitch payments
                </h1>
                <p className="max-w-2xl text-slate-600">
                  Choose a payment package for trade workflows, marketing automation,
                  and Remotion-powered creative previews. Checkout is handled by Stitch
                  through Firebase Cloud Functions.
                </p>
              </div>
            </div>

            <Card className="mb-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Latest payment</h2>
                  <p className="text-sm text-slate-500">
                    {syncingCallback
                      ? 'Confirming your Stitch payment status...'
                      : isPaid
                      ? `Your latest Stitch payment is ${paymentStatus.status}.`
                      : 'No completed Stitch payment is connected yet.'}
                  </p>
                  {paymentStatus.externalReference && (
                    <p className="mt-1 text-xs text-slate-400">
                      Reference: {paymentStatus.externalReference}
                    </p>
                  )}
                </div>
                <Badge variant={isPaid ? 'success' : 'warning'}>
                  {isPaid ? 'Paid' : paymentStatus.status}
                </Badge>
              </div>
            </Card>

            <div className="grid gap-6 lg:grid-cols-3">
              {BILLING_PLANS.map((plan) => (
                <Card
                  key={plan.id}
                  className={
                    plan.highlight
                      ? 'border-primary-300 bg-white shadow-lg ring-2 ring-primary-100'
                      : undefined
                  }
                >
                  <div className="mb-6 flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-bold">{plan.name}</h2>
                      <p className="mt-2 text-sm text-slate-500">{plan.description}</p>
                    </div>
                    {plan.highlight && <Badge>Popular</Badge>}
                  </div>

                  <div className="mb-6">
                    <span className="text-4xl font-black">{plan.price}</span>
                  </div>

                  <ul className="mb-8 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-3 text-sm text-slate-600">
                        <Check className="mt-0.5 h-4 w-4 flex-none text-green-600" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    fullWidth
                    variant={plan.highlight ? 'primary' : 'secondary'}
                    isLoading={loadingPlan === plan.id}
                    disabled={plan.amountZar <= 0 || Boolean(loadingPlan)}
                    onClick={() => handleCheckout(plan)}
                  >
                    {plan.amountZar > 0 ? 'Pay with Stitch' : 'Contact sales'}
                  </Button>
                </Card>
              ))}
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-primary-100 bg-white/80 p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-2 text-primary-700">
                  <ShieldCheck size={20} />
                  <h3 className="font-semibold text-slate-900">Secure by default</h3>
                </div>
                <p className="text-sm text-slate-600">
                  Stitch client secrets stay inside Firebase Functions. The browser only
                  receives a hosted Stitch payment URL.
                </p>
              </div>
              <div className="rounded-2xl border border-primary-100 bg-white/80 p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-2 text-gold-600">
                  <Sparkles size={20} />
                  <h3 className="font-semibold text-slate-900">Premium-ready</h3>
                </div>
                <p className="text-sm text-slate-600">
                  Payment status is stored in Firestore so premium marketing, analytics,
                  and video rendering can be gated consistently.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
