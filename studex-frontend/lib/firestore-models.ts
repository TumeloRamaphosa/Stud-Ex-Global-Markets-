/**
 * Firestore Data Models for Larry Skill Platform
 * This file defines the structure for Firestore collections
 * To be implemented when Firebase connection is configured
 */

import { db } from './firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';

// Collection names
export const COLLECTIONS = {
  campaigns: 'larry_campaigns',
  workflows: 'workflow_sessions',
  analytics: 'campaign_analytics',
  memory: 'system_memory',
};

// Campaign Model
export interface FirestoreCampaign {
  id?: string;
  userId: string;
  title: string;
  niche: string;
  targetAudience: string;
  status: 'draft' | 'running' | 'published' | 'completed';
  createdAt: Date;
  updatedAt: Date;
  content: {
    hook: string;
    slides: string[];
    caption: string;
    cta: string;
    platforms: string[];
  };
  metrics: {
    views: number;
    likes: number;
    shares: number;
    comments: number;
  };
  publishedPosts: {
    platform: string;
    postId: string;
    url: string;
    publishedAt: Date;
  }[];
}

// Workflow Session Model
export interface FirestoreWorkflowSession {
  id?: string;
  campaignId: string;
  userId: string;
  steps: {
    id: string;
    name: string;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    result?: string;
    error?: string;
    startTime?: Date;
    endTime?: Date;
  }[];
  createdAt: Date;
  completedAt?: Date;
}

// Analytics Model
export interface FirestoreAnalytics {
  id?: string;
  campaignId: string;
  userId: string;
  date: Date;
  platform: string;
  metrics: {
    views: number;
    likes: number;
    shares: number;
    comments: number;
    engagementRate: number;
  };
}

// System Memory Model
export interface FirestoreMemory {
  id?: string;
  userId: string;
  category: 'performancePatterns' | 'successFormulas' | 'optimizations';
  content: string;
  frequency: number;
  lastUsed: Date;
  createdAt: Date;
}

/**
 * Campaign Repository
 * Handles all campaign-related Firestore operations
 */
export class CampaignRepository {
  static async create(userId: string, data: Omit<FirestoreCampaign, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) {
    try {
      const campaignId = doc(collection(db, COLLECTIONS.campaigns)).id;
      const now = new Date();

      await setDoc(doc(db, COLLECTIONS.campaigns, campaignId), {
        ...data,
        userId,
        createdAt: now,
        updatedAt: now,
      });

      return campaignId;
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  }

  static async getById(campaignId: string): Promise<FirestoreCampaign | null> {
    try {
      const snapshot = await getDoc(doc(db, COLLECTIONS.campaigns, campaignId));
      return snapshot.exists() ? (snapshot.data() as FirestoreCampaign) : null;
    } catch (error) {
      console.error('Error fetching campaign:', error);
      throw error;
    }
  }

  static async getByUserId(userId: string): Promise<FirestoreCampaign[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.campaigns),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => doc.data() as FirestoreCampaign);
    } catch (error) {
      console.error('Error fetching user campaigns:', error);
      throw error;
    }
  }

  static async update(campaignId: string, updates: Partial<FirestoreCampaign>) {
    try {
      await updateDoc(doc(db, COLLECTIONS.campaigns, campaignId), {
        ...updates,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error('Error updating campaign:', error);
      throw error;
    }
  }

  static async delete(campaignId: string) {
    try {
      await deleteDoc(doc(db, COLLECTIONS.campaigns, campaignId));
    } catch (error) {
      console.error('Error deleting campaign:', error);
      throw error;
    }
  }
}

/**
 * Analytics Repository
 * Handles all analytics-related Firestore operations
 */
export class AnalyticsRepository {
  static async log(userId: string, campaignId: string, data: Omit<FirestoreAnalytics, 'id' | 'userId' | 'campaignId'>) {
    try {
      const analyticsId = doc(collection(db, COLLECTIONS.analytics)).id;

      await setDoc(doc(db, COLLECTIONS.analytics, analyticsId), {
        ...data,
        userId,
        campaignId,
      });

      return analyticsId;
    } catch (error) {
      console.error('Error logging analytics:', error);
      throw error;
    }
  }

  static async getByCampaign(campaignId: string): Promise<FirestoreAnalytics[]> {
    try {
      const q = query(
        collection(db, COLLECTIONS.analytics),
        where('campaignId', '==', campaignId),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => doc.data() as FirestoreAnalytics);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      throw error;
    }
  }

  static async getByUser(userId: string, days: number = 7): Promise<FirestoreAnalytics[]> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const q = query(
        collection(db, COLLECTIONS.analytics),
        where('userId', '==', userId),
        where('date', '>=', cutoffDate),
        orderBy('date', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => doc.data() as FirestoreAnalytics);
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      throw error;
    }
  }
}

/**
 * Memory Repository
 * Handles system learning and pattern storage
 */
export class MemoryRepository {
  static async add(userId: string, category: keyof Omit<FirestoreMemory, 'id'>, content: string) {
    try {
      const memoryId = doc(collection(db, COLLECTIONS.memory)).id;
      const now = new Date();

      await setDoc(doc(db, COLLECTIONS.memory, memoryId), {
        userId,
        category,
        content,
        frequency: 1,
        lastUsed: now,
        createdAt: now,
      });

      return memoryId;
    } catch (error) {
      console.error('Error adding memory:', error);
      throw error;
    }
  }

  static async getByUser(userId: string, category?: string): Promise<FirestoreMemory[]> {
    try {
      const conditions = [where('userId', '==', userId)];
      if (category) {
        conditions.push(where('category', '==', category));
      }

      const q = query(
        collection(db, COLLECTIONS.memory),
        ...conditions,
        orderBy('frequency', 'desc')
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => doc.data() as FirestoreMemory);
    } catch (error) {
      console.error('Error fetching memory:', error);
      throw error;
    }
  }

  static async incrementFrequency(memoryId: string) {
    try {
      await updateDoc(doc(db, COLLECTIONS.memory, memoryId), {
        frequency: increment(1),
        lastUsed: new Date(),
      });
    } catch (error) {
      console.error('Error updating memory frequency:', error);
      throw error;
    }
  }
}

// Re-export for convenience
export { CampaignRepository as Campaigns, AnalyticsRepository as Analytics, MemoryRepository as Memory };

// Note: increment is from 'firebase/firestore'
import { increment } from 'firebase/firestore';
