## 2024-05-24 - Edge Function JWT Authentication Fix
**Vulnerability:** Supabase Edge Functions (`ai-forecast`, `analyze-product`, `generate-embedding`) were attempting to validate JWTs using the non-existent `supabase.auth.getClaims` method from `@supabase/supabase-js@2`, leading to unhandled 500 errors or bypassed authentication if error checks were mishandled.
**Learning:** In the `@supabase/supabase-js` v2 library, JWT validation must be done using `await supabase.auth.getUser(token)`, which correctly verifies the token against the Supabase Auth service and returns the verified user data. Methods like `getClaims` are not valid and fail silently or throw unhandled exceptions.
**Prevention:** Always use `getUser(token)` for secure server-side JWT verification. Never assume the presence of undocumented auth methods. When accessing the user ID after validation, correctly reference `data.user.id`.

## 2024-05-24 - Weak Random Number Generation
**Vulnerability:** The `Math.random()` function was used for generating gift card codes in `src/pages/GiftCards.tsx`. `Math.random()` is not cryptographically secure and could allow an attacker to predict codes, leading to potential theft of funds or creation of counterfeit cards.
**Learning:** For sensitive data like gift card codes, secure tokens, or passwords, always use a cryptographically secure random number generator (CSPRNG). In the browser environment, this is `crypto.getRandomValues()`.
**Prevention:** Never use `Math.random()` to generate any security-sensitive value, token, or code. Always use `crypto.getRandomValues()` or a reliable library (e.g. `uuid`, `nanoid`) that utilizes CSPRNG under the hood.

## 2024-05-25 - Authentication Token Leakage Fix
**Vulnerability:** The `MagicProductUploader.tsx` frontend component was sending the Supabase Publishable Key (`VITE_SUPABASE_PUBLISHABLE_KEY`) as a Bearer token to the `analyze-product` Edge Function.
**Learning:** Sending a publishable key as an authentication token compromises security and breaks Edge Functions that strictly expect a valid user session JWT.
**Prevention:** Always verify that API requests to authenticated endpoints include the correct user session token retrieved via `supabase.auth.getSession()` or similar methods, not environment variables.
