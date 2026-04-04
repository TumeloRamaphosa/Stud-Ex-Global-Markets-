import { NextRequest, NextResponse } from 'next/server';
import type { AuditReport } from '@/lib/audit-types';

// Helper: extract domain from URL
function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return url;
  }
}

// Helper: generate unique ID
function generateId(): string {
  return `audit_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

// Fetch and extract text content from a URL
async function fetchWebsite(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; StudexAuditBot/1.0)',
      'Accept': 'text/html,application/xhtml+xml',
    },
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);
  const html = await res.text();

  // Strip HTML tags for analysis, keep structure hints
  const text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return text.slice(0, 15000); // Limit for analysis
}

// Extract meta tags from HTML
function extractMeta(html: string): Record<string, string> {
  const meta: Record<string, string> = {};
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  if (titleMatch) meta.title = titleMatch[1].trim();

  const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  if (descMatch) meta.description = descMatch[1].trim();

  const ogImageMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i);
  if (ogImageMatch) meta.ogImage = ogImageMatch[1].trim();

  return meta;
}

// Analyze page content and generate scores
function analyzeContent(url: string, text: string, rawHtml: string): AuditReport {
  const domain = getDomain(url);
  const meta = extractMeta(rawHtml);
  const lowerText = text.toLowerCase();

  // --- Scoring heuristics ---
  let brandScore = 5;
  let uxScore = 5;
  let socialProofScore = 3;
  let seoScore = 4;
  let conversionScore = 4;
  let contentScore = 4;
  let competitiveScore = 5;

  // Brand signals
  if (lowerText.includes('premium') || lowerText.includes('luxury') || lowerText.includes('quality')) brandScore += 2;
  if (lowerText.includes('certified') || lowerText.includes('authentic')) brandScore += 1;
  if (meta.title && meta.title.length > 10) brandScore += 1;
  brandScore = Math.min(brandScore, 10);

  // UX signals
  if (lowerText.includes('add to cart') || lowerText.includes('buy now')) uxScore += 1;
  if (rawHtml.includes('loading="lazy"') || rawHtml.includes('srcset=')) uxScore += 1;
  if (rawHtml.includes('viewport')) uxScore += 1;
  if (lowerText.includes('search') || rawHtml.includes('type="search"')) uxScore += 1;
  uxScore = Math.min(uxScore, 10);

  // Social proof
  if (lowerText.includes('review') || lowerText.includes('testimonial')) socialProofScore += 2;
  if (lowerText.includes('star') || lowerText.includes('rating')) socialProofScore += 1;
  if (lowerText.includes('customer') && lowerText.includes('photo')) socialProofScore += 1;
  if (lowerText.includes('trust') || lowerText.includes('verified')) socialProofScore += 1;
  socialProofScore = Math.min(socialProofScore, 10);

  // SEO signals
  if (meta.title) seoScore += 1;
  if (meta.description) seoScore += 1;
  if (rawHtml.includes('"@type"') || rawHtml.includes('application/ld+json')) seoScore += 2;
  if (rawHtml.match(/<h1/i)) seoScore += 1;
  if (rawHtml.match(/alt="/i)) seoScore += 1;
  seoScore = Math.min(seoScore, 10);

  // Conversion signals
  if (lowerText.includes('free shipping') || lowerText.includes('free delivery')) conversionScore += 1;
  if (lowerText.includes('guarantee') || lowerText.includes('money back')) conversionScore += 1;
  if (lowerText.includes('limited') || lowerText.includes('sale')) conversionScore += 1;
  if (lowerText.includes('bundle') || lowerText.includes('subscribe')) conversionScore += 1;
  if (rawHtml.includes('countdown') || rawHtml.includes('timer')) conversionScore += 1;
  conversionScore = Math.min(conversionScore, 10);

  // Content signals
  if (lowerText.includes('blog') || lowerText.includes('article')) contentScore += 1;
  if (lowerText.includes('instagram') || lowerText.includes('tiktok')) contentScore += 1;
  if (lowerText.includes('video') || rawHtml.includes('<video')) contentScore += 1;
  if (lowerText.includes('guide') || lowerText.includes('how to')) contentScore += 1;
  contentScore = Math.min(contentScore, 10);

  // Competitive signals
  if (lowerText.includes('unique') || lowerText.includes('only')) competitiveScore += 1;
  if (lowerText.includes('award') || lowerText.includes('best')) competitiveScore += 1;
  if (lowerText.includes('international') || lowerText.includes('worldwide')) competitiveScore += 1;
  competitiveScore = Math.min(competitiveScore, 10);

  const overall = Math.round(
    ((brandScore + uxScore + socialProofScore + seoScore + conversionScore + contentScore + competitiveScore) / 70) * 100
  );

  function getPriority(score: number): 'Solid' | 'Needs Work' | 'Critical' {
    if (score >= 7) return 'Solid';
    if (score >= 5) return 'Needs Work';
    return 'Critical';
  }

  // --- Build report ---
  const report: AuditReport = {
    id: generateId(),
    url,
    domain,
    createdAt: new Date().toISOString(),
    status: 'complete',

    scores: {
      overall,
      categories: [
        { name: 'Brand & Positioning', score: brandScore, maxScore: 10, priority: getPriority(brandScore), color: '#2ea043' },
        { name: 'Product Page UX', score: uxScore, maxScore: 10, priority: getPriority(uxScore), color: '#0ea5e9' },
        { name: 'Social Proof & Trust', score: socialProofScore, maxScore: 10, priority: getPriority(socialProofScore), color: '#dc3c3c' },
        { name: 'SEO & Discoverability', score: seoScore, maxScore: 10, priority: getPriority(seoScore), color: '#e6a01e' },
        { name: 'Conversion Mechanics', score: conversionScore, maxScore: 10, priority: getPriority(conversionScore), color: '#dc3c3c' },
        { name: 'Content & Storytelling', score: contentScore, maxScore: 10, priority: getPriority(contentScore), color: '#e6a01e' },
        { name: 'Competitive Position', score: competitiveScore, maxScore: 10, priority: getPriority(competitiveScore), color: '#2ea043' },
      ],
    },

    productPage: {
      productName: meta.title || domain,
      pricing: lowerText.includes('price') || lowerText.includes('$') || lowerText.includes('r ') ? ['Pricing detected on page'] : ['No pricing found'],
      images: rawHtml.match(/<img/gi)?.length + ' images detected' || '0 images detected',
      ctas: [
        lowerText.includes('add to cart') && 'Add to Cart',
        lowerText.includes('buy now') && 'Buy Now',
        lowerText.includes('shop now') && 'Shop Now',
        lowerText.includes('subscribe') && 'Subscribe',
      ].filter(Boolean).join(', ') || 'No CTAs detected',
      certifications: [
        lowerText.includes('halal') && 'Halal',
        lowerText.includes('organic') && 'Organic',
        lowerText.includes('certified') && 'Certified',
        lowerText.includes('kosher') && 'Kosher',
      ].filter(Boolean).join(', ') || 'None detected',
      claims: text.match(/no\s+\w+|100%|pure|natural|premium|authentic/gi)?.slice(0, 5).join(', ') || 'None detected',
      reviews: lowerText.includes('review') ? 'Reviews section detected' : 'No reviews section found',
      shipping: lowerText.includes('shipping') || lowerText.includes('delivery') ? 'Shipping info detected' : 'No shipping info found',
    },

    criticalIssues: generateCriticalIssues(lowerText, rawHtml, meta),
    conversionOptimizations: generateConversionOptimizations(lowerText, rawHtml),

    seoItems: [
      { issue: 'Page Title', fix: meta.title ? `Current: "${meta.title}"` : 'Missing — add a descriptive title tag', status: meta.title ? 'good' : 'missing' },
      { issue: 'Meta Description', fix: meta.description ? `Current: "${meta.description.slice(0, 80)}..."` : 'Missing — add a meta description for search results', status: meta.description ? 'good' : 'missing' },
      { issue: 'Structured Data', fix: rawHtml.includes('application/ld+json') ? 'Schema markup detected' : 'Missing — add Product/Organization schema', status: rawHtml.includes('application/ld+json') ? 'good' : 'missing' },
      { issue: 'Image Alt Text', fix: rawHtml.includes('alt="') ? 'Alt text detected on images' : 'Missing — add alt text to all images', status: rawHtml.includes('alt="') ? 'good' : 'needs-fix' },
      { issue: 'Mobile Viewport', fix: rawHtml.includes('viewport') ? 'Viewport meta tag present' : 'Missing — add viewport meta for mobile', status: rawHtml.includes('viewport') ? 'good' : 'missing' },
      { issue: 'Blog / Content Hub', fix: lowerText.includes('blog') ? 'Blog detected' : 'No blog — add content for organic SEO traffic', status: lowerText.includes('blog') ? 'good' : 'needs-fix' },
    ],

    competitors: [
      { name: 'Direct Competitor 1', strengths: 'Established market presence, strong brand recognition', weaknesses: 'Limited online experience' },
      { name: 'Direct Competitor 2', strengths: 'Strong content marketing, active social media', weaknesses: 'Smaller product range' },
      { name: 'Direct Competitor 3', strengths: 'Competitive pricing, loyalty program', weaknesses: 'Less polished branding' },
    ],

    competitiveAdvantages: [
      { title: 'Unique Positioning', description: 'Differentiated brand identity in the market' },
      { title: 'Digital Infrastructure', description: 'Modern e-commerce platform with good UX foundations' },
      { title: 'Product Range', description: 'Diverse offerings increase average order value potential' },
    ],

    competitiveGaps: [
      'Brand story could be more prominently featured',
      'Product detail pages need richer content',
      'Subscription/loyalty program not detected',
    ],

    contentPillars: [
      { pillar: 'Education', ideas: 'How-to guides, product comparisons, buying guides', platform: 'TikTok, IG Reels' },
      { pillar: 'Behind the Scenes', ideas: 'Process, sourcing, quality checks', platform: 'IG Stories, TikTok' },
      { pillar: 'Social Proof', ideas: 'Customer unboxing, testimonials, UGC', platform: 'IG Feed, TikTok' },
      { pillar: 'Urgency / FOMO', ideas: 'Limited stock alerts, flash sales, countdowns', platform: 'IG Stories' },
      { pillar: 'Lifestyle', ideas: 'Product in use, aspirational imagery, pairing guides', platform: 'IG Feed, Pinterest' },
    ],

    hookIdeas: [
      { text: `This product from ${domain} changed everything for me`, category: 'person-conflict' },
      { text: `I tested the most expensive vs cheapest option — here's what happened`, category: 'before-after' },
      { text: `The one thing 90% of people get wrong about this`, category: 'self-discovery' },
      { text: `POV: You just opened your ${domain} delivery`, category: 'POV' },
      { text: `Why this brand is disrupting the entire industry`, category: 'listicle' },
    ],

    emailFlows: [
      { name: 'Welcome Series', emails: 3, description: 'Brand story → Best sellers → First order discount' },
      { name: 'Abandoned Cart', emails: 3, description: '1hr reminder → 24hr social proof → 72hr last chance' },
      { name: 'Post-Purchase', emails: 3, description: 'Usage guide → Review request → Cross-sell' },
      { name: 'Win-Back', emails: 2, description: '30-day "We miss you" → 60-day exclusive offer' },
      { name: 'VIP / Repeat', emails: 1, description: 'Monthly early access + exclusive deals' },
    ],

    actionPlan: [
      {
        week: 1, title: 'Fix the Foundations',
        items: [
          { task: 'Fix any pricing errors or inconsistencies', completed: false },
          { task: 'Add complete product descriptions with specifics', completed: false },
          { task: 'Add nutritional/specification information', completed: false },
          { task: 'Add usage/preparation guidance', completed: false },
        ],
      },
      {
        week: 2, title: 'Build Trust',
        items: [
          { task: 'Install and configure review collection app', completed: false },
          { task: 'Send review requests to past customers', completed: false },
          { task: 'Add trust badges and certification icons', completed: false },
          { task: 'Add brand origin story section', completed: false },
        ],
      },
      {
        week: 3, title: 'Optimize for Conversion',
        items: [
          { task: 'Add urgency mechanics (countdown, stock indicator)', completed: false },
          { task: 'Create product bundles and cross-sells', completed: false },
          { task: 'Set up abandoned cart email flow', completed: false },
          { task: 'Add exit-intent popup', completed: false },
        ],
      },
      {
        week: 4, title: 'Scale with Content',
        items: [
          { task: 'Publish 2 SEO-targeted blog posts', completed: false },
          { task: 'Create 4 short-form videos (TikTok/Reels)', completed: false },
          { task: 'Launch post-purchase review email sequence', completed: false },
          { task: 'Set up Subscribe & Save for repeat buyers', completed: false },
        ],
      },
    ],

    projectedImpacts: [
      { optimization: 'Fix critical issues', conversionLift: '+5-10%', revenueImpact: 'Prevents bounce' },
      { optimization: 'Add 15+ reviews', conversionLift: '+15-20%', revenueImpact: 'High' },
      { optimization: 'Add usage guides', conversionLift: '+5-8%', revenueImpact: 'Medium' },
      { optimization: 'Abandoned cart emails', conversionLift: '+10-15%', revenueImpact: 'High' },
      { optimization: 'Urgency mechanics', conversionLift: '+8-12%', revenueImpact: 'Medium' },
      { optimization: 'Bundle / cross-sell', conversionLift: '+20-30% AOV', revenueImpact: 'High' },
      { optimization: 'SEO content', conversionLift: '+30-50% traffic', revenueImpact: 'Long-term' },
    ],

    summaryEstimate: 'Implementing all fixes could increase conversion rate by 35-50% and average order value by 20-30% within 90 days.',

    sources: [
      'Page content analysis',
      'SEO structure audit',
      'E-commerce conversion best practices',
      'Social proof & trust signal analysis',
      'Competitive positioning assessment',
    ],
  };

  return report;
}

