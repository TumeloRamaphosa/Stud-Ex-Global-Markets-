import "./env.js";

const graphVersion = process.env.GRAPH_API_VERSION || "v20.0";
const pageId = process.env.FACEBOOK_PAGE_ID || "";
const pageToken = process.env.META_PAGE_TOKEN || "";
const instagramAccountId = process.env.INSTAGRAM_ACCOUNT_ID || "";

function graphUrl(pathname: string, params?: Record<string, string>) {
  const url = new URL(`https://graph.facebook.com/${graphVersion}/${pathname}`);
  if (params) {
    Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  }
  return url;
}

async function graphFetchJson(pathname: string, options?: RequestInit, params?: Record<string, string>) {
  const response = await fetch(graphUrl(pathname, params), options);
  const data = (await response.json()) as Record<string, unknown>;
  if (!response.ok || data.error) {
    throw new Error(
      String((data.error as { message?: string } | undefined)?.message || response.statusText),
    );
  }
  return data;
}

export function getMetaConfig() {
  return {
    pageId,
    instagramAccountId,
    tokenConfigured: Boolean(pageToken),
    tokenExpiresAt: process.env.META_TOKEN_EXPIRES_AT || "2026-08-04",
  };
}

export async function postToFacebook(input: {
  caption: string;
  imageUrl?: string;
  videoUrl?: string;
}): Promise<{ mediaId?: string; postId: string; publish?: Record<string, unknown> }> {
  if (!pageToken || !pageId) {
    throw new Error("Meta Facebook credentials are not configured.");
  }

  if (input.videoUrl) {
    const publish = await graphFetchJson(`${pageId}/videos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        video_url: input.videoUrl,
        description: input.caption,
        access_token: pageToken,
      }),
    });

    return {
      postId: String(publish.id || ""),
      publish,
    };
  }

  if (!input.imageUrl) {
    throw new Error("imageUrl is required for Facebook image posts.");
  }

  const upload = await graphFetchJson(`${pageId}/photos`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: input.imageUrl,
      published: false,
      access_token: pageToken,
    }),
  });

  const mediaId = String(upload.id || upload.post_id || "");
  if (!mediaId) {
    throw new Error("Facebook media upload did not return a media id.");
  }

  const publish = await graphFetchJson(`${pageId}/feed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: input.caption,
      attached_media: [{ media_fbid: mediaId }],
      access_token: pageToken,
    }),
  });

  return {
    mediaId,
    postId: String(publish.id || mediaId),
    publish,
  };
}

async function waitForInstagramMedia(mediaId: string) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const result = await graphFetchJson(mediaId, undefined, {
      fields: "status_code",
      access_token: pageToken,
    });

    if (result.status_code === "FINISHED") {
      return;
    }

    if (result.status_code === "ERROR") {
      throw new Error("Instagram media processing failed.");
    }

    await new Promise((resolve) => setTimeout(resolve, 2500));
  }

  throw new Error("Instagram media processing timed out.");
}

export async function postToInstagram(input: {
  caption: string;
  imageUrl?: string;
  videoUrl?: string;
}): Promise<{ mediaId: string; postId: string; publish: Record<string, unknown> }> {
  if (!pageToken || !instagramAccountId) {
    throw new Error("Meta Instagram credentials are not configured.");
  }

  const body: Record<string, string> = {
    caption: input.caption,
    access_token: pageToken,
  };

  if (input.videoUrl) {
    body.media_type = "REELS";
    body.video_url = input.videoUrl;
  } else if (input.imageUrl) {
    body.image_url = input.imageUrl;
  } else {
    throw new Error("imageUrl or videoUrl is required for Instagram posts.");
  }

  const container = await graphFetchJson(`${instagramAccountId}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const mediaId = String(container.id || "");
  if (!mediaId) {
    throw new Error("Instagram container creation did not return an id.");
  }

  await waitForInstagramMedia(mediaId);

  const publish = await graphFetchJson(`${instagramAccountId}/media_publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      creation_id: mediaId,
      access_token: pageToken,
    }),
  });

  return {
    mediaId,
    postId: String(publish.id || mediaId),
    publish,
  };
}

export async function fetchFacebookReach() {
  if (!pageToken || !pageId) {
    return null;
  }

  const data = await graphFetchJson(`${pageId}/insights`, undefined, {
    metric: "page_impressions",
    period: "week",
    access_token: pageToken,
  });

  const value = Array.isArray(data.data)
    ? Number((data.data[0] as { values?: Array<{ value?: number }> }).values?.[0]?.value || 0)
    : 0;

  return value;
}

export async function fetchInstagramEngagement() {
  if (!pageToken || !instagramAccountId) {
    return null;
  }

  const data = await graphFetchJson(`${instagramAccountId}/insights`, undefined, {
    metric: "engagement",
    period: "week",
    access_token: pageToken,
  });

  const value = Array.isArray(data.data)
    ? Number((data.data[0] as { values?: Array<{ value?: number }> }).values?.[0]?.value || 0)
    : 0;

  return value;
}
