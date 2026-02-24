/**
 * Studex Global Markets - API Layer
 *
 * For MVP: We use Firestore directly from the client (Firebase SDK handles auth).
 * Cloud Functions handle server-side triggers (user creation, scheduled jobs).
 * This file provides clean wrappers around Firestore operations.
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  onSnapshot,
  type DocumentData,
  type QueryConstraint,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from './firebase';

// ==================== TYPES ====================

export interface UserProfile {
  uid: string;
  email: string;
  display_name: string;
  photo_url: string;
  company: string;
  bio: string;
  interests: string[];
  expertise: string[];
  kyc_status: 'pending' | 'submitted' | 'verified' | 'rejected';
  verified_trader: boolean;
  role: 'user' | 'admin';
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface Deal {
  id?: string;
  title: string;
  description: string;
  value: number;
  currency: string;
  creator_id: string;
  participant_ids: string[];
  status: 'draft' | 'active' | 'negotiation' | 'closed' | 'cancelled';
  pipeline_stage: 'initial' | 'review' | 'negotiation' | 'due_diligence' | 'closing' | 'completed';
  collaborative_notes: string;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface Meeting {
  id?: string;
  title: string;
  description: string;
  scheduled_at: Timestamp;
  organizer_id: string;
  participant_ids: string[];
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  google_meet_link: string;
  transcript: string;
  analysis: Record<string, unknown> | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface Message {
  id?: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  text: string;
  read: boolean;
  created_at: Timestamp;
}

export interface Asset {
  id?: string;
  owner_id: string;
  title: string;
  description: string;
  category: string;
  value: number;
  currency: string;
  images: string[];
  visibility: 'public' | 'private';
  created_at: Timestamp;
  updated_at: Timestamp;
}

export interface Notification {
  id?: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  created_at: Timestamp;
}

// ==================== HELPERS ====================

function getCurrentUserId(): string {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  return user.uid;
}

function docToData<T>(d: DocumentData): T & { id: string } {
  return { id: d.id, ...d.data() } as T & { id: string };
}

// ==================== USERS API ====================

export const usersApi = {
  async getProfile(userId: string): Promise<UserProfile | null> {
    const snap = await getDoc(doc(db, 'users', userId));
    if (!snap.exists()) return null;
    return { uid: snap.id, ...snap.data() } as UserProfile;
  },

  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<void> {
    await updateDoc(doc(db, 'users', userId), {
      ...data,
      updated_at: serverTimestamp(),
    });
  },

  async searchUsers(searchQuery: string): Promise<UserProfile[]> {
    const q = query(
      collection(db, 'users'),
      where('display_name', '>=', searchQuery),
      where('display_name', '<=', searchQuery + '\uf8ff'),
      limit(20)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ uid: d.id, ...d.data() } as UserProfile));
  },
};

// ==================== DEALS API ====================

export const dealsApi = {
  async getDeals(): Promise<Deal[]> {
    const userId = getCurrentUserId();
    const q = query(
      collection(db, 'deals'),
      where('participant_ids', 'array-contains', userId),
      orderBy('created_at', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => docToData<Deal>(d));
  },

  async getMyDeals(): Promise<Deal[]> {
    const userId = getCurrentUserId();
    const q = query(
      collection(db, 'deals'),
      where('creator_id', '==', userId),
      orderBy('created_at', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => docToData<Deal>(d));
  },

  async getDealById(dealId: string): Promise<Deal | null> {
    const snap = await getDoc(doc(db, 'deals', dealId));
    if (!snap.exists()) return null;
    return docToData<Deal>(snap);
  },

  async createDeal(data: Omit<Deal, 'id' | 'created_at' | 'updated_at' | 'creator_id'>): Promise<string> {
    const userId = getCurrentUserId();
    const docRef = await addDoc(collection(db, 'deals'), {
      ...data,
      creator_id: userId,
      participant_ids: [userId, ...(data.participant_ids || [])],
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    return docRef.id;
  },

  async updateDeal(dealId: string, data: Partial<Deal>): Promise<void> {
    await updateDoc(doc(db, 'deals', dealId), {
      ...data,
      updated_at: serverTimestamp(),
    });
  },

  async deleteDeal(dealId: string): Promise<void> {
    await deleteDoc(doc(db, 'deals', dealId));
  },

  onDealsSnapshot(callback: (deals: Deal[]) => void): () => void {
    const userId = getCurrentUserId();
    const q = query(
      collection(db, 'deals'),
      where('participant_ids', 'array-contains', userId),
      orderBy('created_at', 'desc')
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map((d) => docToData<Deal>(d)));
    });
  },
};

// ==================== MEETINGS API ====================

export const meetingsApi = {
  async getMeetings(): Promise<Meeting[]> {
    const userId = getCurrentUserId();
    const q = query(
      collection(db, 'meetings'),
      where('participant_ids', 'array-contains', userId),
      orderBy('scheduled_at', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => docToData<Meeting>(d));
  },

  async createMeeting(data: Omit<Meeting, 'id' | 'created_at' | 'updated_at' | 'organizer_id'>): Promise<string> {
    const userId = getCurrentUserId();
    const docRef = await addDoc(collection(db, 'meetings'), {
      ...data,
      organizer_id: userId,
      participant_ids: [userId, ...(data.participant_ids || [])],
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    return docRef.id;
  },

  async updateMeeting(meetingId: string, data: Partial<Meeting>): Promise<void> {
    await updateDoc(doc(db, 'meetings', meetingId), {
      ...data,
      updated_at: serverTimestamp(),
    });
  },
};

// ==================== MESSAGES API ====================

export const messagesApi = {
  async getConversations(): Promise<DocumentData[]> {
    const userId = getCurrentUserId();
    const q = query(
      collection(db, 'conversations'),
      where('participant_ids', 'array-contains', userId),
      orderBy('last_message_at', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => docToData<DocumentData>(d));
  },

  async getMessages(conversationId: string): Promise<Message[]> {
    const q = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('created_at', 'asc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => docToData<Message>(d));
  },

  async sendMessage(conversationId: string, text: string): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error('Not authenticated');

    const docRef = await addDoc(
      collection(db, 'conversations', conversationId, 'messages'),
      {
        sender_id: user.uid,
        sender_name: user.displayName || user.email || 'Unknown',
        text,
        read: false,
        created_at: serverTimestamp(),
      }
    );

    await updateDoc(doc(db, 'conversations', conversationId), {
      last_message: text,
      last_message_at: serverTimestamp(),
    });

    return docRef.id;
  },

  onMessagesSnapshot(conversationId: string, callback: (messages: Message[]) => void): () => void {
    const q = query(
      collection(db, 'conversations', conversationId, 'messages'),
      orderBy('created_at', 'asc')
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map((d) => docToData<Message>(d)));
    });
  },
};

// ==================== ASSETS API ====================

export const assetsApi = {
  async getAssets(): Promise<Asset[]> {
    const userId = getCurrentUserId();
    const q = query(
      collection(db, 'assets'),
      where('owner_id', '==', userId),
      orderBy('created_at', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => docToData<Asset>(d));
  },

  async getPublicAssets(category?: string): Promise<Asset[]> {
    const constraints: QueryConstraint[] = [
      where('visibility', '==', 'public'),
      orderBy('created_at', 'desc'),
      limit(50),
    ];
    if (category) {
      constraints.unshift(where('category', '==', category));
    }
    const q = query(collection(db, 'assets'), ...constraints);
    const snap = await getDocs(q);
    return snap.docs.map((d) => docToData<Asset>(d));
  },

  async createAsset(data: Omit<Asset, 'id' | 'created_at' | 'updated_at' | 'owner_id'>): Promise<string> {
    const userId = getCurrentUserId();
    const docRef = await addDoc(collection(db, 'assets'), {
      ...data,
      owner_id: userId,
      created_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
    return docRef.id;
  },

  async updateAsset(assetId: string, data: Partial<Asset>): Promise<void> {
    await updateDoc(doc(db, 'assets', assetId), {
      ...data,
      updated_at: serverTimestamp(),
    });
  },

  async deleteAsset(assetId: string): Promise<void> {
    await deleteDoc(doc(db, 'assets', assetId));
  },
};

// ==================== NOTIFICATIONS API ====================

export const notificationsApi = {
  async getNotifications(): Promise<Notification[]> {
    const userId = getCurrentUserId();
    const q = query(
      collection(db, 'notifications', userId, 'items'),
      orderBy('created_at', 'desc'),
      limit(50)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => docToData<Notification>(d));
  },

  async markAsRead(notificationId: string): Promise<void> {
    const userId = getCurrentUserId();
    await updateDoc(doc(db, 'notifications', userId, 'items', notificationId), {
      read: true,
    });
  },

  onNotificationsSnapshot(callback: (notifications: Notification[]) => void): () => void {
    const userId = getCurrentUserId();
    const q = query(
      collection(db, 'notifications', userId, 'items'),
      where('read', '==', false),
      orderBy('created_at', 'desc'),
      limit(20)
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map((d) => docToData<Notification>(d)));
    });
  },
};

// ==================== FILES API ====================

export const filesApi = {
  async uploadFile(path: string, file: File): Promise<string> {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  },
};

// ==================== KYC API ====================

export const kycApi = {
  async submitDocument(documentType: string, file: File): Promise<string> {
    const userId = getCurrentUserId();
    const filePath = `kyc/${userId}/${Date.now()}_${file.name}`;
    const downloadUrl = await filesApi.uploadFile(filePath, file);

    const docRef = await addDoc(collection(db, 'kyc_documents'), {
      user_id: userId,
      document_type: documentType,
      document_url: downloadUrl,
      status: 'pending_review',
      created_at: serverTimestamp(),
    });

    return docRef.id;
  },

  async getStatus(): Promise<string> {
    const userId = getCurrentUserId();
    const userDoc = await getDoc(doc(db, 'users', userId));
    return userDoc.data()?.kyc_status || 'pending';
  },
};

// ==================== FORM RESPONSES API ====================

export const formResponsesApi = {
  async submitResponse(formData: Record<string, unknown>): Promise<string> {
    const userId = getCurrentUserId();
    const docRef = await addDoc(collection(db, 'form_responses'), {
      user_id: userId,
      form_data: formData,
      created_at: serverTimestamp(),
      processed: false,
    });
    return docRef.id;
  },
};

// ==================== EXPORT ALL ====================

export const api = {
  users: usersApi,
  deals: dealsApi,
  meetings: meetingsApi,
  messages: messagesApi,
  assets: assetsApi,
  notifications: notificationsApi,
  files: filesApi,
  kyc: kycApi,
  formResponses: formResponsesApi,
};
