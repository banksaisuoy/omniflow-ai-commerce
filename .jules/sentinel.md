## $(date +%Y-%m-%d) - [CRITICAL/HIGH] Fix overly permissive CORS configuration
**Vulnerability:** The `supabase/functions/_shared/cors.ts` configuration used `Access-Control-Allow-Origin: "*"` which allowed any website to make requests to the Edge Functions, potentially leading to unauthorized data access or CSRF-like attacks.
**Learning:** Shared security configuration files like `cors.ts` dictate the security posture of multiple API endpoints (e.g. AI Chat, visual search).
**Prevention:** Always use environment variables (e.g., `Deno.env.get("CORS_ORIGIN")`) coupled with safe fallbacks (e.g., `http://localhost:5173` for development) instead of `"*"` to properly restrict allowed origins for API calls.
