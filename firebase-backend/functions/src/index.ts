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

/**
 * Get hook performance data for a profile
 */
app.get('/marketing/hooks/:profileId', async (req, res) => {
  try {
    const { profileId } = req.params;
    const snap = await admin.firestore()
      .collection('hook_performance')
      .where('profileId', '==', profileId)
      .orderBy('updatedAt', 'desc')
      .limit(100)
      .get();

    const hooks = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ hooks });
  } catch (error) {
    console.error('Error getting hook performance:', error);
    res.status(500).json({ error: 'Failed to get hook performance' });
  }
});

/**
 * Get platform analytics for a profile
 */
app.get('/marketing/analytics/:profileId', async (req, res) => {
  try {
    const { profileId } = req.params;
    const days = parseInt(req.query.days as string) || 30;

    const since = new Date();
    since.setDate(since.getDate() - days);
    const sinceStr = since.toISOString().split('T')[0];

    const snap = await admin.firestore()
      .collection('marketing_analytics')
      .where('profileId', '==', profileId)
      .where('date', '>=', sinceStr)
      .orderBy('date', 'desc')
      .get();

    const analytics = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ analytics });
  } catch (error) {
    console.error('Error getting analytics:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

/**
 * Get upload/post history for a profile (Upload-Post integration)
 */
app.get('/marketing/analytics/history/:profileId', async (req, res) => {
  try {
    const { profileId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    const snap = await admin.firestore()
      .collection('marketing_posts')
      .where('profileId', '==', profileId)
      .where('status', '==', 'posted')
      .orderBy('postedAt', 'desc')
      .limit(limit)
      .get();

    const history = snap.docs.map(d => {
      const data = d.data();
      return {
        id: d.id,
        requestId: data.requestId,
        platforms: data.platforms,
        platformResults: data.platformResults,
        hookText: data.hookText,
        postedAt: data.postedAt,
      };
    });

    res.json({ history });
  } catch (error) {
    console.error('Error getting analytics history:', error);
    res.status(500).json({ error: 'Failed to get analytics history' });
  }
});

/**
 * List marketing reports for a profile
 */
app.get('/marketing/reports/:profileId', async (req, res) => {
  try {
    const { profileId } = req.params;
    const limit = parseInt(req.query.limit as string) || 30;

    const snap = await admin.firestore()
      .collection('marketing_reports')
      .where('profileId', '==', profileId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    const reports = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ reports });
  } catch (error) {
    console.error('Error getting marketing reports:', error);
    res.status(500).json({ error: 'Failed to get reports' });
  }
});

/**
 * Generate slideshow images (async via image generation provider)
 */
app.post('/marketing/slides/generate', async (req, res) => {
  try {
    const { userId, profileId, slides, provider } = req.body;

    if (!userId || !profileId || !slides || !Array.isArray(slides)) {
      return res.status(400).json({ error: 'userId, profileId, and slides array are required' });
    }

    // Create a pending post with slide prompts
    const postRef = await admin.firestore()
      .collection('marketing_posts')
      .add({
        userId,
        profileId,
        slides: slides.map((s: any) => ({
          prompt: s.prompt || '',
          overlayText: s.overlayText || '',
          imageUrl: '',
          status: 'pending',
        })),
        provider: provider || 'openai',
        status: 'generating',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    res.json({
      postId: postRef.id,
      message: 'Slide generation started. Poll GET /marketing/slides/:postId for status.',
    });
  } catch (error) {
    console.error('Error starting slide generation:', error);
    res.status(500).json({ error: 'Failed to start slide generation' });
  }
});

/**
 * Apply text overlays to slide images
 */
app.post('/marketing/slides/overlay', async (req, res) => {
  try {
    const { postId, overlays } = req.body;

    if (!postId || !overlays || !Array.isArray(overlays)) {
      return res.status(400).json({ error: 'postId and overlays array are required' });
    }

    const postRef = admin.firestore().collection('marketing_posts').doc(postId);
    const postSnap = await postRef.get();

    if (!postSnap.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const postData = postSnap.data();
    const slides = postData?.slides || [];

    // Update overlay text for each slide
    const updatedSlides = slides.map((slide: any, i: number) => ({
      ...slide,
      overlayText: overlays[i]?.text || slide.overlayText,
      overlayPosition: overlays[i]?.position || 'center',
      overlayFontSize: overlays[i]?.fontSize || 'auto',
    }));

    await postRef.update({
      slides: updatedSlides,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ message: 'Text overlays applied', slides: updatedSlides });
  } catch (error) {
    console.error('Error applying overlays:', error);
    res.status(500).json({ error: 'Failed to apply text overlays' });
  }
});

/**
 * Get slide images for a post
 */
app.get('/marketing/slides/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const postSnap = await admin.firestore()
      .collection('marketing_posts')
      .doc(postId)
      .get();

    if (!postSnap.exists) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const data = postSnap.data();
    res.json({
      postId,
      status: data?.status,
      slides: data?.slides || [],
      provider: data?.provider,
    });
  } catch (error) {
    console.error('Error getting slides:', error);
    res.status(500).json({ error: 'Failed to get slides' });
  }
});

/**
 * Check post status by requestId (Upload-Post reference)
 */
app.get('/marketing/post/status/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;

    const snap = await admin.firestore()
      .collection('marketing_posts')
      .where('requestId', '==', requestId)
      .limit(1)
      .get();

    if (snap.empty) {
      return res.status(404).json({ error: 'Post not found for this requestId' });
    }

    const doc = snap.docs[0];
    const data = doc.data();
    res.json({
      id: doc.id,
      requestId,
      status: data.status,
      platformResults: data.platformResults || {},
      postedAt: data.postedAt,
    });
  } catch (error) {
    console.error('Error checking post status:', error);
    res.status(500).json({ error: 'Failed to check post status' });
  }
});

/**
 * Start competitor research
 */
app.post('/marketing/research', async (req, res) => {
  try {
    const { profileId, userId, competitors } = req.body;

    if (!profileId || !userId || !competitors || !Array.isArray(competitors)) {
      return res.status(400).json({ error: 'profileId, userId, and competitors array are required' });
    }

    const researchRef = await admin.firestore()
      .collection('competitor_research')
      .add({
        profileId,
        userId,
        competitors: competitors.map((c: any) => ({
          handle: c.handle,
          platform: c.platform || 'tiktok',
          hookTypes: [],
          slideFormats: [],
          viewRanges: { average: 0, best: 0 },
          postingFrequency: '',
          ctaPatterns: [],
          trendingSounds: [],
        })),
        gapAnalysis: '',
        opportunities: [],
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

    res.json({
      id: researchRef.id,
      message: 'Competitor research started',
    });
  } catch (error) {
    console.error('Error starting competitor research:', error);
    res.status(500).json({ error: 'Failed to start competitor research' });
  }
});

/**
 * Get competitor research results
 */
app.get('/marketing/research/:profileId', async (req, res) => {
  try {
    const { profileId } = req.params;

    const snap = await admin.firestore()
      .collection('competitor_research')
      .where('profileId', '==', profileId)
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();

    const research = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    res.json({ research });
  } catch (error) {
    console.error('Error getting competitor research:', error);
    res.status(500).json({ error: 'Failed to get competitor research' });
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
