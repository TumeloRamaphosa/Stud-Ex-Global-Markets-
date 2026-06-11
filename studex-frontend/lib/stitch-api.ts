/**
 * Studex Google Stitch Skill — API Layer
 *
 * Handles data pipeline orchestration via Google Stitch,
 * connecting multiple data sources into a unified data layer.
 * API key is stored server-side via Firebase Functions config.
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
import { db, auth } from './firebase';
import type {
  StitchPipeline,
  StitchDataSource,
  StitchDestination,
  StitchPipelineRun,
  StitchSyncHistory,
  StitchTransform,
  DataSourceConfig,
  DestinationConfig,
  ConnectionTestResult,
  SyncFrequency,
} from './stitch-types';

// ==================== HELPERS ====================

function getCurrentUserId(): string {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  return user.uid;
}

function docToData<T>(d: DocumentData): T & { id: string } {
  return { id: d.id, ...d.data() } as T & { id: string };
}

// ==================== PIPELINES ====================

export const stitchPipelinesApi = {
  async list(): Promise<StitchPipeline[]> {
    const userId = getCurrentUserId();
    const q = query(
      collection(db, 'stitch_pipelines'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(100)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => docToData<StitchPipeline>(d));
  },

  async get(pipelineId: string): Promise<StitchPipeline | null> {
    const snap = await getDoc(doc(db, 'stitch_pipelines', pipelineId));
    if (!snap.exists()) return null;
    return docToData<StitchPipeline>(snap);
  },

  async create(data: {
    name: string;
    description: string;
    sourceId: string;
    destinationId: string;
    transforms: StitchTransform[];
    schedule: SyncFrequency;
    cronExpression?: string;
  }): Promise<string> {
    const userId = getCurrentUserId();
    const docRef = await addDoc(collection(db, 'stitch_pipelines'), {
      ...data,
      userId,
      status: 'idle',
      lastRunAt: null,
      lastRunStatus: null,
      lastRunError: null,
      runCount: 0,
      enabled: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async update(pipelineId: string, data: Partial<StitchPipeline>): Promise<void> {
    await updateDoc(doc(db, 'stitch_pipelines', pipelineId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async delete(pipelineId: string): Promise<void> {
    await deleteDoc(doc(db, 'stitch_pipelines', pipelineId));
  },

  async run(pipelineId: string): Promise<string> {
    const userId = getCurrentUserId();
    // Create a run record — the Cloud Function will pick it up and execute
    const runRef = await addDoc(collection(db, 'stitch_runs'), {
      pipelineId,
      userId,
      status: 'running',
      recordsProcessed: 0,
      recordsFailed: 0,
      startedAt: serverTimestamp(),
      completedAt: null,
      error: null,
      duration: null,
    });
    // Update pipeline status
    await updateDoc(doc(db, 'stitch_pipelines', pipelineId), {
      status: 'running',
      updatedAt: serverTimestamp(),
    });
    return runRef.id;
  },

  async toggleEnabled(pipelineId: string, enabled: boolean): Promise<void> {
    await updateDoc(doc(db, 'stitch_pipelines', pipelineId), {
      enabled,
      status: enabled ? 'idle' : 'idle',
      updatedAt: serverTimestamp(),
    });
  },

  onPipelinesSnapshot(callback: (pipelines: StitchPipeline[]) => void): () => void {
    const userId = getCurrentUserId();
    const q = query(
      collection(db, 'stitch_pipelines'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map((d) => docToData<StitchPipeline>(d)));
    });
  },
};

// ==================== DATA SOURCES ====================

export const stitchSourcesApi = {
  async list(): Promise<StitchDataSource[]> {
    const userId = getCurrentUserId();
    const q = query(
      collection(db, 'stitch_sources'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => docToData<StitchDataSource>(d));
  },

  async get(sourceId: string): Promise<StitchDataSource | null> {
    const snap = await getDoc(doc(db, 'stitch_sources', sourceId));
    if (!snap.exists()) return null;
    return docToData<StitchDataSource>(snap);
  },

  async connect(data: {
    name: string;
    type: StitchDataSource['type'];
    config: DataSourceConfig;
  }): Promise<string> {
    const userId = getCurrentUserId();
    const docRef = await addDoc(collection(db, 'stitch_sources'), {
      ...data,
      userId,
      status: 'connected',
      lastSyncAt: null,
      recordCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async update(sourceId: string, data: Partial<StitchDataSource>): Promise<void> {
    await updateDoc(doc(db, 'stitch_sources', sourceId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async disconnect(sourceId: string): Promise<void> {
    await updateDoc(doc(db, 'stitch_sources', sourceId), {
      status: 'disconnected',
      updatedAt: serverTimestamp(),
    });
  },

  async delete(sourceId: string): Promise<void> {
    await deleteDoc(doc(db, 'stitch_sources', sourceId));
  },

  async test(sourceId: string): Promise<ConnectionTestResult> {
    // Update status to testing
    await updateDoc(doc(db, 'stitch_sources', sourceId), {
      status: 'testing',
      updatedAt: serverTimestamp(),
    });

    // The actual test is done server-side via Cloud Function
    // This creates a test request that the function processes
    const testRef = await addDoc(collection(db, 'stitch_connection_tests'), {
      sourceId,
      userId: getCurrentUserId(),
      status: 'pending',
      createdAt: serverTimestamp(),
    });

    // Return pending — frontend should listen for updates
    return {
      success: true,
      message: 'Connection test initiated. Results will update shortly.',
    };
  },
};

// ==================== DESTINATIONS ====================

export const stitchDestinationsApi = {
  async list(): Promise<StitchDestination[]> {
    const userId = getCurrentUserId();
    const q = query(
      collection(db, 'stitch_destinations'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => docToData<StitchDestination>(d));
  },

  async create(data: {
    name: string;
    type: StitchDestination['type'];
    config: DestinationConfig;
  }): Promise<string> {
    const userId = getCurrentUserId();
    const docRef = await addDoc(collection(db, 'stitch_destinations'), {
      ...data,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async update(destId: string, data: Partial<StitchDestination>): Promise<void> {
    await updateDoc(doc(db, 'stitch_destinations', destId), {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async delete(destId: string): Promise<void> {
    await deleteDoc(doc(db, 'stitch_destinations', destId));
  },
};

// ==================== TRANSFORMS ====================

export const stitchTransformsApi = {
  async preview(
    transforms: StitchTransform[],
    sampleData: Record<string, unknown>[]
  ): Promise<Record<string, unknown>[]> {
    // Client-side transform preview for immediate feedback
    let data = [...sampleData];

    for (const transform of transforms.sort((a, b) => a.order - b.order)) {
      switch (transform.type) {
        case 'filter':
          data = data.filter((row) => {
            const val = row[transform.config.field || ''];
            switch (transform.config.operator) {
              case 'eq': return val === transform.config.value;
              case 'neq': return val !== transform.config.value;
              case 'gt': return (val as number) > (transform.config.value as number);
              case 'gte': return (val as number) >= (transform.config.value as number);
              case 'lt': return (val as number) < (transform.config.value as number);
              case 'lte': return (val as number) <= (transform.config.value as number);
              case 'contains': return String(val).includes(String(transform.config.value));
              case 'exists': return val !== undefined && val !== null;
              default: return true;
            }
          });
          break;

        case 'rename':
          data = data.map((row) => {
            const newRow = { ...row };
            if (transform.config.sourceField && transform.config.targetField) {
              newRow[transform.config.targetField] = newRow[transform.config.sourceField];
              delete newRow[transform.config.sourceField];
            }
            return newRow;
          });
          break;

        case 'deduplicate':
          if (transform.config.deduplicateKey) {
            const seen = new Set();
            data = data.filter((row) => {
              const key = row[transform.config.deduplicateKey!];
              if (seen.has(key)) return false;
              seen.add(key);
              return true;
            });
          }
          break;

        // Map, aggregate, compute are handled server-side for full support
        default:
          break;
      }
    }

    return data;
  },
};

// ==================== SYNC HISTORY ====================

export const stitchSyncApi = {
  async getHistory(pipelineId: string, count: number = 20): Promise<StitchSyncHistory[]> {
    const q = query(
      collection(db, 'stitch_sync_history'),
      where('pipelineId', '==', pipelineId),
      orderBy('syncedAt', 'desc'),
      limit(count)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => docToData<StitchSyncHistory>(d));
  },

  async getRuns(pipelineId: string, count: number = 10): Promise<StitchPipelineRun[]> {
    const q = query(
      collection(db, 'stitch_runs'),
      where('pipelineId', '==', pipelineId),
      orderBy('startedAt', 'desc'),
      limit(count)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => docToData<StitchPipelineRun>(d));
  },

  onRunUpdates(pipelineId: string, callback: (runs: StitchPipelineRun[]) => void): () => void {
    const q = query(
      collection(db, 'stitch_runs'),
      where('pipelineId', '==', pipelineId),
      orderBy('startedAt', 'desc'),
      limit(5)
    );
    return onSnapshot(q, (snap) => {
      callback(snap.docs.map((d) => docToData<StitchPipelineRun>(d)));
    });
  },
};

// ==================== EXPORT ALL ====================

export const stitchApi = {
  pipelines: stitchPipelinesApi,
  sources: stitchSourcesApi,
  destinations: stitchDestinationsApi,
  transforms: stitchTransformsApi,
  sync: stitchSyncApi,
};
