import POS from './pos/POS';
import ShiftManager from './pos/ShiftManager';
import POSTransactions from './pos/POSTransactions';
import AdminInventorySync from './AdminInventorySync';
import { PRODUCT_PUBLIC_FIELDS } from '@/lib/productFields';

interface DashboardStats {
    if (currentPath === '/admin/pos') return <POS />;
    if (currentPath === '/admin/pos/shift') return <ShiftManager />;
    if (currentPath === '/admin/pos/transactions') return <POSTransactions />;
    if (currentPath === '/admin/inventory-sync') return <AdminInventorySync />;
    if (currentPath === '/admin/products') return <AdminProducts />;
    if (currentPath === '/admin/upload') return <AdminUpload />;
    if (currentPath === '/admin/orders') return <AdminOrders />;