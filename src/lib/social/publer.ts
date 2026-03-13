function getPublerConfig() {
  const apiKey = process.env.PUBLER_API_KEY;
  if (!apiKey) {
    throw new Error('PUBLER_API_KEY is not configured.');
  }

  const baseUrl = process.env.PUBLER_API_BASE_URL || 'https://app.publer.io/api/v1';

  return {
    apiKey,
    postsUrl: `${baseUrl}${process.env.PUBLER_POSTS_PATH || '/posts'}`,
    jobStatusTemplate:
      process.env.PUBLER_JOB_STATUS_TEMPLATE || `${baseUrl}/job_status/{jobId}`,
  };
}

export async function submitPublerPost(params: {
  socialAccountId: string;
  body: string;
  mediaUrls?: string[];
  scheduledFor?: string | null;
  title?: string;
  link?: string | null;
  mode: 'schedule' | 'publish_now';
}) {
  const config = getPublerConfig();
  const response = await fetch(config.postsUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      social_accounts: [params.socialAccountId],
      text: params.body,
      media: params.mediaUrls ?? [],
      title: params.title ?? undefined,
      link: params.link ?? undefined,
      schedule: params.mode === 'schedule' ? params.scheduledFor : undefined,
      publish_now: params.mode === 'publish_now',
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Publer request failed with ${response.status}: ${body}`);
  }

  return (await response.json()) as Record<string, unknown>;
}

export async function getPublerJobStatus(jobId: string) {
  const config = getPublerConfig();
  const response = await fetch(config.jobStatusTemplate.replace('{jobId}', jobId), {
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Publer job status failed with ${response.status}.`);
  }

  return (await response.json()) as Record<string, unknown>;
}
