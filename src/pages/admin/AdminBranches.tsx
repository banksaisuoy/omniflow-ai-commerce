import { z } from 'zod';
import { toast } from 'sonner';

export default function AdminBranches() {
  const saveBranch = async (form: any) => {
    setSaving(true);
    
    // React JSX auto-escapes HTML variables, preventing XSS without manual entity replacement.
    // And supabase auto parameterizes inputs.
    
    try {
      const branchSchema = z.object({
        name: z.string().min(1, 'ระบุชื่อสาขา').max(100, 'ชื่อสาขายาวเกินไป (สูงสุด 100 ตัวอักษร)'),
        code: z.string().min(1, 'ระบุรหัสสาขา').max(50, 'รหัสสาขายาวเกินไป (สูงสุด 50 ตัวอักษร)').regex(/^[A-Za-z0-9_-]+$/, 'รหัสสาขาต้องประกอบด้วยตัวอักษร ตัวเลข หรือเครื่องหมาย - _ เท่านั้น'),
      });
      branchSchema.parse({ name: form.name.trim(), code: form.code.trim() });
    } catch (err: any) {
      setSaving(false);
      if (err instanceof z.ZodError) {
        return toast.error(err.errors[0].message);
      }
      return toast.error('ข้อมูลไม่ถูกต้อง');
    }

    const sanitizedName = form.name.trim();
    const sanitizedCode = form.code.trim();
    
    const { error } = await supabase.from('branches' as any).insert({ ...form, name: sanitizedName, code: sanitizedCode } as any);
    setSaving(false);
  };
}
