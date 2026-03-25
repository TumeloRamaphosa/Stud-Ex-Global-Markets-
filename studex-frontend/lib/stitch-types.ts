import { Timestamp } from 'firebase/firestore';

// ==================== GOOGLE STITCH TYPES ====================

export type PipelineStatus = 'idle' | 'running' | 'completed' | 'failed' | 'scheduled';
export type SourceStatus = 'connected' | 'disconnected' | 'error' | 'testing';
export type SyncFrequency = 'realtime' | '5min' | '15min' | '1hour' | '6hour' | 'daily' | 'weekly' | 'manual';

export type DataSourceType =
  | 'tiktok-analytics'
  | 'instagram-analytics'
  | 'youtube-analytics'
  | 'google-analytics'
  | 'firebase-firestore'
  | 'bigquery'
  | 'stripe'
  | 'revenuecat'
  | 'upload-post'
  | 'csv-upload'
  | 'rest-api'
  | 'webhook';

export type DestinationType =
  | 'firestore'
  | 'bigquery'
  | 'cloud-storage'
  | 'webhook';

export interface StitchPipeline {
  id?: string;
  userId: string;
  name: string;
  description: string;
  sourceId: string;
  destinationId: string;
  transforms: StitchTransform[];
  schedule: SyncFrequency;
  cronExpression?: string;
  status: PipelineStatus;
  lastRunAt: Timestamp | null;
  lastRunStatus: 'success' | 'failed' | null;
  lastRunError: string | null;
  runCount: number;
  enabled: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface StitchDataSource {
  id?: string;
  userId: string;
  name: string;
  type: DataSourceType;
  status: SourceStatus;
  config: DataSourceConfig;
  lastSyncAt: Timestamp | null;
  recordCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface DataSourceConfig {
  apiKey?: string;
  endpoint?: string;
  profile?: string;
  projectId?: string;
  collectionName?: string;
  datasetId?: string;
  tableId?: string;
  headers?: Record<string, string>;
  queryParams?: Record<string, string>;
  webhookSecret?: string;
}

export interface StitchDestination {
  id?: string;
  userId: string;
  name: string;
  type: DestinationType;
  config: DestinationConfig;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface DestinationConfig {
  collectionName?: string;
  datasetId?: string;
  tableId?: string;
  bucketName?: string;
  filePath?: string;
  webhookUrl?: string;
  mergeStrategy: 'replace' | 'merge' | 'append';
}

export interface StitchTransform {
  id: string;
  name: string;
  type: 'filter' | 'map' | 'aggregate' | 'rename' | 'compute' | 'deduplicate';
  config: TransformConfig;
  order: number;
}

export interface TransformConfig {
  // Filter
  field?: string;
  operator?: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'exists';
  value?: string | number | boolean;
  // Map / Rename
  sourceField?: string;
  targetField?: string;
  // Aggregate
  groupBy?: string;
  aggregateField?: string;
  aggregateFunction?: 'sum' | 'avg' | 'count' | 'min' | 'max';
  // Compute
  expression?: string;
  // Deduplicate
  deduplicateKey?: string;
}

export interface StitchPipelineRun {
  id?: string;
  pipelineId: string;
  userId: string;
  status: 'running' | 'completed' | 'failed';
  recordsProcessed: number;
  recordsFailed: number;
  startedAt: Timestamp;
  completedAt: Timestamp | null;
  error: string | null;
  duration: number | null;
}

export interface StitchSyncHistory {
  id?: string;
  pipelineId: string;
  sourceId: string;
  destinationId: string;
  status: 'success' | 'failed';
  recordsProcessed: number;
  recordsFailed: number;
  syncedAt: Timestamp;
  duration: number;
  error: string | null;
}

export interface ConnectionTestResult {
  success: boolean;
  message: string;
  recordCount?: number;
  sampleData?: Record<string, unknown>[];
  latency?: number;
}

// ==================== LABELS ====================

export const DATA_SOURCE_LABELS: Record<DataSourceType, string> = {
  'tiktok-analytics': 'TikTok Analytics',
  'instagram-analytics': 'Instagram Analytics',
  'youtube-analytics': 'YouTube Analytics',
  'google-analytics': 'Google Analytics',
  'firebase-firestore': 'Firebase Firestore',
  'bigquery': 'BigQuery',
  'stripe': 'Stripe Payments',
  'revenuecat': 'RevenueCat',
  'upload-post': 'Upload-Post',
  'csv-upload': 'CSV Upload',
  'rest-api': 'REST API',
  'webhook': 'Webhook',
};

export const DESTINATION_LABELS: Record<DestinationType, string> = {
  'firestore': 'Firestore',
  'bigquery': 'BigQuery',
  'cloud-storage': 'Cloud Storage',
  'webhook': 'Webhook',
};

export const SYNC_FREQUENCY_LABELS: Record<SyncFrequency, string> = {
  'realtime': 'Real-time',
  '5min': 'Every 5 minutes',
  '15min': 'Every 15 minutes',
  '1hour': 'Every hour',
  '6hour': 'Every 6 hours',
  'daily': 'Daily',
  'weekly': 'Weekly',
  'manual': 'Manual only',
};
