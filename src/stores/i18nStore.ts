import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Lang = 'th' | 'en';

const dict: Record<Lang, Record<string, string>> = {
  th: {
    home: 'หน้าแรก',
    products: 'สินค้า',
    blog: 'บทความ',
    track: 'ติดตามออเดอร์',
    loyalty: 'สะสมแต้ม',
    wishlist: 'รายการโปรด',
    cart: 'ตะกร้า',
    signin: 'เข้าสู่ระบบ',
    admin: 'จัดการร้าน',
  },
  en: {
    home: 'Home',
    products: 'Shop',
    blog: 'Blog',
    track: 'Track Order',
    loyalty: 'Loyalty',
    wishlist: 'Wishlist',
    cart: 'Cart',
    signin: 'Sign In',
    admin: 'Admin',
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
