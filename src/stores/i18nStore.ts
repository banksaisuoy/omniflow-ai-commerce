import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Lang = 'th' | 'en';

const dict: Record<Lang, Record<string, string>> = {
  th: {
    home: 'หน้าแรก',
    products: 'เมนูขนม',
    bundles: 'เซ็ตของขวัญ',
    gift_cards: 'บัตรของขวัญ',
    rewards: 'Rewards',
    blog: 'บทความ',
    track: 'ติดตามคำสั่งซื้อ',
    ai_concierge: 'AI แนะนำ',
    visual_search: 'ค้นด้วยรูป',
    loyalty: 'สะสมแต้ม',
    wishlist: 'รายการโปรด',
    cart: 'ตะกร้า',
    signin: 'เข้าสู่ระบบ',
    signout: 'ออกจากระบบ',
    admin: 'จัดการร้าน',
    search_placeholder: 'ค้นหาสินค้า...',
    voice_search: 'ค้นด้วยเสียง',
  },
  en: {
    home: 'Home',
    products: 'Shop',
    bundles: 'Gift Sets',
    gift_cards: 'Gift Cards',
    rewards: 'Rewards',
    blog: 'Blog',
    track: 'Track Order',
    ai_concierge: 'AI Concierge',
    visual_search: 'Visual Search',
    loyalty: 'Loyalty',
    wishlist: 'Wishlist',
    cart: 'Cart',
    signin: 'Sign In',
    signout: 'Sign Out',
    admin: 'Admin',
    search_placeholder: 'Search products...',
    voice_search: 'Voice search',
  },
};

interface I18nState {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string) => string;
}

export const useI18n = create<I18nState>()(
  persist(
    (set, get) => ({
      lang: 'th',
      setLang: (lang) => set({ lang }),
      t: (key) => dict[get().lang][key] ?? key,
    }),
    { name: 'kh-lang' }
  )
);
