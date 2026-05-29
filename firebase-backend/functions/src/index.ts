import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';
import * as crypto from 'crypto';

admin.initializeApp();

const app = express();
app.use(cors({ origin: true }));

function getPublicAppUrl(): string {
  return (
    process.env.PUBLIC_APP_URL ||
    functions.config().app?.url ||
    'http://localhost:3000'
  );
}

async function verifyFirebaseUser(req: express.Request): Promise<admin.auth.DecodedIdToken> {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';

  if (!token) {
    throw new Error('Missing authorization token');
  }

  return admin.auth().verifyIdToken(token);
}

type StitchPaymentStatus = 'pending' | 'completed' | 'cancelled' | 'expired' | 'failed';

const STITCH_TOKEN_URL = 'https://secure.stitch.money/connect/token';
const STITCH_API_URL = 'https://api.stitch.money/v2';
const STITCH_PLANS: Record<string, { name: string; amount: number }> = {
  starter: { name: 'Market Starter', amount: 499 },
  growth: { name: 'Trade Growth', amount: 1499 },
};

let stitchTokenCache: { accessToken: string; expiresAt: number } | null = null;

function getStitchConfigValue(key: string): string {
  return (
    process.env[`STITCH_${key.toUpperCase()}`] ||
    functions.config().stitch?.[key] ||
    ''
  );
}

function parseBoolean(value: string, fallback: boolean): boolean {
  if (!value) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.toLowerCase());
}

function mapStitchStatus(value: string | undefined): StitchPaymentStatus {
  const normalized = (value || '').toLowerCase();

  if (normalized.includes('completed') || normalized === 'complete' || normalized === 'success') {
    return 'completed';
  }
  if (normalized.includes('cancelled') || normalized.includes('canceled') || normalized === 'closed') {
    return 'cancelled';
  }
  if (normalized.includes('expired')) {
    return 'expired';
  }
  if (normalized.includes('failed') || normalized.includes('failure')) {
    return 'failed';
  }
  return 'pending';
}

function buildStitchPaymentMethods() {
  const beneficiaryName = getStitchConfigValue('beneficiary_name');
  const beneficiaryBank = getStitchConfigValue('beneficiary_bank');
  const beneficiaryAccountNumber = getStitchConfigValue('beneficiary_account_number');
  const enableEft = Boolean(beneficiaryName && beneficiaryBank && beneficiaryAccountNumber);
  const enableCard = parseBoolean(getStitchConfigValue('enable_card'), true);

  return {
    eft: {
      enabled: enableEft,
      ...(enableEft
        ? {
            payerReference: getStitchConfigValue('payer_reference') || 'Studex',
            beneficiaryReference:
              getStitchConfigValue('beneficiary_reference') || 'Studex',
            beneficiary: {
              name: beneficiaryName,
              bank: beneficiaryBank,
              accountNumber: beneficiaryAccountNumber,
            },
            capitecPay: {
              enabled: parseBoolean(getStitchConfigValue('enable_capitec_pay'), false),
            },
            absaEft: {
              enabled: parseBoolean(getStitchConfigValue('enable_absa_pay'), false),
            },
          }
        : {}),
    },
    card: {
      enabled: enableCard,
    },
    crypto: {
      enabled: false,
    },
  };
}

async function getStitchAccessToken(): Promise<string> {
  if (stitchTokenCache && stitchTokenCache.expiresAt > Date.now() + 60_000) {
    return stitchTokenCache.accessToken;
  }

  const clientId = getStitchConfigValue('client_id');
  const clientSecret = getStitchConfigValue('client_secret');

  if (!clientId || !clientSecret) {
    throw new Error('Stitch client credentials are not configured');
  }

  const body = new URLSearchParams({
    grant_type: 'client_credentials',
    client_id: clientId,
    client_secret: clientSecret,
    audience: STITCH_TOKEN_URL,
    scope: 'client_paymentrequest',
  });

  const response = await fetch(STITCH_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  const data = await response.json() as {
    access_token?: string;
    expires_in?: number;
    error?: string;
    error_description?: string;
  };

  if (!response.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || 'Unable to get Stitch token');
  }

  stitchTokenCache = {
    accessToken: data.access_token,
    expiresAt: Date.now() + (data.expires_in || 3600) * 1000,
  };

  return data.access_token;
}

