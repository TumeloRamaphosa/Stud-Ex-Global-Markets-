const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const META_API = 'https://graph.facebook.com/v20.0';
let ACCESS_TOKEN = process.env.META_ACCESS_TOKEN || '';
let AD_ACCOUNT_ID = process.env.META_AD_ACCOUNT_ID || '';

// Helper to call Meta API
async function metaAPI(endpoint, params = {}, method = 'GET') {
  const url = new URL(`${META_API}${endpoint}`);
  url.searchParams.set('access_token', ACCESS_TOKEN);
  Object.entries(params).forEach(([k, v]) => {
    if (method === 'GET') url.searchParams.set(k, v);
  });

  const options = { method };
  if (method === 'POST') {
    options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify({ ...params, access_token: ACCESS_TOKEN });
  }

  const res = await fetch(url.toString(), options);
  return res.json();
}

// ===== HEALTH =====
app.get('/', (req, res) => {
  res.json({
    name: 'Stud-Ex Meta Ads MCP Server',
    version: '1.0.0',
    connected: !!ACCESS_TOKEN,
    adAccountId: AD_ACCOUNT_ID || 'not set',
    tools: [
      'GET /config — set access token and ad account',
      'POST /config — update access token and ad account',
      'GET /campaigns — list all campaigns',
      'GET /campaigns/:id — get campaign details',
      'POST /campaigns/:id/status — pause/resume campaign',
      'GET /adsets — list all ad sets',
      'GET /adsets/:id — get ad set details',
      'POST /adsets/:id/budget — update ad set budget',
      'GET /ads — list all ads',
      'GET /ads/:id — get ad details',
      'GET /ads/:id/insights — get ad performance',
      'GET /insights — account-level insights',
      'GET /audiences — list custom audiences',
      'POST /campaigns — create new campaign',
    ],
  });
});

// ===== CONFIG =====
app.get('/config', (req, res) => {
  res.json({ hasToken: !!ACCESS_TOKEN, adAccountId: AD_ACCOUNT_ID });
});

app.post('/config', (req, res) => {
  if (req.body.accessToken) ACCESS_TOKEN = req.body.accessToken;
  if (req.body.adAccountId) AD_ACCOUNT_ID = req.body.adAccountId;
  res.json({ success: true, hasToken: !!ACCESS_TOKEN, adAccountId: AD_ACCOUNT_ID });
});

