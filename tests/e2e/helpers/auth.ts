import { createClient } from "@supabase/supabase-js";
import { request } from "@playwright/test";

export const getSupabaseUrl = () => process.env.SUPABASE_URL || "http://127.0.0.1:54321";
export const getSupabaseKey = () => process.env.SUPABASE_KEY || "sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH";

export const authClient = createClient(getSupabaseUrl(), getSupabaseKey(), {
  auth: { autoRefreshToken: false, persistSession: false },
});

export async function createTestUser() {
  const email = `testuser_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`;
  const password = "password123";

  // Create user in Supabase
  const { data, error } = await authClient.auth.signUp({ email, password });
  if (error) throw new Error("Failed to create test user: " + error.message);
  
  // Create an API request context
  const apiContext = await request.newContext({
    baseURL: 'http://localhost:4321',
  });

  // Call the Astro signin route to populate cookies in the context
  await apiContext.post('/api/auth/signin', {
    headers: {
      'Origin': 'http://localhost:4321',
    },
    form: { email, password },
    maxRedirects: 0,
  });

  return { user: data.user!, email, password, apiContext };
}