function appendRedirectUri(url: string): string {
  const redirectUri =
    getStitchConfigValue('redirect_uri') ||
    `${getPublicAppUrl()}/settings/billing`;
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}redirect_uri=${encodeURIComponent(redirectUri)}`;
}

function verifyStitchWebhook(rawBody: Buffer, signatureHeader: string | undefined): boolean {
  const webhookSecret = getStitchConfigValue('webhook_secret');

  if (!webhookSecret) {
    console.warn('STITCH_WEBHOOK_SECRET is not configured; skipping webhook signature verification');
    return true;
  }

  if (!signatureHeader) return false;

  const signature = signatureHeader.split(',').reduce<Record<string, string>>((acc, pair) => {
    const [key, value] = pair.split('=');
    if (key && value) acc[key.trim()] = value.trim();
    return acc;
  }, {});

  if (!signature.t || !signature.hmac_sha256) return false;

  const hash = crypto
    .createHmac('sha256', webhookSecret)
    .update(signature.t)
    .update('.')
    .update(rawBody)
    .digest('hex');

  const expected = Buffer.from(hash, 'hex');
  const received = Buffer.from(signature.hmac_sha256, 'hex');

  return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}

async function syncStitchPaymentStatus(payload: any): Promise<{
  status: StitchPaymentStatus;
  externalReference?: string;
}> {
  const node = payload?.data?.client?.paymentInitiationRequests?.node || payload?.data || payload;
  const externalReference = node?.externalReference;
  const stitchPaymentRequestId = node?.id;
  const stateName = node?.state?.__typename || node?.status || payload?.type;
  const status = mapStitchStatus(stateName);
  const amountQuantity = Number(node?.amount?.quantity || node?.quantity || 0);
  const existing = externalReference
    ? await admin.firestore().collection('payment_requests').doc(externalReference).get()
    : null;
  const existingData = existing?.data() || {};
  const userId = existingData.userId || node?.metadata?.userId;
  const planId = existingData.planId || node?.metadata?.planId;

  if (externalReference) {
    await admin.firestore().collection('payment_requests').doc(externalReference).set(
      {
        provider: 'stitch',
        stitchPaymentRequestId,
        externalReference,
        userId: userId || null,
        planId: planId || null,
        status,
        amount: {
          currency: node?.amount?.currency || node?.currency || 'ZAR',
          quantity: amountQuantity,
        },
        lastWebhookPayload: payload,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }

  if (userId) {
    await admin.firestore().collection('subscriptions').doc(userId).set(
      {
        userId,
        provider: 'stitch',
        status,
        planId: planId || null,
        stitchPaymentRequestId,
        externalReference: externalReference || null,
        amount: {
          currency: node?.amount?.currency || node?.currency || 'ZAR',
          quantity: amountQuantity,
        },
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  }

  return { status, externalReference };
}

async function getPaymentRequestDoc(
  externalReference?: string,
  stitchPaymentRequestId?: string
): Promise<admin.firestore.DocumentSnapshot | null> {
  if (externalReference) {
    const doc = await admin
      .firestore()
      .collection('payment_requests')
      .doc(externalReference)
      .get();
    if (doc.exists) return doc;
  }

  if (!stitchPaymentRequestId) return null;

  const snap = await admin
    .firestore()
    .collection('payment_requests')
    .where('stitchPaymentRequestId', '==', stitchPaymentRequestId)
    .limit(1)
    .get();

  return snap.empty ? null : snap.docs[0];
}

async function retrieveStitchPaymentRequest(stitchPaymentRequestId: string): Promise<any> {
  const token = await getStitchAccessToken();
  const response = await fetch(
    `${STITCH_API_URL}/payment-requests/${encodeURIComponent(stitchPaymentRequestId)}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const data = await response.json() as any;

  if (!response.ok) {
    throw new Error(data.detail || data.title || 'Unable to retrieve Stitch payment request');
  }

  return data;
}

async function readPaymentStatus(userId: string) {
  const statusDoc = await admin.firestore().collection('subscriptions').doc(userId).get();

  if (!statusDoc.exists) {
    return { status: 'none' };
  }

  const data = statusDoc.data() || {};
  return {
    status: data.status || 'none',
    planId: data.planId,
    stitchPaymentRequestId: data.stitchPaymentRequestId,
    externalReference: data.externalReference,
    amount: data.amount,
    updatedAt: data.updatedAt?.toDate?.().toISOString?.(),
  };
}

