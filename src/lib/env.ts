/**
 * Environment variable validation and access
 *
 * Provides safe access to environment variables with validation
 * and helpful error messages for missing or invalid values.
 */

const REQUIRED_ENV_VARS = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
] as const;

const OPTIONAL_ENV_VARS = [
  'OPENROUTER_API_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
  'FIRECRAWL_API_KEY',
] as const;

/**
 * Check if all required environment variables are set
 * Returns an object with valid flag and missing variables list
 */
export function validateEnvVars(): {
  valid: boolean;
  missing: string[];
  invalid: string[];
} {
  const missing: string[] = [];
  const invalid: string[] = [];

  // Check required vars
  for (const varName of REQUIRED_ENV_VARS) {
    const value = process.env[varName];
    if (!value || value.trim() === '') {
      missing.push(varName);
    }
  }

  // Validate URL format if present
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);
    } catch {
      invalid.push('NEXT_PUBLIC_SUPABASE_URL (invalid URL format)');
    }
  }

  // Validate anon key format if present
  if (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (key.length < 20) {
      invalid.push('NEXT_PUBLIC_SUPABASE_ANON_KEY (appears too short)');
    }
  }

  return {
    valid: missing.length === 0 && invalid.length === 0,
    missing,
    invalid,
  };
}

/**
 * Get a client-side environment variable with type safety
 */
export function getPublicEnvVar<T extends string>(key: T): string | undefined {
  return process.env[key];
}

/**
 * Get a server-side environment variable with type safety
 */
export function getServerEnvVar<T extends string>(key: T): string | undefined {
  return process.env[key];
}

/**
 * Check if OpenRouter API key is configured
 */
export function isOpenRouterConfigured(): boolean {
  const key = process.env.OPENROUTER_API_KEY;
  return !!(key && key.length > 10 && key.startsWith('sk-or'));
}

/**
 * Check if Supabase service role key is configured
 */
export function isSupabaseServiceRoleConfigured(): boolean {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return !!(key && key.length > 20 && (key.startsWith('eyJ') || key.startsWith('sb_secret_')));
}

/**
 * Get environment info for debugging
 */
export function getEnvInfo(): {
  nodeEnv: string;
  supabaseConfigured: boolean;
  openRouterConfigured: boolean;
  supabaseServiceRoleConfigured: boolean;
  firecrawlConfigured: boolean;
} {
  return {
    nodeEnv: process.env.NODE_ENV || 'unknown',
    supabaseConfigured: !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    openRouterConfigured: isOpenRouterConfigured(),
    supabaseServiceRoleConfigured: isSupabaseServiceRoleConfigured(),
    firecrawlConfigured: !!(process.env.FIRECRAWL_API_KEY && process.env.FIRECRAWL_API_KEY.length > 10),
  };
}