function generateCriticalIssues(text: string, html: string, meta: Record<string, string>): AuditReport['criticalIssues'] {
  const issues: AuditReport['criticalIssues'] = [];

  if (!meta.description) {
    issues.push({
      id: 'seo-meta',
      title: 'Missing Meta Description',
      severity: 'high',
      description: 'No meta description found. Search engines will auto-generate one, often poorly.',
      fix: 'Add a compelling 150-160 character meta description with primary keywords.',
      impact: 'Impacts click-through rates from search results by 20-30%',
    });
  }

  if (!text.includes('review') && !text.includes('testimonial')) {
    issues.push({
      id: 'social-proof',
      title: 'No Reviews or Testimonials',
      severity: 'critical',
      description: 'No customer reviews or testimonials detected on the page. This is the #1 trust killer for e-commerce.',
      fix: 'Add a review collection system and display customer testimonials prominently.',
      fixSteps: [
        'Install a review app (Judge.me, Loox, or Stamped.io)',
        'Send review requests to past customers',
        'Display reviews prominently on product pages',
        'Add a customer photos section',
      ],
      impact: 'Reviews can increase conversion rates by 15-20%',
    });
  }

  if (!html.includes('application/ld+json')) {
    issues.push({
      id: 'schema',
      title: 'Missing Structured Data',
      severity: 'medium',
      description: 'No JSON-LD structured data found. Search engines can\'t understand your page content.',
      fix: 'Add Product, Organization, and FAQ schema markup.',
      impact: 'Rich snippets can increase CTR by 20-30%',
    });
  }

  if (!text.includes('how to') && !text.includes('guide') && !text.includes('instruction')) {
    issues.push({
      id: 'no-guidance',
      title: 'No Product Usage Guidance',
      severity: 'high',
      description: 'No how-to content, guides, or usage instructions found. Customers need help getting the best experience.',
      fix: 'Add usage guides, preparation instructions, or how-to content.',
      fixSteps: [
        'Add a "How to Use" or preparation tab',
        'Include step-by-step instructions',
        'Add tips and best practices',
        'Embed a short video tutorial',
      ],
      impact: 'Reduces returns and increases repeat purchases',
    });
  }

  if (!text.includes('countdown') && !text.includes('stock') && !text.includes('only') && !text.includes('left')) {
    issues.push({
      id: 'no-urgency',
      title: 'No Urgency Mechanics',
      severity: 'medium',
      description: 'No countdown timers, stock indicators, or urgency elements detected.',
      fix: 'Add scarcity and urgency elements to drive faster decisions.',
      fixSteps: [
        'Add a countdown timer for sales',
        'Show "Only X left in stock" indicator',
        'Add "X people viewing this" social proof',
      ],
      impact: 'Urgency mechanics can increase conversion by 8-12%',
    });
  }

  // Always add at least one issue
  if (issues.length === 0) {
    issues.push({
      id: 'optimization',
      title: 'General Optimization Needed',
      severity: 'medium',
      description: 'While no critical issues were found, there are always opportunities to improve conversion.',
      fix: 'Review the optimization recommendations below for improvement areas.',
      impact: 'Continuous optimization keeps you ahead of competitors',
    });
  }

  return issues;
}

