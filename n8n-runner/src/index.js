import express from 'express';
import { calculateRouter } from './routes/calculate.js';
import { triggerInvoiceRouter } from './routes/trigger-invoice.js';
import { priceLookupRouter } from './routes/price-lookup.js';
import { emailRouter } from './routes/email.js';
import { whatsappRouter } from './routes/whatsapp.js';
import { workflowsRouter } from './routes/workflows.js';
import { registerRouter } from './routes/register.js';

const app = express();
const PORT = process.env.PORT || process.env.N8N_RUNNER_PORT || 3003;

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'studex-n8n-runner', timestamp: new Date().toISOString() });
});

app.use(calculateRouter);
app.use(triggerInvoiceRouter);
app.use(priceLookupRouter);
app.use(emailRouter);
app.use(whatsappRouter);
app.use(workflowsRouter);
app.use(registerRouter);

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', message: err.message });
});

app.listen(PORT, () => {
  console.log(`Studex n8n-runner listening on port ${PORT}`);
});
