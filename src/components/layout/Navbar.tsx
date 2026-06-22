import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { useCartStore } from '@/stores/cartStore';
import { cn } from '@/lib/utils';

export function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-18 md:h-20 items-center justify-between py-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-11 w-11 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-soft group-hover:scale-105 transition-transform">
              <span className="font-display text-primary-foreground text-xl">ข</span>
            </div>
            <div className="leading-tight">
              <div className="font-display text-2xl text-foreground">Khanom House</div>
              <div className="text-[10px] text-muted-foreground tracking-widest uppercase">ขนมไทยโฮมเมด</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              หน้าแรก
            </Link>
            <Link to="/products" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              เมนูขนม
            </Link>
            <Link to="/products" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              เซ็ตของขวัญ
            </Link>
            {isAdmin && (
              <Link to="/admin" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
                จัดการร้าน
              </Link>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="relative rounded-full" asChild>
              <Link to="/cart">
                <ShoppingCart className="h-5 w-5" />
                {getTotalItems() > 0 && (
                  <Badge className="absolute -top-0.5 -right-0.5 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-primary">
                    {getTotalItems()}
                  </Badge>
                )}
              </Link>
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-2xl">
                  <DropdownMenuItem className="text-muted-foreground text-xs">
                    {user.email}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      จัดการร้าน
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    ออกจากระบบ
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button size="sm" asChild className="rounded-full px-5 ml-2 shadow-soft">
                <Link to="/auth">เข้าสู่ระบบ</Link>
              </Button>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-full"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        <div className={cn(
          'md:hidden overflow-hidden transition-all duration-300',
          mobileMenuOpen ? 'max-h-60 pb-4' : 'max-h-0'
        )}>
          <div className="flex flex-col gap-1 pt-2">
            {[
              { to: '/', label: 'หน้าแรก' },
              { to: '/products', label: 'เมนูขนม' },
              { to: '/products', label: 'เซ็ตของขวัญ' },
              ...(isAdmin ? [{ to: '/admin', label: 'จัดการร้าน' }] : []),
            ].map((it) => (
              <Link
                key={it.label}
                to={it.to}
                className="px-4 py-3 rounded-xl hover:bg-muted transition-colors text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                {it.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
