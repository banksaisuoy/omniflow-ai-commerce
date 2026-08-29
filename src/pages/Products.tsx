import { useState } from 'react';
import { z } from 'zod';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const searchSchema = z.string().max(100, "คำค้นหายาวเกินไป");
    try {
      const validatedInput = searchSchema.parse(searchInput.trim());
      if (validatedInput) {
        setSearchParams({ q: validatedInput });
      } else {
        setSearchParams({});
      }
    } catch (err: any) {
      toast.error(err.errors?.[0]?.message || 'คำค้นหาไม่ถูกต้อง');
    }
  };

