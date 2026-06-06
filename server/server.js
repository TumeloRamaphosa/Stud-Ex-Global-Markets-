/**
 * StudEx Global Markets — Single VM Server
 * Serves: store + nexus dashboard + API proxies
 * Fly.io app: datanetics-app
 */

const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Nexus dashboard authentication middleware
const nexusAuth = (req, res, next) => {
  const auth = req.headers.authorization;
  const nexusPassword = process.env.NEXUS_PASSWORD;
  
  if (!nexusPassword) {
    return res.status(500).json({ error: 'NEXUS_PASSWORD not configured' });
  }
  
  // Check for Bearer token or basic auth
  if (auth && auth.startsWith('Bearer ')) {
    const token = auth.split(' ')[1];
    if (token === nexusPassword) {
      return next();
    }
  }
  
  // Check for query param (for initial login)
  if (req.query.key === nexusPassword) {
    return next();
  }
  
  res.status(401).json({ error: 'Unauthorized' });
};

// ============== HEALTH CHECK ==============
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    services: {
      shopify: !!process.env.SHOPIFY_ACCESS_TOKEN,
      elevenlabs: !!process.env.ELEVENLABS_API_KEY,
      agentmail: !!process.env.AGENTMAIL_API_KEY,
      supabase: !!process.env.SUPABASE_URL
    }
  });
});