app.post(
  '/payments/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const rawBody = Buffer.isBuffer(req.body) ? req.body : Buffer.from(req.body || '');
    const signature = req.headers['x-stitch-signature'];

    if (!verifyStitchWebhook(rawBody, Array.isArray(signature) ? signature[0] : signature)) {
      return res.status(400).json({ error: 'Invalid Stitch webhook signature' });
    }

    try {
      const payload = JSON.parse(rawBody.toString('utf8'));
      const result = await syncStitchPaymentStatus(payload);
      res.json({ received: true, ...result });
    } catch (error) {
      console.error('Stitch webhook failed:', error);
      res.status(400).json({ error: 'Invalid Stitch webhook' });
    }
  }
);

app.use(express.json());

// ==================== USER MANAGEMENT ====================

/**
 * Create user profile on signup
 */
export const onUserCreate = functions.auth.user().onCreate(async (user) => {
  const uid = user.uid;
  const email = user.email || '';

  try {
    await admin.firestore().collection('users').doc(uid).set({
      uid,
      email,
      display_name: user.displayName || '',
      photo_url: user.photoURL || '',
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
      kyc_status: 'pending',
      verified_trader: false,
      role: 'user',
      company: '',
      bio: '',
      interests: [],
      expertise: [],
    });

    // Set custom claims
    await admin.auth().setCustomUserClaims(uid, {
      role: 'user',
      verified_trader: false,
    });

    console.log(`User profile created for ${uid}`);
  } catch (error) {
    console.error(`Error creating user profile for ${uid}:`, error);
    throw error;
  }
});

/**
 * Clean up user data on deletion
 */
export const onUserDelete = functions.auth.user().onDelete(async (user) => {
  const uid = user.uid;

  try {
    // Delete user profile
    await admin.firestore().collection('users').doc(uid).delete();

    // Delete user's assets
    const assets = await admin.firestore()
      .collection('assets')
      .where('owner_id', '==', uid)
      .get();

    for (const doc of assets.docs) {
      await doc.ref.delete();
    }

    // Delete user's deals
    const deals = await admin.firestore()
      .collection('deals')
      .where('creator_id', '==', uid)
      .get();

    for (const doc of deals.docs) {
      await doc.ref.delete();
    }

    console.log(`User data deleted for ${uid}`);
  } catch (error) {
    console.error(`Error deleting user data for ${uid}:`, error);
  }
});

// ==================== PAYMENTS ====================

/**
 * Create a Stitch hosted payment request for a plan.
 */
