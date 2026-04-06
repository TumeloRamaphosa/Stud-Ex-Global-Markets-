// Market Audit Types — Hex.tech-style dashboard data structures

export interface AuditScore {
  overall: number; // 0-100
  categories: CategoryScore[];
}

export interface CategoryScore {
  name: string;
  score: number; // 0-10
  maxScore: number;
  priority: 'Solid' | 'Needs Work' | 'Critical';
  color: string;
}

export interface CriticalIssue {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  fix: string;
  fixSteps?: string[];
  impact: string;
}

export interface ConversionOptimization {
  id: string;
  title: string;
  currentState: string;
  recommendation: string;
  steps: string[];
  estimatedLift: string;
}

export interface SEOItem {
  issue: string;
  fix: string;
  status: 'good' | 'needs-fix' | 'missing';
}

export interface Competitor {
  name: string;
  strengths: string;
  weaknesses: string;
}

export interface CompetitiveAdvantage {
  title: string;
  description: string;
}

export interface ContentPillar {
  pillar: string;
  ideas: string;
  platform: string;
}

export interface HookIdea {
  text: string;
  category: string;
}

export interface EmailFlow {
  name: string;
  emails: number;
  description: string;
}

export interface ActionItem {
  task: string;
  completed: boolean;
}

export interface ActionWeek {
  week: number;
  title: string;
  items: ActionItem[];
}

export interface ProjectedImpact {
  optimization: string;
  conversionLift: string;
  revenueImpact: 'High' | 'Medium' | 'Long-term' | 'Prevents bounce';
}

export interface ProductPageData {
  productName: string;
  pricing: string[];
  images: string;
  ctas: string;
  certifications: string;
  claims: string;
  reviews: string;
  shipping: string;
}

export interface AuditReport {
  id: string;
  url: string;
  domain: string;
  createdAt: string;
  status: 'analyzing' | 'complete' | 'error';

  // Scores
  scores: AuditScore;

  // Page data
  productPage: ProductPageData;

  // Issues & Optimizations
  criticalIssues: CriticalIssue[];
  conversionOptimizations: ConversionOptimization[];

  // SEO
  seoItems: SEOItem[];

  // Competitive
  competitors: Competitor[];
  competitiveAdvantages: CompetitiveAdvantage[];
  competitiveGaps: string[];

  // Content
  contentPillars: ContentPillar[];
  hookIdeas: HookIdea[];
  emailFlows: EmailFlow[];

  // Action Plan
  actionPlan: ActionWeek[];

  // Impact
  projectedImpacts: ProjectedImpact[];
  summaryEstimate: string;

  // Sources
  sources: string[];
}

export interface AuditRequest {
  url: string;
}

export interface AuditHistoryItem {
  id: string;
  url: string;
  domain: string;
  score: number;
  createdAt: string;
  status: 'complete' | 'error';
}
