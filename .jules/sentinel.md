## 2024-07-01 - Fix overly permissive CORS policy in Edge Functions
**Vulnerability:** The Edge Functions (`ai-forecast`, `analyze-product`, `generate-embedding`) configured `Access-Control-Allow-Origin: *`, allowing any origin to make cross-origin requests to these APIs.
**Learning:** Using `*` for CORS origins is insecure as it opens up the API to cross-site request forgery and data leakage if not strictly controlled via authentication. Edge functions should restrict allowed origins using environment variables.
**Prevention:** Always restrict `Access-Control-Allow-Origin` to known trusted origins, preferably loaded from environment configurations, rather than using the wildcard `*`.
