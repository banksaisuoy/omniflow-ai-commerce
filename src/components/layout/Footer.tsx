import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useI18n } from '@/stores/i18nStore';

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-border/60 bg-muted/30">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">

          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-3 group mb-4">
              <div className="h-10 w-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-soft group-hover:scale-105 transition-transform">
                <span className="font-display text-primary-foreground text-lg">ข</span>
              </div>
              <div className="leading-tight">
                <div className="font-display text-xl text-foreground">Khanom House</div>
                <div className="text-[9px] text-muted-foreground tracking-widest uppercase">{t('subtitle')}</div>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">
              {t('footer_desc')}
            </p>
            <div className="flex gap-4">
              <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 hover:bg-primary/10 hover:text-primary">
                <Facebook className="h-4 w-4" />
                <span className="sr-only">Facebook</span>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 hover:bg-primary/10 hover:text-primary">
                <Instagram className="h-4 w-4" />
                <span className="sr-only">Instagram</span>
              </Button>
              <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 hover:bg-primary/10 hover:text-primary">
                <Twitter className="h-4 w-4" />
                <span className="sr-only">Twitter</span>
              </Button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">{t('shopping')}</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/products" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('all_products')}
                </Link>
              </li>
              <li>
                <Link to="/bundles" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('bundles')}
                </Link>
              </li>
              <li>
                <Link to="/gift-cards" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('gift_cards')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">{t('customer')}</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/auth" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('my_account')}
                </Link>
              </li>
              <li>
                <Link to="/loyalty" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('loyalty_system')}
                </Link>
              </li>
              <li>
                <Link to="/referral" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {t('refer_friend')}
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4 text-foreground">{t('contact_us')}</h3>
            <ul className="space-y-3">
              <li className="text-sm text-muted-foreground" dangerouslySetInnerHTML={{ __html: t('address') }}>
              </li>
              <li className="text-sm text-muted-foreground">
                {t('phone')}
              </li>
              <li className="text-sm text-muted-foreground">
                {t('email')}
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/40 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Khanom House. {t('copyright')}
          </p>
          <div className="flex gap-6">
            <Link to="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              {t('privacy_policy')}
            </Link>
            <Link to="#" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              {t('terms_of_service')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
