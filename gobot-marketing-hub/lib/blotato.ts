/**
 * Blotato API Client
 * Multi-platform social media posting via Blotato.com
 *
 * Base URL: https://backend.blotato.com/v2
 * Auth: blotato-api-key header
 * Rate limit: 30 req/min for posts, 60 req/min for status checks
 */

import type {
  BlotaAccount,
  BlotaSubAccount,
  BlotaPostRequest,
  BlotaPostResponse,
  BlotaPostStatus,
  BlotaPlatform,
} from './types';

const BLOTATO_BASE = process.env.NEXT_PUBLIC_BLOTATO_BASE_URL || 'https://backend.blotato.com/v2';

async function blotatoFetch(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const apiKey = process.env.BLOTATO_API_KEY;
  if (!apiKey) throw new Error('BLOTATO_API_KEY not configured');

  const response = await fetch(`${BLOTATO_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'blotato-api-key': apiKey,
      ...options.headers,
    },
  });

  if (response.status === 429) {
    throw new Error('Blotato rate limit exceeded. Retry after 60 seconds.');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new Error(`Blotato API error (${response.status}): ${JSON.stringify(error)}`);
  }

  return response;
}

// ==================== ACCOUNTS ====================

export async function getAccounts(platform?: BlotaPlatform): Promise<BlotaAccount[]> {
  const query = platform ? `?platform=${platform}` : '';
  const res = await blotatoFetch(`/users/me/accounts${query}`);
  const data = await res.json();
  return data.accounts || data;
}

export async function getSubAccounts(accountId: string): Promise<BlotaSubAccount[]> {
  const res = await blotatoFetch(`/users/me/accounts/${accountId}/subaccounts`);
  const data = await res.json();
  return data.subaccounts || data;
}

export async function verifyApiKey(): Promise<{ valid: boolean; user?: Record<string, unknown> }> {
  try {
    const res = await blotatoFetch('/users/me');
    const data = await res.json();
    return { valid: true, user: data };
  } catch {
    return { valid: false };
  }
}

// ==================== POSTING ====================

/**
 * Post content to a single platform via Blotato.
 * For multi-platform, call this once per platform.
 */
export async function publishPost(request: BlotaPostRequest): Promise<BlotaPostResponse> {
  // Validate: content.platform must match target.targetType
  if (request.post.content.platform !== request.post.target.targetType) {
    throw new Error(
      `Platform mismatch: content.platform="${request.post.content.platform}" must match target.targetType="${request.post.target.targetType}"`
    );
  }

  // Validate: Facebook/LinkedIn require pageId
  if (
    ['facebook', 'linkedin'].includes(request.post.content.platform) &&
    !request.post.target.pageId
  ) {
    throw new Error(
      `${request.post.content.platform} requires target.pageId. Call getSubAccounts() first.`
    );
  }

  const res = await blotatoFetch('/posts', {
    method: 'POST',
    body: JSON.stringify(request),
  });

  return res.json();
}

/**
 * Post to multiple platforms at once.
 * Makes separate API calls per platform (Blotato requires one call per platform).
 * Returns all submission IDs.
 */
export async function publishToMultiplePlatforms(
  accounts: BlotaAccount[],
  text: string,
  mediaUrls: string[],
  platforms: BlotaPlatform[],
  scheduledTime?: string,
  useNextFreeSlot?: boolean,
  subAccounts?: Record<string, BlotaSubAccount>
): Promise<{ platform: BlotaPlatform; submissionId: string; error?: string }[]> {
  const results: { platform: BlotaPlatform; submissionId: string; error?: string }[] = [];

  for (const platform of platforms) {
    const account = accounts.find((a) => a.platform === platform);
    if (!account) {
      results.push({ platform, submissionId: '', error: `No ${platform} account connected` });
      continue;
    }

    try {
      const request: BlotaPostRequest = {
        post: {
          accountId: account.id,
          content: { text, mediaUrls, platform },
          target: {
            targetType: platform,
            ...(subAccounts?.[platform]?.pageId && { pageId: subAccounts[platform].pageId }),
          },
        },
      };

      // Scheduling — top-level, NOT inside post
      if (scheduledTime) {
        request.scheduledTime = scheduledTime;
      } else if (useNextFreeSlot) {
        request.useNextFreeSlot = true;
      }

      const response = await publishPost(request);
      results.push({ platform, submissionId: response.postSubmissionId });

      // Respect rate limits: small delay between posts
      await new Promise((resolve) => setTimeout(resolve, 2100));
    } catch (err) {
      results.push({
        platform,
        submissionId: '',
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }

  return results;
}

// ==================== STATUS ====================

export async function getPostStatus(postSubmissionId: string): Promise<BlotaPostStatus> {
  const res = await blotatoFetch(`/posts/${postSubmissionId}`);
  return res.json();
}

/**
 * Poll post status until it resolves (published or failed).
 * Polls every 5 seconds, max 60 attempts (5 minutes).
 */
export async function waitForPostStatus(
  postSubmissionId: string,
  maxAttempts: number = 60,
  intervalMs: number = 5000
): Promise<BlotaPostStatus> {
  for (let i = 0; i < maxAttempts; i++) {
    const status = await getPostStatus(postSubmissionId);
    if (status.status === 'published' || status.status === 'failed') {
      return status;
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error(`Post ${postSubmissionId} did not resolve after ${maxAttempts} attempts`);
}

// ==================== MEDIA ====================

export async function uploadMedia(mediaUrl: string): Promise<{ url: string }> {
  const res = await blotatoFetch('/media', {
    method: 'POST',
    body: JSON.stringify({ url: mediaUrl }),
  });
  return res.json();
}