function generateConversionOptimizations(text: string, html: string): AuditReport['conversionOptimizations'] {
  const opts: AuditReport['conversionOptimizations'] = [];

  if (!text.includes('bundle') && !text.includes('also bought') && !text.includes('related')) {
    opts.push({
      id: 'cross-sell',
      title: 'No Cross-Sell / Bundle Offers',
      currentState: 'No product bundles, cross-sells, or "also bought" sections detected.',
      recommendation: 'Add product bundles and recommendation carousels to increase AOV.',
      steps: [
        'Create themed bundles (e.g., starter pack, premium set)',
        'Add "Customers Also Bought" carousel',
        'Offer "Subscribe & Save" for repeat buyers',
        'Promote bundle upsells in cart',
      ],
      estimatedLift: '+20-30% AOV increase',
    });
  }

  if (!text.includes('nutrition') && !text.includes('ingredients') && !text.includes('specification')) {
    opts.push({
      id: 'product-info',
      title: 'Missing Detailed Product Information',
      currentState: 'Product specifications, nutritional info, or detailed ingredients not found.',
      recommendation: 'Add comprehensive product details to help informed buying decisions.',
      steps: [
        'Add nutritional/specification tab',
        'Include origin/sourcing information',
        'Add material/ingredient transparency',
        'Highlight key differentiating details',
      ],
      estimatedLift: '+5-8% conversion',
    });
  }

  opts.push({
    id: 'email-recovery',
    title: 'Abandoned Cart Recovery',
    currentState: 'Cart abandonment recovery may not be fully optimized.',
    recommendation: 'Implement a 3-touch abandoned cart email sequence.',
    steps: [
      'Set up exit-intent popup with incentive',
      '1hr reminder email with product image',
      '24hr email with social proof/reviews',
      '72hr last chance with discount',
    ],
    estimatedLift: '+10-15% cart recovery',
  });

  opts.push({
    id: 'email-flows',
    title: 'Email Marketing Automation',
    currentState: 'Email marketing flows may not be fully implemented.',
    recommendation: 'Build automated email sequences for every stage of the customer journey.',
    steps: [
      'Welcome series (3 emails)',
      'Post-purchase nurture (3 emails)',
      'Win-back campaign (2 emails)',
      'VIP/repeat buyer monthly offers',
    ],
    estimatedLift: '+15-25% repeat purchase rate',
  });

  return opts;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    // Validate URL
    let validUrl: string;
    try {
      const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
      validUrl = parsed.toString();
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    // Fetch the website
    const res = await fetch(validUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; StudexAuditBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Could not reach ${validUrl} (HTTP ${res.status})` },
        { status: 422 }
      );
    }

    const rawHtml = await res.text();
    const text = rawHtml
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 15000);

    // Analyze
    const report = analyzeContent(validUrl, text, rawHtml);

    return NextResponse.json(report);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Analysis failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
