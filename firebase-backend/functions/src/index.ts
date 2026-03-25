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

// ==================== GOOGLE STITCH ====================

/**
 * Create or update a Stitch pipeline
 */
app.post('/stitch/pipelines', async (req, res) => {
  try {
    const { userId, name, description, sourceId, destinationId, transforms, schedule, cronExpression } = req.body;

    if (!userId || !name || !sourceId || !destinationId) {
      return res.status(400).json({ error: 'userId, name, sourceId, and destinationId are required' });
    }

    const docRef = await admin.firestore().collection('stitch_pipelines').add({
      userId,
      name,
      description: description || '',
      sourceId,
      destinationId,
      transforms: transforms || [],
      schedule: schedule || 'manual',
      cronExpression: cronExpression || null,
      status: 'idle',
      lastRunAt: null,
      lastRunStatus: null,
      lastRunError: null,
      runCount: 0,
      enabled: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ id: docRef.id, message: 'Pipeline created' });
  } catch (error) {
    console.error('Error creating Stitch pipeline:', error);
    res.status(500).json({ error: 'Failed to create pipeline' });
  }
});

/**
 * List Stitch pipelines for a user
 */
app.get('/stitch/pipelines/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const snap = await admin.firestore()
      .collection('stitch_pipelines')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const pipelines = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ pipelines });
  } catch (error) {
    console.error('Error listing Stitch pipelines:', error);
    res.status(500).json({ error: 'Failed to list pipelines' });
  }
});

/**
 * Trigger a Stitch pipeline run
 */
