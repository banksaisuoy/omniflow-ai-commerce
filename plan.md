1. **Add new page `src/pages/Profile.tsx`**
   - Create a React component for the user profile settings page.
   - Use `react-hook-form` and `zod` for form validation (`full_name`, `phone`, `email`).
   - Use `@tanstack/react-query` to fetch the user's profile from the `profiles` table in Supabase.
   - Include theme toggling (using `next-themes`) and notification preference toggles.
   - Design with Tailwind CSS (cards, inputs, switches, buttons, responsive grid).

2. **Update routing in `src/App.tsx`**
   - Import `Profile` and add `<Route path="/profile" element={<Profile />} />`.

3. **Update navigation in `src/components/layout/Navbar.tsx`**
   - Add a "Profile" or "My Account" link to the user dropdown menu, using the existing `my_account` translation key.

4. **Add Translation Keys in `src/stores/i18nStore.ts`**
   - Add keys like `profile_settings`, `save_changes`, `notifications`, `theme_settings` for both `th` and `en`.

5. **Test and Verify**
   - Run type checking and tests to ensure no regressions.