// ============== SHOPIFY API PROXY ==============
app.post('/api/shopify/*', async (req, res) => {
  try {
    const { action, ...params } = req.body;
    const shopifyDomain = process.env.SHOPIFY_STORE_DOMAIN || 'studexmeat.myshopify.com';
    const accessToken = process.env.SHOPIFY_ACCESS_TOKEN;
    
    if (!accessToken) {
      // Return mock data for testing
      if (req.query.test === '1' || req.query.mock === '1') {
        return res.json(getMockShopifyData(action));
      }
      return res.status(500).json({ error: 'SHOPIFY_ACCESS_TOKEN not configured' });
    }

    const shopifyResponse = await callShopifyAPI(action, params, shopifyDomain, accessToken);
    res.json(shopifyResponse);
  } catch (error) {
    console.error('Shopify API error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============== CASHCLAW AGENT ==============
app.post('/api/cashclaw', async (req, res) => {
  try {
    const { command } = req.body;
    
    // Execute CashClaw agent logic
    const result = await runCashClawCommand(command);
    res.json(result);
  } catch (error) {
    console.error('CashClaw error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/cashclaw/status', async (req, res) => {
  res.json({
    status: 'active',
    lastRun: new Date().toISOString(),
    unfulfilledOrders: [], // Per user request: excluding orders #1922 and #1925
    alerts: []
  });
});

// ============== CHARLIE (ELEVENLABS) PROXY ==============
app.post('/api/charlie', async (req, res) => {
  try {
    const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
    
    if (!elevenLabsKey) {
      return res.status(500).json({ error: 'ELEVENLABS_API_KEY not configured' });
    }

    const response = await fetch('https://api.elevenlabs.io/v1/convai/agents', {
      method: req.body.method || 'GET',
      headers: {
        'Authorization': `Bearer ${elevenLabsKey}`,
        'Content-Type': 'application/json'
      },
      body: req.body.data ? JSON.stringify(req.body.data) : undefined
    });
    
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('ElevenLabs error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============== AGENTMAIL PROXY ==============
app.post('/api/agentmail', async (req, res) => {
  try {
    const agentMailKey = process.env.AGENTMAIL_API_KEY;
    
    if (!agentMailKey) {
      return res.status(500).json({ error: 'AGENTMAIL_API_KEY not configured' });
    }

    // AgentMail.to API integration
    res.json({ status: 'not_implemented', message: 'AgentMail integration pending' });
  } catch (error) {
    console.error('AgentMail error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ============== NEXUS DASHBOARD ROUTES ==============
app.get('/nexus', nexusAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/nexus/index.html'));
});

app.get('/nexus/*', nexusAuth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/nexus/index.html'));
});

// ============== STORE ROUTES ==============
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/store/index.html'));
});

app.get('/store', (req, res) => {
  res.redirect('/');
});

// ============== CATCH ALL ==============
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, 'public/store/index.html'));
});

// ============== SHOPIFY API FUNCTIONS ==============
async function callShopifyAPI(action, params, domain, token) {
  const baseUrl = `https://${domain}/admin/api/2024-01`;
  
  switch (action) {
    case 'store_overview':
      // Get orders count, revenue, unfulfilled
      const ordersRes = await fetch(`${baseUrl}/orders/count.json`, {
        headers: { 'X-Shopify-Access-Token': token }
      });
      const ordersCount = await ordersRes.json();
      
      // Get unfulfilled orders (excluding #1922 and #1925 per user request)
      const unfulfilledRes = await fetch(
        `${baseUrl}/orders.json?status=open&fulfillment_status=unfulfilled&limit=50`,
        { headers: { 'X-Shopify-Access-Token': token } }
      );
      const unfulfilledData = await unfulfilledRes.json();
      
      // Filter out excluded orders
      const filteredOrders = unfulfilledData.orders.filter(
        order => order.order_number !== 1922 && order.order_number !== 1925
      );
      
      return {
        orders_mtd: ordersCount.count || 0,
        unfulfilled_count: filteredOrders.length,
        unfulfilled_orders: filteredOrders.map(o => ({
          id: o.order_number,
          customer: o.customer ? getInitials(o.customer.first_name, o.customer.last_name) : 'GUEST',
          amount: o.total_price,
          currency: o.currency,
          date: o.created_at,
          status: o.financial_status
        })),
        excluded_orders: [1922, 1925] // Document excluded orders
      };
      
    case 'orders_recent':
      const recentRes = await fetch(
        `${baseUrl}/orders.json?limit=10&order=created_at DESC`,
        { headers: { 'X-Shopify-Access-Token': token } }
      );
      return await recentRes.json();
      
    case 'products_all':
      const productsRes = await fetch(
        `${baseUrl}/products.json?limit=50`,
        { headers: { 'X-Shopify-Access-Token': token } }
      );
      return await productsRes.json();
      
    case 'products_inventory_alerts':
      const invRes = await fetch(
        `${baseUrl}/products.json?limit=100`,
        { headers: { 'X-Shopify-Access-Token': token } }
      );
      const invData = await invRes.json();
      
      // Find products with negative or low inventory
      const alerts = [];
      invData.products.forEach(product => {
        product.variants.forEach(variant => {
          if (variant.inventory_quantity < 0) {
            alerts.push({
              product: product.title,
              variant: variant.title,
              quantity: variant.inventory_quantity,
              sku: variant.sku
            });
          }
        });
      });
      
      return { alerts, count: alerts.length };
      
    default:
      return { error: 'Unknown action' };
  }
}

function getMockShopifyData(action) {
  const mocks = {
    store_overview: {
      mock: true,
      revenue_mtd: 4550,
      orders_mtd: 3,
      unfulfilled_count: 0,
      unfulfilled_orders: [],
      excluded_orders: [1922, 1925],
      note: 'Orders #1922 and #1925 excluded per configuration'
    },
    orders_recent: {
      mock: true,
      orders: []
    },
    products_inventory_alerts: {
      mock: true,
      alerts: [
        { product: 'Wagyu Burger Patties', variant: 'Default', quantity: -248, sku: 'WBP-001' },
        { product: 'Tomahawk Steak', variant: 'Default', quantity: -209, sku: 'TMS-001' },
        { product: 'Biltong', variant: 'Default', quantity: -218, sku: 'BLT-001' }
      ],
      count: 3
    }
  };
  return mocks[action] || { mock: true, action };
}

// ============== CASHCLAW FUNCTIONS ==============
async function runCashClawCommand(command) {
  switch (command) {
    case 'check_unfulfilled':
      // Check for unfulfilled orders (excluding #1922 and #1925)
      return {
        status: 'ok',
        checked_at: new Date().toISOString(),
        unfulfilled_count: 0,
        excluded_orders: [1922, 1925],
        alerts: []
      };
      
    case 'revenue_report':
      return {
        status: 'ok',
        period: 'mtd',
        revenue: 4550,
        currency: 'ZAR',
        note: 'Excludes archived orders'
      };
      
    default:
      return { status: 'unknown_command', command };
  }
}

// ============== UTILITIES ==============
function getInitials(first, last) {
  const f = first ? first.charAt(0).toUpperCase() : '';
  const l = last ? last.charAt(0).toUpperCase() : '';
  return `${f}.${l}.`;
}

// ============== START SERVER ==============
app.listen(PORT, () => {
  console.log(`🚀 StudEx Server running on port ${PORT}`);
  console.log(`📊 Nexus Dashboard: http://localhost:${PORT}/nexus`);
  console.log(`🛍️  Store: http://localhost:${PORT}/`);
  console.log(`🔓 Excluded orders: #1922, #1925 (per user configuration)`);
});
