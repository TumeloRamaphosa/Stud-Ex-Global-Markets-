'use client';

import { useEffect, useState } from 'react';
import { Check, CreditCard, ExternalLink, ShieldCheck, Sparkles } from 'lucide-react';
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
  type SubscriptionStatus,
} from '@/lib/payments';

export default function BillingPage() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    status: 'none',
  });
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [loadingPortal, setLoadingPortal] = useState(false);

  useEffect(() => {
    async function loadSubscription() {
      if (!user) return;

      try {
        const status = await paymentsApi.getSubscription(user.uid);
        setSubscription(status);
      } catch (error) {
        console.warn('Unable to load subscription status:', error);
      }
    }

    loadSubscription();
  }, [user]);

  const handleCheckout = async (plan: BillingPlan) => {
    setLoadingPlan(plan.id);
    try {
      const { url } = await paymentsApi.createCheckoutSession(plan);
      window.location.href = url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to start checkout.');
    } finally {
      setLoadingPlan(null);
    }
  };

  const handlePortal = async () => {
    setLoadingPortal(true);
    try {
      const { url } = await paymentsApi.createPortalSession();
      window.location.href = url;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to open billing portal.');
    } finally {
      setLoadingPortal(false);
    }
  };

  const isSubscribed =
    subscription.status === 'active' || subscription.status === 'trialing';

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
                  Stripe-ready payment gateway
                </div>
                <h1 className="mb-2 text-3xl font-bold sm:text-4xl">
                  Billing & subscriptions
                </h1>
                <p className="max-w-2xl text-slate-600">
                  Choose a web billing plan for trade workflows, marketing automation,
                  and Remotion-powered creative previews. Checkout is handled by Stripe
                  through Firebase Cloud Functions.
                </p>
              </div>

              <Button
                variant="secondary"
                icon={<ExternalLink size={18} />}
                isLoading={loadingPortal}
                onClick={handlePortal}
              >
                Manage billing
              </Button>
            </div>

            <Card className="mb-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold">Current plan</h2>
                  <p className="text-sm text-slate-500">
                    {isSubscribed
                      ? `Your subscription is ${subscription.status}.`
                      : 'No active subscription is connected yet.'}
                  </p>
                </div>
                <Badge variant={isSubscribed ? 'success' : 'warning'}>
                  {isSubscribed ? 'Active' : 'Not subscribed'}
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
                    disabled={!plan.priceId || Boolean(loadingPlan)}
                    onClick={() => handleCheckout(plan)}
                  >
                    {plan.priceId ? 'Start checkout' : 'Configure Stripe price ID'}
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
                  Stripe secret keys stay inside Firebase Functions. The browser only
                  receives hosted Checkout and Portal URLs.
                </p>
              </div>
              <div className="rounded-2xl border border-primary-100 bg-white/80 p-5 shadow-sm">
                <div className="mb-3 flex items-center gap-2 text-gold-600">
                  <Sparkles size={20} />
                  <h3 className="font-semibold text-slate-900">Premium-ready</h3>
                </div>
                <p className="text-sm text-slate-600">
                  Subscription status is stored in Firestore so premium marketing,
                  analytics, and video rendering can be gated consistently.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