app.post('/payments/stitch/payment-request', async (req, res) => {
  try {
    const decoded = await verifyFirebaseUser(req);
    const { planId, amount, currency } = req.body;
    const plan = STITCH_PLANS[planId];

    if (!plan) {
      return res.status(400).json({ error: 'Unsupported payment plan' });
    }

    if (currency !== 'ZAR' || Number(amount) !== plan.amount) {
      return res.status(400).json({ error: 'Invalid payment amount' });
    }

    const token = await getStitchAccessToken();
    const externalReference = `studex-${planId}-${Date.now()}-${decoded.uid.slice(0, 8)}`;
    const expireAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    const paymentMethods = buildStitchPaymentMethods();

    if (!paymentMethods.card.enabled && !paymentMethods.eft.enabled) {
      return res.status(501).json({ error: 'No Stitch payment methods are configured' });
    }

    const requestBody = {
      amount: {
        currency: 'ZAR',
        quantity: plan.amount,
      },
      externalReference,
      expireAt,
      payer: {
        identifier: decoded.uid,
        email: decoded.email || undefined,
        fullName: decoded.name || undefined,
      },
      metadata: {
        userId: decoded.uid,
        planId,
      },
      paymentMethods,
    };

    const response = await fetch(`${STITCH_API_URL}/payment-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });
    const data = await response.json() as {
      id?: string;
      status?: string;
      interaction?: { url?: string };
      detail?: string;
      title?: string;
    };

    if (!response.ok || !data.id || !data.interaction?.url) {
      return res.status(response.status).json({
        error: data.detail || data.title || 'Unable to create Stitch payment request',
      });
    }

    const checkoutUrl = appendRedirectUri(data.interaction.url);
    const paymentRecord = {
      provider: 'stitch',
      userId: decoded.uid,
      planId,
      planName: plan.name,
      amount: { currency: 'ZAR', quantity: plan.amount },
      status: mapStitchStatus(data.status),
      externalReference,
      stitchPaymentRequestId: data.id,
      checkoutUrl,
      expiresAt: admin.firestore.Timestamp.fromDate(new Date(expireAt)),
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await admin.firestore().collection('payment_requests').doc(externalReference).set(paymentRecord);
    await admin.firestore().collection('subscriptions').doc(decoded.uid).set(
      {
        userId: decoded.uid,
        provider: 'stitch',
        status: paymentRecord.status,
        planId,
        stitchPaymentRequestId: data.id,
        externalReference,
        amount: paymentRecord.amount,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    res.json({
      id: data.id,
      externalReference,
      url: checkoutUrl,
    });
  } catch (error) {
    console.error('Error creating Stitch payment request:', error);
    res.status(401).json({ error: 'Unable to create Stitch payment request' });
  }
});

/**
 * Sync a Stitch redirect callback after the user returns from hosted checkout.
 */
app.post('/payments/stitch/callback', async (req, res) => {
  try {
    const decoded = await verifyFirebaseUser(req);
    const { id, externalReference, status } = req.body as {
      id?: string;
      externalReference?: string;
      status?: string;
    };

    if (!id && !externalReference) {
      return res.status(400).json({ error: 'Missing Stitch callback identifiers' });
    }

    const paymentDoc = await getPaymentRequestDoc(externalReference, id);
    if (!paymentDoc?.exists) {
      return res.status(404).json({ error: 'Payment request not found' });
    }

    const paymentData = paymentDoc.data() || {};
    if (paymentData.userId !== decoded.uid) {
      return res.status(403).json({ error: 'Cannot sync another user payment' });
    }

    let verifiedPayload: any = null;
    try {
      verifiedPayload = await retrieveStitchPaymentRequest(
        paymentData.stitchPaymentRequestId || id
      );
    } catch (error) {
      console.warn('Unable to verify Stitch callback via status API:', error);
    }

    const payload = verifiedPayload || {
      id: paymentData.stitchPaymentRequestId || id,
      externalReference: paymentDoc.id,
      status: status === 'complete' ? 'pending' : status,
      amount: paymentData.amount,
      metadata: {
        userId: decoded.uid,
        planId: paymentData.planId,
      },
    };
    const result = await syncStitchPaymentStatus(payload);
    res.json({ ...(await readPaymentStatus(decoded.uid)), status: result.status });
  } catch (error) {
    console.error('Error syncing Stitch callback:', error);
    res.status(401).json({ error: 'Unable to sync Stitch callback' });
  }
});

/**
 * Read the latest Stitch payment status synced by redirect/webhook.
 */
app.get('/payments/status/:userId', async (req, res) => {
  try {
    const decoded = await verifyFirebaseUser(req);
    const { userId } = req.params;

    if (decoded.uid !== userId) {
      return res.status(403).json({ error: 'Cannot read another user payment status' });
    }

    res.json(await readPaymentStatus(userId));
  } catch (error) {
    console.error('Error reading Stitch payment status:', error);
    res.status(401).json({ error: 'Unable to read payment status' });
  }
});

/**
 * Backwards-compatible status endpoint for clients using the old route name.
 */
app.get('/payments/subscription/:userId', async (req, res) => {
  try {
    const decoded = await verifyFirebaseUser(req);
    const { userId } = req.params;

    if (decoded.uid !== userId) {
      return res.status(403).json({ error: 'Cannot read another user payment status' });
    }

    res.json(await readPaymentStatus(userId));
  } catch (error) {
    console.error('Error reading payment status:', error);
    res.status(401).json({ error: 'Unable to read payment status' });
  }
});

// ==================== MEETINGS ====================

/**
 * Create meeting and notify participants
 */
app.post('/meetings/schedule', async (req, res) => {
  try {
    const { title, description, scheduled_at, participant_ids, organizer_id } = req.body;

    if (!title || !scheduled_at || !organizer_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const meetingRef = await admin.firestore().collection('meetings').add({
      title,
      description: description || '',
      scheduled_at: new Date(scheduled_at),
      organizer_id,
      participant_ids: participant_ids || [],
      status: 'scheduled',
      google_meet_link: '',
      transcript: '',
      analysis: null,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Notify participants
    if (participant_ids && Array.isArray(participant_ids)) {
      for (const participant_id of participant_ids) {
        if (participant_id !== organizer_id) {
          await admin.firestore()
            .collection('notifications')
            .doc(participant_id)
            .collection('items')
            .add({
              type: 'meeting_invitation',
              title: `You've been invited to "${title}"`,
              message: `${organizer_id} invited you to a meeting`,
              meeting_id: meetingRef.id,
              read: false,
              created_at: admin.firestore.FieldValue.serverTimestamp(),
            });
        }
      }
    }

    res.json({ id: meetingRef.id, message: 'Meeting scheduled successfully' });
  } catch (error) {
    console.error('Error scheduling meeting:', error);
    res.status(500).json({ error: 'Failed to schedule meeting' });
  }
});