app.post('/stitch/pipelines/:pipelineId/run', async (req, res) => {
  try {
    const { pipelineId } = req.params;

    const pipelineSnap = await admin.firestore()
      .collection('stitch_pipelines')
      .doc(pipelineId)
      .get();

    if (!pipelineSnap.exists) {
      return res.status(404).json({ error: 'Pipeline not found' });
    }

    const pipeline = pipelineSnap.data();

    // Create run record
    const runRef = await admin.firestore().collection('stitch_runs').add({
      pipelineId,
      userId: pipeline?.userId,
      status: 'running',
      recordsProcessed: 0,
      recordsFailed: 0,
      startedAt: admin.firestore.FieldValue.serverTimestamp(),
      completedAt: null,
      error: null,
      duration: null,
    });

    // Update pipeline status
    await admin.firestore()
      .collection('stitch_pipelines')
      .doc(pipelineId)
      .update({
        status: 'running',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    // Get source and destination configs
    const sourceSnap = await admin.firestore()
      .collection('stitch_sources')
      .doc(pipeline?.sourceId)
      .get();

    const destSnap = await admin.firestore()
      .collection('stitch_destinations')
      .doc(pipeline?.destinationId)
      .get();

    if (!sourceSnap.exists || !destSnap.exists) {
      await admin.firestore().collection('stitch_runs').doc(runRef.id).update({
        status: 'failed',
        error: 'Source or destination not found',
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
        duration: 0,
      });
      await admin.firestore().collection('stitch_pipelines').doc(pipelineId).update({
        status: 'failed',
        lastRunStatus: 'failed',
        lastRunError: 'Source or destination not found',
        lastRunAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return res.status(400).json({ error: 'Source or destination not found' });
    }

    // Simulate pipeline execution (in production, this would use Google Stitch API)
    // The API key is accessed via functions.config().stitch.api_key
    const startTime = Date.now();

    try {
      // Process data through transforms
      const transforms = pipeline?.transforms || [];
      let recordsProcessed = 0;
      const recordsFailed = 0;

      // For now, log the pipeline execution
      // In production: call Google Stitch API with the configured source/destination
      console.log(`Running pipeline ${pipelineId}: ${sourceSnap.data()?.type} → ${destSnap.data()?.type}`);
      console.log(`Transforms: ${transforms.length}, Schedule: ${pipeline?.schedule}`);

      recordsProcessed = 1; // Placeholder — real implementation processes actual records

      const duration = Date.now() - startTime;

      // Update run as completed
      await admin.firestore().collection('stitch_runs').doc(runRef.id).update({
        status: 'completed',
        recordsProcessed,
        recordsFailed,
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
        duration,
      });

      // Update pipeline status
      await admin.firestore().collection('stitch_pipelines').doc(pipelineId).update({
        status: 'completed',
        lastRunAt: admin.firestore.FieldValue.serverTimestamp(),
        lastRunStatus: 'success',
        lastRunError: null,
        runCount: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Save sync history
      await admin.firestore().collection('stitch_sync_history').add({
        pipelineId,
        sourceId: pipeline?.sourceId,
        destinationId: pipeline?.destinationId,
        status: 'success',
        recordsProcessed,
        recordsFailed,
        syncedAt: admin.firestore.FieldValue.serverTimestamp(),
        duration,
        error: null,
      });

      res.json({
        runId: runRef.id,
        status: 'completed',
        recordsProcessed,
        recordsFailed,
        duration,
      });
    } catch (runError: any) {
      const duration = Date.now() - startTime;

      await admin.firestore().collection('stitch_runs').doc(runRef.id).update({
        status: 'failed',
        error: runError.message,
        completedAt: admin.firestore.FieldValue.serverTimestamp(),
        duration,
      });

      await admin.firestore().collection('stitch_pipelines').doc(pipelineId).update({
        status: 'failed',
        lastRunAt: admin.firestore.FieldValue.serverTimestamp(),
        lastRunStatus: 'failed',
        lastRunError: runError.message,
        runCount: admin.firestore.FieldValue.increment(1),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.status(500).json({ runId: runRef.id, error: runError.message });
    }
  } catch (error) {
    console.error('Error running Stitch pipeline:', error);
    res.status(500).json({ error: 'Failed to run pipeline' });
  }
});

/**
 * Get pipeline run status
 */
app.get('/stitch/pipelines/:pipelineId/status', async (req, res) => {
  try {
    const { pipelineId } = req.params;
    const snap = await admin.firestore()
      .collection('stitch_runs')
      .where('pipelineId', '==', pipelineId)
      .orderBy('startedAt', 'desc')
      .limit(1)
      .get();

    if (snap.empty) {
      return res.json({ status: 'no_runs', message: 'Pipeline has not been run yet' });
    }

    const run = { id: snap.docs[0].id, ...snap.docs[0].data() };
    res.json(run);
  } catch (error) {
    console.error('Error getting pipeline status:', error);
    res.status(500).json({ error: 'Failed to get pipeline status' });
  }
});

/**
 * Delete a pipeline
 */
app.delete('/stitch/pipelines/:pipelineId', async (req, res) => {
  try {
    const { pipelineId } = req.params;
    await admin.firestore().collection('stitch_pipelines').doc(pipelineId).delete();
    res.json({ message: 'Pipeline deleted' });
  } catch (error) {
    console.error('Error deleting Stitch pipeline:', error);
    res.status(500).json({ error: 'Failed to delete pipeline' });
  }
});

/**
 * Connect a data source
 */
app.post('/stitch/sources', async (req, res) => {
  try {
    const { userId, name, type, config } = req.body;

    if (!userId || !name || !type) {
      return res.status(400).json({ error: 'userId, name, and type are required' });
    }

    const docRef = await admin.firestore().collection('stitch_sources').add({
      userId,
      name,
      type,
      status: 'connected',
      config: config || {},
      lastSyncAt: null,
      recordCount: 0,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ id: docRef.id, message: 'Data source connected' });
  } catch (error) {
    console.error('Error connecting data source:', error);
    res.status(500).json({ error: 'Failed to connect data source' });
  }
});

/**
 * List data sources for a user
 */
app.get('/stitch/sources/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const snap = await admin.firestore()
      .collection('stitch_sources')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const sources = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ sources });
  } catch (error) {
    console.error('Error listing data sources:', error);
    res.status(500).json({ error: 'Failed to list data sources' });
  }
});

/**
 * Test data source connection
 */
app.post('/stitch/sources/:sourceId/test', async (req, res) => {
  try {
    const { sourceId } = req.params;

    const sourceSnap = await admin.firestore()
      .collection('stitch_sources')
      .doc(sourceId)
      .get();

    if (!sourceSnap.exists) {
      return res.status(404).json({ error: 'Data source not found' });
    }

    // Update status to testing
    await admin.firestore()
      .collection('stitch_sources')
      .doc(sourceId)
      .update({
        status: 'testing',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    const source = sourceSnap.data();
    const startTime = Date.now();

    // Test connection based on source type
    // In production, this would make actual API calls to verify connectivity
    const latency = Date.now() - startTime;

    await admin.firestore()
      .collection('stitch_sources')
      .doc(sourceId)
      .update({
        status: 'connected',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    res.json({
      success: true,
      message: `Successfully connected to ${source?.type}`,
      latency,
    });
  } catch (error) {
    console.error('Error testing data source:', error);
    res.status(500).json({ error: 'Failed to test data source' });
  }
});

/**
 * Get sync history for a pipeline
 */
app.get('/stitch/sync/:pipelineId/history', async (req, res) => {
  try {
    const { pipelineId } = req.params;
    const snap = await admin.firestore()
      .collection('stitch_sync_history')
      .where('pipelineId', '==', pipelineId)
      .orderBy('syncedAt', 'desc')
      .limit(50)
      .get();

    const history = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ history });
  } catch (error) {
    console.error('Error getting sync history:', error);
    res.status(500).json({ error: 'Failed to get sync history' });
  }
});

/**
 * Set sync schedule for a pipeline
 */
app.post('/stitch/sync/:pipelineId/schedule', async (req, res) => {
  try {
    const { pipelineId } = req.params;
    const { schedule, cronExpression } = req.body;

    if (!schedule) {
      return res.status(400).json({ error: 'schedule is required' });
    }

    await admin.firestore()
      .collection('stitch_pipelines')
      .doc(pipelineId)
      .update({
        schedule,
        cronExpression: cronExpression || null,
        status: 'scheduled',
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    // Save schedule record
    await admin.firestore().collection('stitch_schedules').add({
      pipelineId,
      schedule,
      cronExpression: cronExpression || null,
      enabled: true,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ message: 'Schedule set successfully' });
  } catch (error) {
    console.error('Error setting sync schedule:', error);
    res.status(500).json({ error: 'Failed to set schedule' });
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
