// Fill these in from Supabase: Project Settings > API (publishable key).
// The anon key is safe to publish; row level security and the two database functions protect the data.
export const SUPABASE_URL = 'https://joqrzcloesgehulmyuzc.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_YDo_Tx53VVtS_TE-S86xRQ_8Df3d6QD';

export const isConfigured = () => !!window.__MTN_FAKE_CLIENT__ || !SUPABASE_URL.includes('YOUR-PROJECT-REF') && !SUPABASE_ANON_KEY.startsWith('YOUR-');

// The phone link shown on the projector. Defaults to this site's own folder.
export function playUrl(code) {
  const base = location.href.replace(/[^/]*(\?.*)?(#.*)?$/, '');
  return `${base}play.html?room=${encodeURIComponent(code)}`;
}
