export function readEnv(name: string): string {
  return process.env[name]?.trim() ?? '';
}

export function hasSupabasePublicConfig(): boolean {
  return Boolean(readEnv('NEXT_PUBLIC_SUPABASE_URL') && readEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'));
}

export function hasSupabaseServerConfig(): boolean {
  return Boolean(readEnv('SUPABASE_URL') && readEnv('SUPABASE_SERVICE_ROLE_KEY'));
}

export function getSiteUrl(): string {
  return readEnv('NEXT_PUBLIC_SITE_URL') || 'http://localhost:3000';
}
