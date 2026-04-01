import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig } from "@/lib/supabase/public-env";

/**
 * Browser Supabase client (singleton per tab).
 */
let browserClient: SupabaseClient | undefined;
let cachedConfigSignature: string | undefined;

export function getSupabaseBrowserClient(): SupabaseClient {
  let url: string;
  let apiKey: string;
  try {
    const config = getSupabasePublicConfig();
    url = config.url;
    apiKey = config.apiKey;
  } catch (err) {
    browserClient = undefined;
    cachedConfigSignature = undefined;
    throw err;
  }
  const signature: string = `${url}\0${apiKey}`;
  if (browserClient && cachedConfigSignature === signature) {
    return browserClient;
  }
  browserClient = createBrowserClient(url, apiKey);
  cachedConfigSignature = signature;
  return browserClient;
}
