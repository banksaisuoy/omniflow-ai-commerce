import { useProductUploaderStore } from '@/stores/productUploaderStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import DOMPurify from 'dompurify';

export function MagicProductUploader() {
  const [isSaving, setIsSaving] = useState(false);
        name: editedData.name,
        slug: `${slugBase}-${Date.now()}`,
        description: editedData.description_html?.replace(/<[^>]*>/g, ''),
        description_html: editedData.description_html ? DOMPurify.sanitize(editedData.description_html) : null,
        price: editedData.price_range?.suggested || 0,
        category: editedData.category,
        subcategory: editedData.subcategory,
