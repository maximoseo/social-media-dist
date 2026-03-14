/** @type {import('next').NextConfig} */

// Fail the build early if required Supabase env vars are missing.
// This prevents deploying a login page that shows a broken-auth warning.
const requiredPublicEnv = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
];

const missing = requiredPublicEnv.filter((key) => !process.env[key]?.trim());
if (missing.length > 0) {
  throw new Error(
    `\n\n❌  Missing required environment variables:\n${missing.map((k) => `   • ${k}`).join('\n')}\n\nSet them in .env.local (local) or your hosting dashboard (production).\nSee .env.example for details.\n`,
  );
}

const nextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