/**
 * Update meeting status
 */
app.post('/meetings/:id/update-status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    await admin.firestore()
      .collection('meetings')
      .doc(id)
      .update({
        status,
        updated_at: admin.firestore.FieldValue.serverTimestamp(),
      });

    res.json({ message: 'Meeting status updated successfully' });
  } catch (error) {
    console.error('Error updating meeting:', error);
    res.status(500).json({ error: 'Failed to update meeting' });
  }
});

// ==================== DEALS ====================

/**
 * Create new deal
 */
app.post('/deals/create', async (req, res) => {
  try {
    const { title, description, value, currency, creator_id, participant_ids } = req.body;

    if (!title || !creator_id) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const dealRef = await admin.firestore().collection('deals').add({
      title,
      description: description || '',
      value: value || 0,
      currency: currency || 'USD',
      creator_id,
      participant_ids: participant_ids || [],
      status: 'draft',
      pipeline_stage: 'initial',
      collaborative_notes: '',
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ id: dealRef.id, message: 'Deal created successfully' });
  } catch (error) {
    console.error('Error creating deal:', error);
    res.status(500).json({ error: 'Failed to create deal' });
  }
});

/**
 * Update deal status
 */
app.post('/deals/:id/update-status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, pipeline_stage } = req.body;

    const updateData: any = {
      updated_at: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (status) updateData.status = status;
    if (pipeline_stage) updateData.pipeline_stage = pipeline_stage;

    await admin.firestore()
      .collection('deals')
      .doc(id)
      .update(updateData);

    res.json({ message: 'Deal updated successfully' });
  } catch (error) {
    console.error('Error updating deal:', error);
    res.status(500).json({ error: 'Failed to update deal' });
  }
});

// ==================== FORM RESPONSES ====================

/**
 * Store Google Forms responses
 */
app.post('/forms/submit', async (req, res) => {
  try {
    const { user_id, form_data } = req.body;

    if (!user_id || !form_data) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const responseRef = await admin.firestore()
      .collection('form_responses')
      .add({
        user_id,
        form_data,
        created_at: admin.firestore.FieldValue.serverTimestamp(),
        processed: false,
      });

    res.json({ id: responseRef.id, message: 'Form response saved successfully' });
  } catch (error) {
    console.error('Error saving form response:', error);
    res.status(500).json({ error: 'Failed to save form response' });
  }
});

// ==================== KYC ====================

/**
 * Submit KYC document
 */
app.post('/kyc/submit', async (req, res) => {
  try {
    const { user_id, document_type, document_url } = req.body;

    if (!user_id || !document_type || !document_url) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const kycRef = await admin.firestore()
      .collection('kyc_documents')
      .add({
        user_id,
        document_type,
        document_url,
        status: 'pending_review',
        created_at: admin.firestore.FieldValue.serverTimestamp(),
      });

    res.json({ id: kycRef.id, message: 'KYC document submitted' });
  } catch (error) {
    console.error('Error submitting KYC:', error);
    res.status(500).json({ error: 'Failed to submit KYC' });
  }
});

/**
 * Admin: Verify KYC
 */
app.post('/kyc/:id/verify', async (req, res) => {
  try {
    const { id } = req.params;

    const kycDoc = await admin.firestore()
      .collection('kyc_documents')
      .doc(id)
      .get();

    if (!kycDoc.exists) {
      return res.status(404).json({ error: 'KYC document not found' });
    }

    const userData = kycDoc.data();
    const user_id = userData?.user_id;

    // Update KYC status
    await admin.firestore()
      .collection('kyc_documents')
      .doc(id)
      .update({
        status: 'verified',
        verified_at: admin.firestore.FieldValue.serverTimestamp(),
      });

    // Update user KYC status
    await admin.firestore()
      .collection('users')
      .doc(user_id)
      .update({
        kyc_status: 'verified',
        verified_trader: true,
      });

    // Set custom claim
    await admin.auth().setCustomUserClaims(user_id, {
      role: 'user',
      verified_trader: true,
    });

    res.json({ message: 'KYC verified successfully' });
  } catch (error) {
    console.error('Error verifying KYC:', error);
    res.status(500).json({ error: 'Failed to verify KYC' });
  }
});

