// Fill these in from Supabase: Project Settings > API.
// The anon key is safe to publish; row level security and the two database functions protect the data.
export const SUPABASE_URL = 'https://YOUR-PROJECT-REF.supabase.co';
export const SUPABASE_ANON_KEY = 'YOUR-ANON-KEY';

export const isConfigured = () => !!window.__MTN_FAKE_CLIENT__ || !SUPABASE_URL.includes('YOUR-PROJECT-REF') && !SUPABASE_ANON_KEY.startsWith('YOUR-');

// The phone link shown on the projector. Defaults to this site's own folder.
export function playUrl(code) {
  const base = location.href.replace(/[^/]*(\?.*)?(#.*)?$/, '');
  return `${base}play.html?room=${encodeURIComponent(code)}`;
}
