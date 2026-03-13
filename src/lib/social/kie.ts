import { getSupabaseAdminClient } from '@/lib/supabase/admin';

function getKieConfig() {
  const apiKey = process.env.KIE_API_KEY;
  if (!apiKey) {
    throw new Error('KIE_API_KEY is not configured.');
  }

  const baseUrl = process.env.KIE_API_BASE_URL || 'https://api.kie.ai/api/v1';

  return {
    apiKey,
    submitUrl: `${baseUrl}${process.env.KIE_IMAGE_SUBMIT_PATH || '/jobs/submit'}`,
    recordInfoUrl: `${baseUrl}${process.env.KIE_IMAGE_RECORD_PATH || '/jobs/record-info'}`,
    downloadUrl: `${baseUrl}${process.env.KIE_IMAGE_DOWNLOAD_PATH || '/jobs/download-url'}`,
  };
}

function kieHeaders(apiKey: string) {
  return {
    Authorization: `Bearer ${apiKey}`,
    'x-api-key': apiKey,
    'Content-Type': 'application/json',
  };
}

export async function generateKieImage(params: {
  siteId: string;
  draftId: string;
  prompt: string;
}) {
  const config = getKieConfig();

  const submitResponse = await fetch(config.submitUrl, {
    method: 'POST',
    headers: kieHeaders(config.apiKey),
    body: JSON.stringify({
      model: 'nanobanana-2',
      prompt: params.prompt,
      aspect_ratio: '1:1',
      output_format: 'png',
    }),
  });

  if (!submitResponse.ok) {
    throw new Error(`KIE submit failed with ${submitResponse.status}.`);
  }

  const submitPayload = (await submitResponse.json()) as Record<string, unknown>;
  const submitData = (submitPayload.data ?? {}) as Record<string, unknown>;
  const taskId = String(
    submitPayload.task_id ??
      submitPayload.taskId ??
      submitPayload.id ??
      submitData.task_id ??
      submitData.taskId ??
      '',
  );

  if (!taskId) {
    throw new Error('KIE did not return a task id.');
  }

  let finalImageUrl = '';
  for (let attempt = 0; attempt < 12; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 2_500));

    const recordResponse = await fetch(config.recordInfoUrl, {
      method: 'POST',
      headers: kieHeaders(config.apiKey),
      body: JSON.stringify({ task_id: taskId }),
    });

    if (!recordResponse.ok) {
      continue;
    }

    const recordPayload = (await recordResponse.json()) as Record<string, unknown>;
    const recordData = (recordPayload.data ?? {}) as Record<string, unknown>;
    const status = String(
      recordPayload.status ??
        recordPayload.task_status ??
        recordData.status ??
        recordData.task_status ??
        '',
    ).toLowerCase();

    if (status.includes('fail')) {
      throw new Error(`KIE task ${taskId} failed.`);
    }

    if (status.includes('success') || status.includes('completed') || status.includes('finish')) {
      const downloadResponse = await fetch(config.downloadUrl, {
        method: 'POST',
        headers: kieHeaders(config.apiKey),
        body: JSON.stringify({ task_id: taskId }),
      });

      if (!downloadResponse.ok) {
        throw new Error(`KIE download lookup failed with ${downloadResponse.status}.`);
      }

      const downloadPayload = (await downloadResponse.json()) as Record<string, unknown>;
      const downloadData = (downloadPayload.data ?? {}) as Record<string, unknown>;
      finalImageUrl = String(
        downloadPayload.url ??
          downloadPayload.download_url ??
          downloadData.url ??
          downloadData.download_url ??
          '',
      );
      break;
    }
  }

  if (!finalImageUrl) {
    throw new Error('KIE image was not ready before the polling window expired.');
  }

  const storageBucket = process.env.SUPABASE_ASSET_BUCKET || 'generated-assets';
  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return {
      taskId,
      publicUrl: finalImageUrl,
      storagePath: null,
    };
  }

  const imageResponse = await fetch(finalImageUrl);
  if (!imageResponse.ok) {
    throw new Error('Failed to download KIE image output.');
  }

  const arrayBuffer = await imageResponse.arrayBuffer();
  const storagePath = `${params.siteId}/${params.draftId}/${taskId}.png`;
  const { error } = await supabase.storage
    .from(storageBucket)
    .upload(storagePath, Buffer.from(arrayBuffer), {
      contentType: 'image/png',
      upsert: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage.from(storageBucket).getPublicUrl(storagePath);

  return {
    taskId,
    publicUrl: data.publicUrl,
    storagePath,
  };
}