// ===== CAMPAIGNS =====
app.get('/campaigns', async (req, res) => {
  try {
    const data = await metaAPI(`/${AD_ACCOUNT_ID}/campaigns`, {
      fields: 'id,name,status,objective,daily_budget,lifetime_budget,start_time,stop_time,created_time,updated_time',
      limit: 50,
    });
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/campaigns/:id', async (req, res) => {
  try {
    const data = await metaAPI(`/${req.params.id}`, {
      fields: 'id,name,status,objective,daily_budget,lifetime_budget,start_time,stop_time,bid_strategy,buying_type,special_ad_categories',
    });
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/campaigns/:id/status', async (req, res) => {
  try {
    const { status } = req.body; // ACTIVE, PAUSED
    const data = await metaAPI(`/${req.params.id}`, { status }, 'POST');
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/campaigns', async (req, res) => {
  try {
    const { name, objective, status, daily_budget, special_ad_categories } = req.body;
    const data = await metaAPI(`/${AD_ACCOUNT_ID}/campaigns`, {
      name: name || 'New Campaign',
      objective: objective || 'OUTCOME_ENGAGEMENT',
      status: status || 'PAUSED',
      daily_budget: daily_budget || '5000', // in cents
      special_ad_categories: special_ad_categories || '[]',
    }, 'POST');
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===== AD SETS =====
app.get('/adsets', async (req, res) => {
  try {
    const data = await metaAPI(`/${AD_ACCOUNT_ID}/adsets`, {
      fields: 'id,name,status,daily_budget,lifetime_budget,targeting,optimization_goal,billing_event,bid_amount,start_time,end_time',
      limit: 50,
    });
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/adsets/:id', async (req, res) => {
  try {
    const data = await metaAPI(`/${req.params.id}`, {
      fields: 'id,name,status,daily_budget,lifetime_budget,targeting,optimization_goal,billing_event,bid_amount,start_time,end_time,campaign_id',
    });
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/adsets/:id/budget', async (req, res) => {
  try {
    const { daily_budget, lifetime_budget } = req.body;
    const params = {};
    if (daily_budget) params.daily_budget = daily_budget;
    if (lifetime_budget) params.lifetime_budget = lifetime_budget;
    const data = await metaAPI(`/${req.params.id}`, params, 'POST');
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===== ADS =====
app.get('/ads', async (req, res) => {
  try {
    const data = await metaAPI(`/${AD_ACCOUNT_ID}/ads`, {
      fields: 'id,name,status,creative,adset_id,campaign_id,created_time,updated_time',
      limit: 50,
    });
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/ads/:id', async (req, res) => {
  try {
    const data = await metaAPI(`/${req.params.id}`, {
      fields: 'id,name,status,creative,adset_id,campaign_id,tracking_specs,conversion_specs',
    });
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/ads/:id/insights', async (req, res) => {
  try {
    const { date_preset } = req.query;
    const data = await metaAPI(`/${req.params.id}/insights`, {
      fields: 'impressions,clicks,spend,cpc,cpm,ctr,reach,frequency,actions,cost_per_action_type,conversions,cost_per_conversion',
      date_preset: date_preset || 'last_7d',
    });
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===== ACCOUNT INSIGHTS =====
app.get('/insights', async (req, res) => {
  try {
    const { date_preset, time_increment } = req.query;
    const data = await metaAPI(`/${AD_ACCOUNT_ID}/insights`, {
      fields: 'impressions,clicks,spend,cpc,cpm,ctr,reach,frequency,actions,cost_per_action_type,conversions,cost_per_conversion,account_currency',
      date_preset: date_preset || 'last_30d',
      time_increment: time_increment || '1',
    });
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===== AUDIENCES =====
app.get('/audiences', async (req, res) => {
  try {
    const data = await metaAPI(`/${AD_ACCOUNT_ID}/customaudiences`, {
      fields: 'id,name,approximate_count,data_source,delivery_status,operation_status,subtype',
      limit: 50,
    });
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===== AD CREATIVES =====
app.get('/creatives', async (req, res) => {
  try {
    const data = await metaAPI(`/${AD_ACCOUNT_ID}/adcreatives`, {
      fields: 'id,name,title,body,image_url,thumbnail_url,object_story_spec,url_tags',
      limit: 50,
    });
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===== PAGES =====
app.get('/pages', async (req, res) => {
  try {
    const data = await metaAPI('/me/accounts', {
      fields: 'id,name,access_token,category,fan_count,followers_count',
    });
    res.json(data);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ===== AI ANALYSIS =====
app.get('/analyze', async (req, res) => {
  try {
    const [campaigns, insights, ads] = await Promise.all([
      metaAPI(`/${AD_ACCOUNT_ID}/campaigns`, { fields: 'id,name,status,objective,daily_budget', limit: 20 }),
      metaAPI(`/${AD_ACCOUNT_ID}/insights`, { fields: 'impressions,clicks,spend,cpc,cpm,ctr,reach,actions', date_preset: 'last_7d' }),
      metaAPI(`/${AD_ACCOUNT_ID}/ads`, { fields: 'id,name,status', limit: 20 }),
    ]);

    const activeCampaigns = (campaigns.data || []).filter(c => c.status === 'ACTIVE');
    const totalSpend = insights.data?.[0]?.spend || '0';
    const totalClicks = insights.data?.[0]?.clicks || '0';
    const ctr = insights.data?.[0]?.ctr || '0';
    const cpc = insights.data?.[0]?.cpc || '0';

    res.json({
      summary: {
        totalCampaigns: (campaigns.data || []).length,
        activeCampaigns: activeCampaigns.length,
        totalAds: (ads.data || []).length,
        last7Days: {
          spend: totalSpend,
          clicks: totalClicks,
          ctr: ctr,
          cpc: cpc,
          impressions: insights.data?.[0]?.impressions || '0',
          reach: insights.data?.[0]?.reach || '0',
        },
      },
      campaigns: campaigns.data || [],
      insights: insights.data || [],
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Meta Ads MCP Server running on port ${PORT}`);
  console.log(`Token configured: ${!!ACCESS_TOKEN}`);
  console.log(`Ad Account: ${AD_ACCOUNT_ID || 'not set'}`);
});
