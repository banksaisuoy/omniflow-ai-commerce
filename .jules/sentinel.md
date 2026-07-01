## 2024-11-20 - [Hardcoded Supabase Credentials in .env]
**Vulnerability:** Supabase JWT publishable key (VITE_SUPABASE_PUBLISHABLE_KEY) was checked into git in the .env file.
**Learning:** Checking sensitive files into version control poses a significant security risk, as anyone with access to the repo can access these keys.
**Prevention:** Always add .env and .env.* to .gitignore. Create a .env.example file with dummy values for other developers to use as a template.
