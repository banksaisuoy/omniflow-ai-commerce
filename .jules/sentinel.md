## 2025-02-28 - Insecure CORS Configuration
**Vulnerability:** Edge Functions used a wildcard `Access-Control-Allow-Origin: "*"` which allowed any website to make requests on behalf of an authenticated user, leading to potential Cross-Site Request Forgery (CSRF)-like behavior, data leakage, and abuse of API quotas.
**Learning:** Always validate or restrict the origin of incoming requests. Wildcard CORS policies in authenticated endpoints bypass the Same-Origin Policy, exposing the application to cross-origin attacks.
**Prevention:** Use an environment variable like `ALLOWED_ORIGIN` to specify trusted domains, with a safe fallback (e.g., `http://localhost:8080` for development).