// ==================== MARKETING ====================

/**
 * Create or update marketing profile
 */
app.post('/marketing/profile', async (req, res) => {
  try {
    const { userId, ...profileData } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Check if profile exists
    const existing = await admin.firestore()
      .collection('marketing_profiles')
      .where('userId', '==', userId)
      .limit(1)
      .get();

    if (!existing.empty) {
      // Update existing
      const docId = existing.docs[0].id;
      await admin.firestore()
        .collection('marketing_profiles')
        .doc(docId)
        .update({
          ...profileData,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      res.json({ id: docId, message: 'Profile updated' });
    } else {
      // Create new
      const docRef = await admin.firestore()
        .collection('marketing_profiles')
        .add({
          ...profileData,
          userId,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      res.json({ id: docRef.id, message: 'Profile created' });
    }
  } catch (error) {
    console.error('Error with marketing profile:', error);
    res.status(500).json({ error: 'Failed to save marketing profile' });
  }
});

/**
 * Get marketing profile
 */
app.get('/marketing/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const snap = await admin.firestore()
      .collection('marketing_profiles')
      .where('userId', '==', userId)
      .limit(1)
      .get();

    if (snap.empty) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({ id: snap.docs[0].id, ...snap.docs[0].data() });
  } catch (error) {
    console.error('Error getting marketing profile:', error);
    res.status(500).json({ error: 'Failed to get marketing profile' });
  }
});

/**
 * Create marketing post
 */
app.post('/marketing/posts', async (req, res) => {
  try {
    const { userId, profileId, ...postData } = req.body;

    if (!userId || !profileId) {
      return res.status(400).json({ error: 'userId and profileId are required' });
    }

    const docRef = await admin.firestore()
      .collection('marketing_posts')
      .add({
        ...postData,
        userId,
        profileId,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    res.json({ id: docRef.id, message: 'Post created' });
  } catch (error) {
    console.error('Error creating marketing post:', error);
    res.status(500).json({ error: 'Failed to create marketing post' });
  }
});

/**
 * Get marketing posts for a profile
 */
app.get('/marketing/posts/:profileId', async (req, res) => {
  try {
    const { profileId } = req.params;
    const snap = await admin.firestore()
      .collection('marketing_posts')
      .where('profileId', '==', profileId)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const posts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ posts });
  } catch (error) {
    console.error('Error getting marketing posts:', error);
    res.status(500).json({ error: 'Failed to get marketing posts' });
  }
});

/**
 * Update marketing post status
 */
app.post('/marketing/posts/:postId/status', async (req, res) => {
  try {
    const { postId } = req.params;
    const { status, platformResults, requestId } = req.body;

    const updateData: any = {
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (status) updateData.status = status;
    if (platformResults) updateData.platformResults = platformResults;
    if (requestId) updateData.requestId = requestId;
    if (status === 'posted') updateData.postedAt = admin.firestore.FieldValue.serverTimestamp();

    await admin.firestore()
      .collection('marketing_posts')
      .doc(postId)
      .update(updateData);

    res.json({ message: 'Post updated' });
  } catch (error) {
    console.error('Error updating marketing post:', error);
    res.status(500).json({ error: 'Failed to update marketing post' });
  }
});

/**
 * Save analytics snapshot
 */
app.post('/marketing/analytics', async (req, res) => {
  try {
    const { profileId, date, platforms } = req.body;

    if (!profileId || !date) {
      return res.status(400).json({ error: 'profileId and date are required' });
    }

    const docRef = await admin.firestore()
      .collection('marketing_analytics')
      .add({
        profileId,
        date,
        platforms: platforms || {},
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    res.json({ id: docRef.id, message: 'Analytics saved' });
  } catch (error) {
    console.error('Error saving marketing analytics:', error);
    res.status(500).json({ error: 'Failed to save analytics' });
  }
});

/**
 * Generate daily marketing report
 */
app.post('/marketing/reports/generate', async (req, res) => {
  try {
    const { profileId } = req.body;

    if (!profileId) {
      return res.status(400).json({ error: 'profileId is required' });
    }

    const today = new Date();
    const threeDaysAgo = new Date(today);
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

    const dateStr = today.toISOString().split('T')[0];
    const startStr = threeDaysAgo.toISOString().split('T')[0];

    // Get recent posts
    const postsSnap = await admin.firestore()
      .collection('marketing_posts')
      .where('profileId', '==', profileId)
      .where('status', '==', 'posted')
      .orderBy('createdAt', 'desc')
      .limit(20)
      .get();

    const posts = postsSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Get hook performance
    const hooksSnap = await admin.firestore()
      .collection('hook_performance')
      .where('profileId', '==', profileId)
      .orderBy('updatedAt', 'desc')
      .limit(50)
      .get();

    const hooks = hooksSnap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Build report
    const diagnosticBreakdown = { scale: 0, fixCta: 0, fixHooks: 0, fullReset: 0 };
    const recommendations: string[] = [];

    if (posts.length === 0) {
      recommendations.push('Start posting content to generate analytics data.');
    } else {
      recommendations.push(`${posts.length} posts published in the last 3 days.`);
    }

    if (hooks.length > 0) {
      const winning = hooks.filter((h: any) => h.status === 'doubleDown');
      const dropped = hooks.filter((h: any) => h.status === 'dropped');

      if (winning.length > 0) {
        recommendations.push(`${winning.length} winning hooks identified — create variations.`);
        diagnosticBreakdown.scale = winning.length;
      }
      if (dropped.length > 0) {
        recommendations.push(`${dropped.length} underperforming hooks dropped.`);
        diagnosticBreakdown.fullReset = dropped.length;
      }
    }

    recommendations.push('Maintain 3x daily posting schedule for algorithmic consistency.');
    recommendations.push('Add trending TikTok audio to published slideshows.');

    const report = {
      profileId,
      date: dateStr,
      period: { start: startStr, end: dateStr },
      summary: `Daily marketing report for ${dateStr}. ${posts.length} posts analyzed across the 3-day rolling window.`,
      topHooks: hooks.slice(0, 5),
      ctaPerformance: [],
      diagnosticBreakdown,
      recommendations,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    const docRef = await admin.firestore()
      .collection('marketing_reports')
      .add(report);

    res.json({ id: docRef.id, report });
  } catch (error) {
    console.error('Error generating marketing report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

/**
 * Track hook performance
 */
app.post('/marketing/hooks/track', async (req, res) => {
  try {
    const hookData = req.body;

    if (!hookData.profileId || !hookData.hookText) {
      return res.status(400).json({ error: 'profileId and hookText are required' });
    }

    const docRef = await admin.firestore()
      .collection('hook_performance')
      .add({
        ...hookData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    res.json({ id: docRef.id, message: 'Hook tracked' });
  } catch (error) {
    console.error('Error tracking hook:', error);
    res.status(500).json({ error: 'Failed to track hook' });
  }
});

// ==================== NOTIFICATIONS ====================

/**
 * Mark notification as read
 */
app.post('/notifications/:userId/:notificationId/read', async (req, res) => {
  try {
    const { userId, notificationId } = req.params;

    await admin.firestore()
      .collection('notifications')
      .doc(userId)
      .collection('items')
      .doc(notificationId)
      .update({
        read: true,
        read_at: admin.firestore.FieldValue.serverTimestamp(),
      });

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error updating notification:', error);
    res.status(500).json({ error: 'Failed to update notification' });
  }
});

// ==================== EXPORTS ====================

export const api = functions.https.onRequest(app);

/**
 * Scheduled function: Cleanup old meetings (runs daily)
 */
export const cleanupOldMeetings = functions.pubsub
  .schedule('every day 00:00')
  .timeZone('UTC')
  .onRun(async () => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const oldMeetings = await admin.firestore()
        .collection('meetings')
        .where('scheduled_at', '<', thirtyDaysAgo)
        .where('status', '==', 'completed')
        .get();

      let count = 0;
      for (const doc of oldMeetings.docs) {
        await doc.ref.delete();
        count++;
      }

      console.log(`Cleaned up ${count} old meetings`);
    } catch (error) {
      console.error('Error cleaning up old meetings:', error);
    }
  });
