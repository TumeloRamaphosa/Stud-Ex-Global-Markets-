import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(cors({ origin: true }));
app.use(express.json());

const PORT = parseInt(process.env.PORT || '8080', 10);
const AGENT_ID = process.env.AGENT_ID || uuidv4();
const CLIENT_ID = process.env.CLIENT_ID || 'unknown';

interface Message {
  id: string;
  role: 'user' | 'agent';
  content: string;
  timestamp: string;
}

interface AgentContext {
  clientId: string;
  conversationHistory: Message[];
  metadata: Record<string, string>;
  createdAt: string;
}

const context: AgentContext = {
  clientId: CLIENT_ID,
  conversationHistory: [],
  metadata: {},
  createdAt: new Date().toISOString(),
};

function generateAgentResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();

  if (lower.includes('deal') || lower.includes('pipeline')) {
    return `I can help you analyze your deal pipeline. Based on market trends, here are my recommendations:\n\n1. **Prioritize high-value consignments** above $50K — they have a 73% close rate on Studex.\n2. **Follow up within 24 hours** on new leads to maintain momentum.\n3. **Use collaborative notes** to keep all stakeholders aligned.\n\nWould you like me to drill into a specific deal or run a valuation analysis?`;
  }

  if (lower.includes('market') || lower.includes('trend') || lower.includes('analysis')) {
    return `Here's a snapshot of current market conditions:\n\n📊 **Global Consignment Market**\n- Luxury goods: +12% YoY demand\n- Industrial equipment: Stable, +2% QoQ\n- Commodities: Volatile, watch precious metals\n\n📈 **Top Performing Sectors This Quarter**\n1. Technology hardware\n2. Automotive parts\n3. Fine art & collectibles\n\nI can provide a deeper analysis on any sector. What interests you?`;
  }

  if (lower.includes('kyc') || lower.includes('verification') || lower.includes('compliance')) {
    return `Here's your KYC/compliance status overview:\n\n✅ **Identity Verification**: Ensure all documents are current\n- Passport/ID: Check expiry dates\n- Proof of address: Must be < 3 months old\n- Business registration: Annual renewal\n\n⚠️ **Tips for faster verification**:\n- Submit high-resolution scans\n- Ensure all corners of documents are visible\n- Business entities need Articles of Incorporation\n\nNeed help with a specific document or verification step?`;
  }

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return `Hello! I'm your Studex AI Agent running in a secure sandbox. I can help you with:\n\n🤝 **Deal Analysis** — Evaluate opportunities and track your pipeline\n📊 **Market Intelligence** — Real-time trends and sector analysis\n📋 **Compliance** — KYC guidance and verification status\n⏱️ **Productivity** — Time tracking insights and scheduling\n💡 **Strategy** — Investment recommendations and risk assessment\n\nWhat would you like to explore?`;
  }

  if (lower.includes('help') || lower.includes('what can you do')) {
    return `I'm your dedicated AI trading assistant. Here's what I can do:\n\n**Analysis & Research**\n- Market trend analysis and forecasts\n- Deal valuation and risk scoring\n- Competitor benchmarking\n\n**Operations**\n- Pipeline optimization recommendations\n- Meeting preparation and summaries\n- Document review assistance\n\n**Compliance & Risk**\n- KYC/KYB guidance\n- Regulatory updates for your markets\n- Risk assessment on potential deals\n\nJust ask me anything related to your trading operations!`;
  }

  return `I understand you're asking about: "${userMessage}"\n\nAs your Studex AI Agent, I can analyze this in the context of your trading operations. Could you provide more details about:\n- Which specific deal or market this relates to?\n- What outcome you're looking for?\n- Any time constraints I should consider?\n\nThe more context you share, the better I can assist you.`;
}

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    agentId: AGENT_ID,
    clientId: CLIENT_ID,
    uptime: process.uptime(),
    messageCount: context.conversationHistory.length,
  });
});

// Get agent info
app.get('/info', (_req, res) => {
  res.json({
    agentId: AGENT_ID,
    clientId: CLIENT_ID,
    createdAt: context.createdAt,
    messageCount: context.conversationHistory.length,
    capabilities: [
      'deal_analysis',
      'market_intelligence',
      'compliance_guidance',
      'productivity_insights',
      'strategy_recommendations',
    ],
  });
});

// Chat endpoint
app.post('/chat', (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'message is required and must be a string' });
  }

  const userMsg: Message = {
    id: uuidv4(),
    role: 'user',
    content: message,
    timestamp: new Date().toISOString(),
  };
  context.conversationHistory.push(userMsg);

  const responseContent = generateAgentResponse(message);

  const agentMsg: Message = {
    id: uuidv4(),
    role: 'agent',
    content: responseContent,
    timestamp: new Date().toISOString(),
  };
  context.conversationHistory.push(agentMsg);

  res.json({
    response: agentMsg,
    conversationLength: context.conversationHistory.length,
  });
});

// Get conversation history
app.get('/history', (_req, res) => {
  res.json({
    clientId: CLIENT_ID,
    messages: context.conversationHistory,
    total: context.conversationHistory.length,
  });
});

// Clear conversation
app.post('/reset', (_req, res) => {
  context.conversationHistory = [];
  res.json({ message: 'Conversation history cleared' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Studex AI Agent started on port ${PORT}`);
  console.log(`Agent ID: ${AGENT_ID}`);
  console.log(`Client ID: ${CLIENT_ID}`);
});
