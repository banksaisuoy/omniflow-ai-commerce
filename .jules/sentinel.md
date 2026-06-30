## 2026-06-30 - Fix broken authentication checks in edge functions
**Vulnerability:** Supabase Edge Functions (`analyze-product`, `ai-forecast`, `generate-embedding`) used an invalid method `supabase.auth.getClaims(token)` to verify the user from the Authorization header. Because the method does not exist on the JavaScript client, the auth check would crash or incorrectly handle unauthenticated requests.
**Learning:** Deno Edge Functions using the JavaScript `@supabase/supabase-js` client must use `supabase.auth.getUser(token)` to securely retrieve the user associated with a JWT, and extract the ID from `data.user.id`.
**Prevention:** Use standard and current Supabase JS methods (`getUser`) for JWT validation instead of assuming JWT contents can be read via non-existent API methods.
