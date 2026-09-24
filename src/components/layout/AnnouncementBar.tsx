import { useState, useEffect } from 'react';
import { X, Sparkles } from 'lucide-react';
import { useI18n } from '@/stores/i18nStore';

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem('announcement-dismissed')) {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    sessionStorage.setItem('announcement-dismissed', 'true');
    setIsVisible(false);
  };
  const { t } = useI18n();

  if (!isVisible) return null;

  return (
    <div className="bg-primary text-primary-foreground py-2 px-4 relative z-50">
      <div className="container mx-auto flex items-center justify-center text-sm font-medium">
        <Sparkles className="h-4 w-4 mr-2" />
        <span>{t('announcement_text')}</span>
      </div>
      <button
        onClick={handleClose}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-primary-foreground/20 rounded-full transition-colors"
        aria-label="Close announcement"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
