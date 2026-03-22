export interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startTime?: Date;
  endTime?: Date;
  result?: string;
  error?: string;
}

export interface LarryWorkflowSession {
  id: string;
  title: string;
  niche: string;
  createdAt: Date;
  steps: WorkflowStep[];
  reportData: {
    hookFormula: string;
    slides: string[];
    caption: string;
    cta: string;
    platforms: string[];
    scheduledTime?: Date;
    engagement?: {
      views: number;
      likes: number;
      shares: number;
      comments: number;
    };
  };
  memory: {
    performancePatterns: string[];
    successFormulas: string[];
    optimizations: string[];
  };
}

export class LarryWorkflowManager {
  private sessions: Map<string, LarryWorkflowSession> = new Map();

  createSession(title: string, niche: string): LarryWorkflowSession {
    const sessionId = `session_${Date.now()}`;
    const session: LarryWorkflowSession = {
      id: sessionId,
      title,
      niche,
      createdAt: new Date(),
      steps: [
        {
          id: 'hook',
          name: 'Generate Hook',
          description: 'Create viral-worthy hook based on niche',
          status: 'pending',
        },
        {
          id: 'slides',
          name: 'Create Slides',
          description: 'Design 6-slide carousel content',
          status: 'pending',
        },
        {
          id: 'caption',
          name: 'Write Caption & CTA',
          description: 'Craft engaging caption and call-to-action',
          status: 'pending',
        },
        {
          id: 'schedule',
          name: 'Schedule Posts',
          description: 'Schedule across platforms',
          status: 'pending',
        },
        {
          id: 'monitor',
          name: 'Monitor & Report',
          description: 'Track engagement and generate insights',
          status: 'pending',
        },
      ],
      reportData: {
        hookFormula: '',
        slides: [],
        caption: '',
        cta: '',
        platforms: ['tiktok', 'instagram'],
      },
      memory: {
        performancePatterns: [],
        successFormulas: [],
        optimizations: [],
      },
    };

    this.sessions.set(sessionId, session);
    return session;
  }

  getSession(sessionId: string): LarryWorkflowSession | undefined {
    return this.sessions.get(sessionId);
  }

  getAllSessions(): LarryWorkflowSession[] {
    return Array.from(this.sessions.values()).sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  updateStepStatus(
    sessionId: string,
    stepId: string,
    status: WorkflowStep['status'],
    result?: string,
    error?: string
  ): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const step = session.steps.find((s) => s.id === stepId);
    if (!step) return false;

    step.status = status;
    if (status === 'in_progress') step.startTime = new Date();
    if (status === 'completed' || status === 'failed') step.endTime = new Date();
    if (result) step.result = result;
    if (error) step.error = error;

    return true;
  }

  updateReportData(sessionId: string, data: Partial<LarryWorkflowSession['reportData']>): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    session.reportData = { ...session.reportData, ...data };
    return true;
  }

  addMemory(sessionId: string, type: keyof LarryWorkflowSession['memory'], entry: string): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    const memory = session.memory[type];
    if (!memory.includes(entry)) {
      memory.push(entry);
    }
    return true;
  }

  generateReport(sessionId: string): string {
    const session = this.sessions.get(sessionId);
    if (!session) return '';

    const completedSteps = session.steps.filter((s) => s.status === 'completed');
    const failedSteps = session.steps.filter((s) => s.status === 'failed');

    const report = `
📊 LARRY SKILL CAMPAIGN REPORT
==============================
Session: ${session.title}
Niche: ${session.niche}
Created: ${session.createdAt.toLocaleString()}

EXECUTION STATUS
${session.steps
  .map(
    (s) =>
      `${s.status === 'completed' ? '✅' : s.status === 'failed' ? '❌' : '⏳'} ${s.name}: ${s.status}`
  )
  .join('\n')}

CONTENT CREATED
Hook: ${session.reportData.hookFormula}
Slides: ${session.reportData.slides.length}/6 created
Caption: ${session.reportData.caption ? '✓' : '✗'}
CTA: ${session.reportData.cta ? '✓' : '✗'}
Platforms: ${session.reportData.platforms.join(', ')}

ENGAGEMENT METRICS
${
  session.reportData.engagement
    ? `Views: ${session.reportData.engagement.views}
Likes: ${session.reportData.engagement.likes}
Shares: ${session.reportData.engagement.shares}
Comments: ${session.reportData.engagement.comments}`
    : 'Pending tracking...'
}

MEMORY & LEARNINGS
Performance Patterns:
${session.memory.performancePatterns.map((p) => `• ${p}`).join('\n') || 'None recorded yet'}

Success Formulas:
${session.memory.successFormulas.map((f) => `• ${f}`).join('\n') || 'None recorded yet'}

Optimizations:
${session.memory.optimizations.map((o) => `• ${o}`).join('\n') || 'None recorded yet'}

SUMMARY
Completed: ${completedSteps.length}/${session.steps.length} steps
Failed: ${failedSteps.length} steps
Success Rate: ${Math.round((completedSteps.length / session.steps.length) * 100)}%
    `.trim();

    return report;
  }
}

// Singleton instance
let instance: LarryWorkflowManager | null = null;

export function getLarryWorkflowManager(): LarryWorkflowManager {
  if (!instance) {
    instance = new LarryWorkflowManager();
  }
  return instance;
}
