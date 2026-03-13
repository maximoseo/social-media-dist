const PUBLIC_ENV_KEYS = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'NEXT_PUBLIC_APP_URL'] as const;

const SERVER_ENV_KEYS = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'PUBLER_API_KEY',
  'KIE_API_KEY',
  'OPENAI_API_KEY',
  'OPENROUTER_API_KEY',
  'ANTHROPIC_API_KEY',
  'GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON',
  'GOOGLE_SHEETS_SPREADSHEET_ID',
  'GOOGLE_SHEETS_DEFAULT_SHEET',
  'N8N_WEBHOOK_SHARED_SECRET',
  'AI_PROVIDER',
  'AI_MODEL',
] as const;

export function getPublicEnv() {
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
    appUrl: process.env.NEXT_PUBLIC_APP_URL ?? '',
  };
}

export function hasBrowserSupabaseConfig() {
  const env = getPublicEnv();
  return Boolean(env.supabaseUrl && env.supabaseAnonKey);
}

export function hasServiceRoleConfig() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function getEnabledIntegrations() {
  return {
    supabase: hasBrowserSupabaseConfig() && hasServiceRoleConfig(),
    ai: Boolean(
      process.env.OPENAI_API_KEY ||
        process.env.OPENROUTER_API_KEY ||
        process.env.ANTHROPIC_API_KEY,
    ),
    kie: Boolean(process.env.KIE_API_KEY),
    publer: Boolean(process.env.PUBLER_API_KEY),
    googleSheets: Boolean(
      process.env.GOOGLE_SHEETS_SERVICE_ACCOUNT_JSON &&
        process.env.GOOGLE_SHEETS_SPREADSHEET_ID,
    ),
  };
}

export function getConfigSummary() {
  return {
    public: PUBLIC_ENV_KEYS.map((key) => [key, Boolean(process.env[key])] as const),
    server: SERVER_ENV_KEYS.map((key) => [key, Boolean(process.env[key])] as const),
  };
}
