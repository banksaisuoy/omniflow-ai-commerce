import POS from './pos/POS';
import ShiftManager from './pos/ShiftManager';
import POSTransactions from './pos/POSTransactions';
import AdminInventory from './AdminInventory';
import { PRODUCT_PUBLIC_FIELDS } from '@/lib/productFields';

interface DashboardStats {
    if (currentPath === '/admin/recipes') return <AdminRecipes />;
    if (currentPath === '/admin/ugc') return <AdminUGC />;
    if (currentPath === '/admin/settings') return <AdminSettings />;
    if (currentPath === '/admin/inventory') return <AdminInventory />;
    return null;
  };
