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
