import AdminUpload from './AdminUpload';
import AdminGDrive from './AdminGDrive';
import AdminCoupons from './AdminCoupons';
import AdminInventorySync from './AdminInventorySync';
import AdminBlog from './AdminBlog';
import AdminAccounting from './AdminAccounting';
import AdminSecurity from './AdminSecurity';
  ];

  const renderSubPage = () => {
    if (currentPath === '/admin/inventory-sync') return <AdminInventorySync />;
    if (currentPath === '/admin/pos') return <POS />;
    if (currentPath === '/admin/pos/shift') return <ShiftManager />;
    if (currentPath === '/admin/pos/transactions') return <POSTransactions />;