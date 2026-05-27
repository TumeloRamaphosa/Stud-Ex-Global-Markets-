import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';

admin.initializeApp();

const app = express();
app.use(cors({ origin: true }));
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

// ==================== AGENT SANDBOXES ====================

interface FlyMachine {
  id: string;
  name: string;
  state: string;
  region: string;
  created_at: string;
}

const FLY_API_BASE = 'https://api.machines.dev/v1';
const FLY_APP_NAME = process.env.FLY_APP_NAME || 'studex-agent';
const FLY_API_TOKEN = process.env.FLY_API_TOKEN || '';
const FLY_AGENT_IMAGE = process.env.FLY_AGENT_IMAGE || 'registry.fly.io/studex-agent:latest';
const FLY_REGION = process.env.FLY_REGION || 'iad';

async function flyRequest(path: string, method: string, body?: Record<string, unknown>) {
  const url = `${FLY_API_BASE}/apps/${FLY_APP_NAME}${path}`;
  const headers: Record<string, string> = {
    'Authorization': `Bearer ${FLY_API_TOKEN}`,
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Fly API ${method} ${path} failed (${response.status}): ${text}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return null;
}

/**
 * Create a new agent sandbox for a client
 */
app.post('/agent/sandbox/create', async (req, res) => {
  try {
    const { userId, clientName } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    if (!FLY_API_TOKEN) {
      return res.status(503).json({ error: 'Agent sandbox service not configured (missing FLY_API_TOKEN)' });
    }

    const machineConfig = {
      name: `agent-${userId.substring(0, 8)}`,
      region: FLY_REGION,
      config: {
        image: FLY_AGENT_IMAGE,
        env: {
          CLIENT_ID: userId,
          CLIENT_NAME: clientName || 'Studex Client',
          PORT: '8080',
        },
        services: [
          {
            ports: [{ port: 443, handlers: ['tls', 'http'] }],
            protocol: 'tcp',
            internal_port: 8080,
          },
        ],
        guest: {
          cpu_kind: 'shared',
          cpus: 1,
          memory_mb: 256,
        },
        auto_destroy: true,
      },
    };

    const machine = await flyRequest('/machines', 'POST', machineConfig) as FlyMachine;

    // Store sandbox record in Firestore
    await admin.firestore().collection('agent_sandboxes').doc(machine.id).set({
      machineId: machine.id,
      userId,
      clientName: clientName || '',
      region: FLY_REGION,
      state: machine.state || 'created',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({
      machineId: machine.id,
      state: machine.state,
      message: 'Agent sandbox created',
    });
  } catch (error) {
    console.error('Error creating agent sandbox:', error);
    const message = error instanceof Error ? error.message : 'Failed to create agent sandbox';
    res.status(500).json({ error: message });
  }
});

/**
 * Get agent sandbox status
 */
app.get('/agent/sandbox/:machineId/status', async (req, res) => {
  try {
    const { machineId } = req.params;

    if (!FLY_API_TOKEN) {
      return res.status(503).json({ error: 'Agent sandbox service not configured' });
    }

    const machine = await flyRequest(`/machines/${machineId}`, 'GET') as FlyMachine;

    // Update Firestore record
    await admin.firestore().collection('agent_sandboxes').doc(machineId).update({
      state: machine.state,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({
      machineId: machine.id,
      state: machine.state,
      region: machine.region,
      createdAt: machine.created_at,
    });
  } catch (error) {
    console.error('Error getting sandbox status:', error);
    const message = error instanceof Error ? error.message : 'Failed to get sandbox status';
    res.status(500).json({ error: message });
  }
});

/**
 * Send a chat message to the agent sandbox
 */
app.post('/agent/sandbox/:machineId/chat', async (req, res) => {
  try {
    const { machineId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'message is required' });
    }

    if (!FLY_API_TOKEN) {
      return res.status(503).json({ error: 'Agent sandbox service not configured' });
    }

    // Get machine info to find its IP/hostname
    const machine = await flyRequest(`/machines/${machineId}`, 'GET') as FlyMachine;

    if (machine.state !== 'started') {
      // Start the machine if stopped
      await flyRequest(`/machines/${machineId}/start`, 'POST');
      // Wait briefly for startup
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Proxy request to the agent
    const agentUrl = `https://${machineId}.vm.${FLY_APP_NAME}.internal:8080/chat`;
    const agentResponse = await fetch(agentUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });

    if (!agentResponse.ok) {
      throw new Error(`Agent responded with ${agentResponse.status}`);
    }

    const data = await agentResponse.json();
    res.json(data);
  } catch (error) {
    console.error('Error chatting with agent:', error);
    const message = error instanceof Error ? error.message : 'Failed to chat with agent';
    res.status(500).json({ error: message });
  }
});

/**
 * Stop an agent sandbox
 */
app.post('/agent/sandbox/:machineId/stop', async (req, res) => {
  try {
    const { machineId } = req.params;

    if (!FLY_API_TOKEN) {
      return res.status(503).json({ error: 'Agent sandbox service not configured' });
    }

    await flyRequest(`/machines/${machineId}/stop`, 'POST');

    await admin.firestore().collection('agent_sandboxes').doc(machineId).update({
      state: 'stopped',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ message: 'Agent sandbox stopped' });
  } catch (error) {
    console.error('Error stopping sandbox:', error);
    const message = error instanceof Error ? error.message : 'Failed to stop sandbox';
    res.status(500).json({ error: message });
  }
});

/**
 * Destroy an agent sandbox
 */
app.delete('/agent/sandbox/:machineId', async (req, res) => {
  try {
    const { machineId } = req.params;

    if (!FLY_API_TOKEN) {
      return res.status(503).json({ error: 'Agent sandbox service not configured' });
    }

    await flyRequest(`/machines/${machineId}?force=true`, 'DELETE');

    await admin.firestore().collection('agent_sandboxes').doc(machineId).delete();

    res.json({ message: 'Agent sandbox destroyed' });
  } catch (error) {
    console.error('Error destroying sandbox:', error);
    const message = error instanceof Error ? error.message : 'Failed to destroy sandbox';
    res.status(500).json({ error: message });
  }
});

/**
 * List all sandboxes for a user
 */
app.get('/agent/sandboxes/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const snap = await admin.firestore()
      .collection('agent_sandboxes')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const sandboxes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ sandboxes });
  } catch (error) {
    console.error('Error listing sandboxes:', error);
    res.status(500).json({ error: 'Failed to list sandboxes' });
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
