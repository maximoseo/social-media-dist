import { NextResponse } from 'next/server';
import { getEnabledIntegrations } from '@/lib/social/env';

export async function GET() {
  const integrations = getEnabledIntegrations();
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      aiConfigured: integrations.ai,
      supabaseConfigured: integrations.supabase,
      publerConfigured: integrations.publer,
      kieConfigured: integrations.kie,
      googleSheetsConfigured: integrations.googleSheets,
    },
  });
}
