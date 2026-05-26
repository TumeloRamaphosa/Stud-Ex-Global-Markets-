# Studex Trade Week Build-Out Plan

This repo is best built as a light, payment-enabled trade collaboration platform with a marketing engine for short-form deal and product content.

## High-value skills to implement

1. **Deal matching skill**
   - Match investors, entrepreneurs, and trade opportunities by sector, geography, ticket size, and risk profile.
   - Surface ranked opportunities in the dashboard and deal pipeline.

2. **Trade concierge skill**
   - Turn user goals into next actions: documents to request, counterparties to contact, and diligence tasks to complete.
   - Works well with existing deals, messages, and tracker modules.

3. **Marketing content skill**
   - Use the current six-slide wizard plus Remotion preview to generate short-form videos for TikTok, Instagram Reels, Shorts, and LinkedIn.
   - Track hooks, CTAs, and conversion outcomes in the existing marketing analytics model.

4. **Compliance/KYC skill**
   - Expand the existing KYC fields into document collection, review status, reminders, and verified trader gating.

5. **Revenue and subscription skill**
   - Use Stripe Checkout for web billing.
   - Gate premium features such as advanced matching, campaign analytics, and video rendering from Firestore subscription status.

6. **Trade intelligence skill**
   - Aggregate market notes, deal updates, and messages into daily briefs.
   - Later connect to external data sources for country, sector, and commodity updates.

## Best build sequence

1. **Design foundation**
   - Keep a light default UI with white surfaces, soft blue borders, and gold accent moments.
   - Maintain reusable Tailwind primitives (`Card`, `Button`, `Input`, `Badge`) as the primary design surface.

2. **Billing foundation**
   - Configure Stripe environment variables:
     - `STRIPE_SECRET_KEY`
     - `STRIPE_WEBHOOK_SECRET`
     - `PUBLIC_APP_URL`
     - `NEXT_PUBLIC_FUNCTIONS_API_URL`
     - `NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID`
     - `NEXT_PUBLIC_STRIPE_GROWTH_PRICE_ID`
     - `NEXT_PUBLIC_STRIPE_ENTERPRISE_PRICE_ID`
   - Use `/settings/billing` as the plan-selection and subscription management surface.
   - Use the `subscriptions/{uid}` document to gate premium features.

3. **Remotion marketing engine**
   - The current implementation adds an in-browser Remotion Player preview.
   - Next step: add server rendering with Remotion Lambda or a Firebase/Cloud Run render worker.
   - Store rendered MP4 files in Firebase Storage and save `videoUrl` on marketing posts.

4. **Feature gating**
   - Starter: core deals, drafts, basic previews.
   - Growth: campaigns, analytics, richer Remotion templates.
   - Enterprise: compliance workflows, custom onboarding, concierge support.

5. **Production hardening**
   - Move browser-side third-party API secrets server-side.
   - Add Firestore security rules for subscriptions, marketing posts, and KYC documents.
   - Add tests around payment webhook sync, premium gating, and marketing post creation.
