import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, LayoutDashboard, Menu, X, Heart, Sparkles, Gift, Users } from 'lucide-react';

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
import { CartSheet } from '@/components/cart/CartSheet';
import { useI18n } from '@/stores/i18nStore';
import { ThemeToggle } from './ThemeToggle';
import { GlobalSearch } from './GlobalSearch';

function LangToggle() {
  const { lang, setLang } = useI18n();
  return (
    <button
      onClick={() => setLang(lang === 'th' ? 'en' : 'th')}
      className="px-2 py-1 text-xs font-semibold rounded-full border border-border hover:bg-accent transition"
      aria-label="Toggle language"
    >
      {lang.toUpperCase()}
    </button>
  );
}

export function Navbar() {
  const { user, isAdmin, signOut } = useAuth();
  const getTotalItems = useCartStore((state) => state.getTotalItems);
  const navigate = useNavigate();
  const { t } = useI18n();
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
              <div className="text-[10px] text-muted-foreground tracking-widest uppercase">{t('subtitle')}</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              {t('home')}
            </Link>
            <Link to="/products" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              {t('products')}
            </Link>
            <Link to="/bundles" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              {t('bundles')}
            </Link>
            <Link to="/gift-cards" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              {t('gift_cards')}
            </Link>
            <Link to="/loyalty" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              {t('rewards')}
            </Link>
            <Link to="/blog" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              {t('blog')}
            </Link>
            <Link to="/track" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
              {t('track')}
            </Link>
            <Link to="/visual-search" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              {t('visual_search')}
            </Link>
            <Link to="/concierge" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              {t('ai_concierge')}
            </Link>


            {isAdmin && (
              <Link to="/admin" className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors">
                {t('admin')}
              </Link>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <GlobalSearch />
            <ThemeToggle />
            <LangToggle />
            {user && (
              <Button variant="ghost" size="icon" className="rounded-full hidden md:inline-flex" asChild>
                <Link to="/wishlist"><Heart className="h-5 w-5" /></Link>
              </Button>
            )}
            <CartSheet>
              <Button variant="ghost" size="icon" className="relative rounded-full">
                <ShoppingCart className="h-5 w-5" />
                {getTotalItems() > 0 && (
                  <Badge className="absolute -top-0.5 -right-0.5 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-primary">
                    {getTotalItems()}
                  </Badge>
                )}
              </Button>
            </CartSheet>


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
                  <DropdownMenuItem onClick={() => navigate('/profile')}><User className="mr-2 h-4 w-4" />{t('profile')}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/loyalty')}><Sparkles className="mr-2 h-4 w-4" />{t('rewards')}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/wishlist')}><Heart className="mr-2 h-4 w-4" />{t('wishlist')}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/referral')}><Users className="mr-2 h-4 w-4" />{t('refer_friend_short')}</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/gift-cards')}><Gift className="mr-2 h-4 w-4" />{t('gift_cards')}</DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      {t('admin')}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    {t('signout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>

              </DropdownMenu>
            ) : (
              <Button size="sm" asChild className="rounded-full px-5 ml-2 shadow-soft">
                <Link to="/auth">{t('signin')}</Link>
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
              { to: '/', label: t('home') },
              { to: '/products', label: t('products') },
              { to: '/bundles', label: t('bundles') },
              { to: '/concierge', label: t('ai_concierge') },
              ...(isAdmin ? [{ to: '/admin', label: t('admin') }] : []),
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