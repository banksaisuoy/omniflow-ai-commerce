## 2024-05-30 - Fix Supabase Edge Function JWT Validation
**Vulnerability:** The Edge Functions used `getClaims(token)`, which doesn't exist, leading to either failed auth or insecure behavior.
**Learning:** Supabase JS client doesn't have `getClaims` method on auth. `getUser(token)` must be used for securely verifying JWTs.
**Prevention:** Always verify Supabase client methods in documentation, specifically for Auth checks which are critical.
