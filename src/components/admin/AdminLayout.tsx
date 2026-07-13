import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  Users, 
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Store,
  Upload,
  Star,
  Brain,
  Receipt,
  ClipboardList,
  Cloud,
  Tag,
  FileText,
  Shield,
  Building2,
  ChefHat,
  Images
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Receipt, label: 'POS หน้าร้าน', path: '/admin/pos' },
  { icon: ClipboardList, label: 'จัดการกะ', path: '/admin/pos/shift' },
  { icon: Receipt, label: 'บิล POS', path: '/admin/pos/transactions' },
  { icon: Package, label: 'สินค้า', path: '/admin/products' },
  { icon: Upload, label: 'อัปโหลด AI', path: '/admin/upload' },
  { icon: ShoppingCart, label: 'คำสั่งซื้อ', path: '/admin/orders' },
  { icon: Users, label: 'ลูกค้า', path: '/admin/customers' },
  { icon: Star, label: 'รีวิว', path: '/admin/reviews' },
  { icon: Tag, label: 'คูปอง', path: '/admin/coupons' },
  { icon: FileText, label: 'บทความ', path: '/admin/blog' },
  { icon: BarChart3, label: 'รายงาน', path: '/admin/reports' },
  { icon: Brain, label: 'AI Insights', path: '/admin/ai-insights' },
  { icon: Cloud, label: 'Google Drive', path: '/admin/gdrive' },
  { icon: FileText, label: 'Accounting', path: '/admin/accounting' },
  { icon: Shield, label: 'Security & PDPA', path: '/admin/security' },
  { icon: Settings, label: 'ตั้งค่า', path: '/admin/settings' },
];

export function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 lg:relative lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-20 px-5 border-b border-sidebar-border">
            <Link to="/admin" className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-soft">
                <span className="font-display text-primary-foreground text-lg">ข</span>
              </div>
              <div className="leading-tight">
                <div className="font-display text-lg text-sidebar-foreground">Khanom House</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Admin</div>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 py-4">
            <nav className="px-3 space-y-1">
              {sidebarItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-soft"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border space-y-2">
            <Link to="/">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Store className="h-4 w-4" />
                ไปหน้าร้าน
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              ออกจากระบบ
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 border-b border-border flex items-center justify-between px-4 lg:px-6 bg-card/50 backdrop-blur-sm">
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          
          <div className="flex items-center gap-4 ml-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-success text-sm">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Real-time Active
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
