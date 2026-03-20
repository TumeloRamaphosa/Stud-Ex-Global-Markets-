/**
 * Studex Marketing Skill App - API Layer
 *
 * Handles all marketing-related Firestore operations and
 * external API integrations (Upload-Post, image generation).
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
  onSnapshot,
  type DocumentData,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from './firebase';
import type {
  MarketingProfile,
  MarketingPost,
  MarketingAnalytics,
  MarketingReport,
  HookPerformance,
  CompetitorResearch,
  SlideData,
  Platform,
  DiagnosticType,
} from './marketing-types';

// ==================== HELPERS ====================

function getCurrentUserId(): string {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  return user.uid;
}

function docToData<T>(d: DocumentData): T & { id: string } {
  return { id: d.id, ...d.data() } as T & { id: string };
}

// ==================== MARKETING PROFILE ====================

export const marketingProfileApi = {
  async getProfile(): Promise<MarketingProfile | null> {
    const userId = getCurrentUserId();
    const q = query(
      collection(db, 'marketing_profiles'),
      where('userId', '==', userId),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return docToData<MarketingProfile>(snap.docs[0]);
  },

  async createProfile(data: Omit<MarketingProfile, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const userId = getCurrentUserId();
    const docRef = await addDoc(collection(db, 'marketing_profiles'), {
      ...data,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async updateProfile(profileId: string, data: Partial<MarketingProfile>): Promise<void> {
    await updateDoc(doc(db, 'marketing_profiles', profileId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },
};

// ==================== MARKETING POSTS ====================

export const marketingPostsApi = {
  async getPosts(profileId: string): Promise<MarketingPost[]> {
    const q = query(
      collection(db, 'marketing_posts'),
      where('profileId', '==', profileId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => docToData<MarketingPost>(d));
  },

  async getPost(postId: string): Promise<MarketingPost | null> {
    const snap = await getDoc(doc(db, 'marketing_posts', postId));
    if (!snap.exists()) return null;
    return docToData<MarketingPost>(snap);
  },

  async createPost(data: Omit<MarketingPost, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const userId = getCurrentUserId();
    const docRef = await addDoc(collection(db, 'marketing_posts'), {
      ...data,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async updatePost(postId: string, data: Partial<MarketingPost>): Promise<void> {
    await updateDoc(doc(db, 'marketing_posts', postId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async deletePost(postId: string): Promise<void> {
    await deleteDoc(doc(db, 'marketing_posts', postId));
  },

  onPostsSnapshot(profileId: string, callback: (posts: MarketingPost[]) => void): () => void {
    const q = query(
      collection(db, 'marketing_posts'),
      where('profileId', '==', profileId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map((d) => docToData<MarketingPost>(d)));
    });
  },
};

// ==================== UPLOAD-POST API ====================

export const uploadPostApi = {
  async postToplatforms(
    apiKey: string,
    profile: string,
    platforms: Platform[],
    images: File[],
    caption: string,
    title: string
  ): Promise<{ requestId: string }> {
    const formData = new FormData();
    formData.append('profile', profile);
    formData.append('caption', caption);
    formData.append('title', title);
    formData.append('async_upload', 'true');
    platforms.forEach((p) => formData.append('platforms[]', p));
    images.forEach((img, i) => formData.append(`photos[${i}]`, img));

    const response = await fetch('https://api.upload-post.com/api/upload_photos', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload-Post API error: ${response.statusText}`);
    }

    const data = await response.json();
    return { requestId: data.request_id };
  },

  async getAnalytics(
    apiKey: string,
    profile: string,
    platforms: Platform[]
  ): Promise<Record<string, unknown>> {
    const platformStr = platforms.join(',');
    const response = await fetch(
      `https://api.upload-post.com/api/analytics/${profile}?platforms=${platformStr}`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );

    if (!response.ok) {
      throw new Error(`Analytics API error: ${response.statusText}`);
    }

    return response.json();
  },

  async getUploadHistory(
    apiKey: string,
    profile: string,
    page: number = 1,
    perPage: number = 50
  ): Promise<Record<string, unknown>> {
    const response = await fetch(
      `https://api.upload-post.com/api/uploadposts/history?page=${page}&limit=${perPage}&profile_username=${profile}`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );

    if (!response.ok) {
      throw new Error(`Upload history API error: ${response.statusText}`);
    }

    return response.json();
  },

  async getUploadStatus(
    apiKey: string,
    requestId: string
  ): Promise<Record<string, unknown>> {
    const response = await fetch(
      `https://api.upload-post.com/api/uploadposts/status?request_id=${requestId}`,
      { headers: { Authorization: `Bearer ${apiKey}` } }
    );

    if (!response.ok) {
      throw new Error(`Upload status API error: ${response.statusText}`);
    }

    return response.json();
  },
};

// ==================== ANALYTICS ====================

export const marketingAnalyticsApi = {
  async getAnalytics(profileId: string, days: number = 7): Promise<MarketingAnalytics[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const startStr = startDate.toISOString().split('T')[0];

    const q = query(
      collection(db, 'marketing_analytics'),
      where('profileId', '==', profileId),
      where('date', '>=', startStr),
      orderBy('date', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => docToData<MarketingAnalytics>(d));
  },

  async saveAnalytics(data: Omit<MarketingAnalytics, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'marketing_analytics'), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },
};

// ==================== REPORTS ====================

export const marketingReportsApi = {
  async getReports(profileId: string, count: number = 10): Promise<MarketingReport[]> {
    const q = query(
      collection(db, 'marketing_reports'),
      where('profileId', '==', profileId),
      orderBy('date', 'desc'),
      limit(count)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => docToData<MarketingReport>(d));
  },

  async getReport(reportId: string): Promise<MarketingReport | null> {
    const snap = await getDoc(doc(db, 'marketing_reports', reportId));
    if (!snap.exists()) return null;
    return docToData<MarketingReport>(snap);
  },

  async createReport(data: Omit<MarketingReport, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'marketing_reports'), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },
};

// ==================== HOOK PERFORMANCE ====================

export const hookPerformanceApi = {
  async getHookPerformance(profileId: string): Promise<HookPerformance[]> {
    const q = query(
      collection(db, 'hook_performance'),
      where('profileId', '==', profileId),
      orderBy('updatedAt', 'desc'),
      limit(100)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => docToData<HookPerformance>(d));
  },

  async trackHook(data: Omit<HookPerformance, 'id' | 'updatedAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'hook_performance'), {
      ...data,
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async updateHookStatus(hookId: string, status: HookPerformance['status']): Promise<void> {
    await updateDoc(doc(db, 'hook_performance', hookId), {
      status,
      updatedAt: serverTimestamp(),
    });
  },
};

// ==================== COMPETITOR RESEARCH ====================

export const competitorResearchApi = {
  async getResearch(profileId: string): Promise<CompetitorResearch | null> {
    const q = query(
      collection(db, 'competitor_research'),
      where('profileId', '==', profileId),
      orderBy('createdAt', 'desc'),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return docToData<CompetitorResearch>(snap.docs[0]);
  },

  async saveResearch(data: Omit<CompetitorResearch, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'competitor_research'), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  },
};

// ==================== STORAGE ====================

export const marketingStorageApi = {
  async uploadSlideImage(profileId: string, postId: string, file: File, slideIndex: number): Promise<string> {
    const path = `marketing/${profileId}/${postId}/slide-${slideIndex}-${Date.now()}.${file.name.split('.').pop()}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  },

  async uploadGeneratedImage(profileId: string, postId: string, blob: Blob, slideIndex: number): Promise<string> {
    const path = `marketing/${profileId}/${postId}/slide-${slideIndex}-${Date.now()}.png`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, blob);
    return getDownloadURL(storageRef);
  },
};

// ==================== DIAGNOSTIC ENGINE ====================

export function classifyPerformance(
  impressions: number,
  conversions: number,
  downloads?: number,
  paidSubscribers?: number
): { diagnostic: DiagnosticType; action: string } {
  const highViews = impressions >= 5000;
  const highConversions = conversions >= 10;

  if (downloads !== undefined && paidSubscribers !== undefined) {
    if (downloads > 50 && paidSubscribers < 5) {
      return {
        diagnostic: 'app-issue',
        action: 'Pause posting. Fix onboarding flow, paywall timing, or pricing. Marketing is working — the app experience is not.',
      };
    }
  }

  if (highViews && !highConversions && (downloads === undefined || downloads < 10)) {
    return {
      diagnostic: 'cta-issue',
      action: 'Rotate CTA variations: "link in bio", "search on App Store", app name only. Verify App Store page matches content.',
    };
  }

  if (highViews && highConversions) {
    return {
      diagnostic: 'scale',
      action: 'Create 3 variations immediately. Test different posting times. Expand to additional platforms. Never change the CTA.',
    };
  }

  if (highViews && !highConversions) {
    return {
      diagnostic: 'fix-cta',
      action: 'Hook is excellent. Test different CTAs on final slide. Verify app landing page matches slideshow promises.',
    };
  }

  if (!highViews && highConversions) {
    return {
      diagnostic: 'fix-hooks',
      action: 'Content converts well. Test radically different hook types. Try new posting times and different slide 1 images.',
    };
  }

  return {
    diagnostic: 'full-reset',
    action: 'Neither hook nor conversion working. Try completely different format or audience angle. Research current niche trends.',
  };
}

// ==================== EXPORT ALL ====================

export const marketingApi = {
  profile: marketingProfileApi,
  posts: marketingPostsApi,
  uploadPost: uploadPostApi,
  analytics: marketingAnalyticsApi,
  reports: marketingReportsApi,
  hooks: hookPerformanceApi,
  research: competitorResearchApi,
  storage: marketingStorageApi,
};
