import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import DOMPurify from 'dompurify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
          {
            method,
            amount: payAmount,
            ref_no: refNo ? DOMPurify.sanitize(refNo.trim()) : null,
            change_amount: change,
          },
        ],
