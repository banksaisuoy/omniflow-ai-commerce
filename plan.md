1. **Create the `AdminInventory.tsx` file:**
   - Create `src/pages/admin/AdminInventory.tsx` with a basic inventory management component structure using `lucide-react` icons and Shadcn UI components.
   - Implement fetching from the `inventory` table using Supabase.
2. **Update `AdminDashboard.tsx`:**
   - Add the import for `AdminInventory` in `src/pages/admin/AdminDashboard.tsx`.
   - Add `if (currentPath === '/admin/inventory') return <AdminInventory />;` to the `renderSubPage` function.
3. **Update `AdminLayout.tsx`:**
   - Add `{ icon: PackageCheck, label: 'สต๊อกสินค้า (Inventory)', path: '/admin/inventory' }` to the `sidebarItems` array in `src/components/admin/AdminLayout.tsx`.
4. **Pre-commit checks:**
   - Run `pre_commit_instructions` and execute the returned checks.
5. **Submit:**
   - Submit the branch with the new inventory feature.