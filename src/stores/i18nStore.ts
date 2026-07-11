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
    subtitle: 'ขนมไทยโฮมเมด',
    footer_desc: 'สืบสานความอร่อยของขนมไทยโบราณ ด้วยวัตถุดิบคุณภาพและสูตรลับที่ตกทอดจากรุ่นสู่รุ่น',
    shopping: 'ช้อปปิ้ง',
    all_products: 'เมนูขนมทั้งหมด',
    customer: 'ลูกค้า',
    my_account: 'บัญชีของฉัน',
    loyalty_system: 'ระบบสมาชิก',
    refer_friend: 'ชวนเพื่อนรับโบนัส',
    refer_friend_short: 'ชวนเพื่อน',
    contact_us: 'ติดต่อเรา',
    address: '123 ซอยขนมหวาน ถนนสุขุมวิท<br />กรุงเทพมหานคร 10110',
    phone: 'โทร: 02-123-4567',
    email: 'อีเมล: hello@khanomhouse.com',
    copyright: 'สงวนลิขสิทธิ์',
    privacy_policy: 'นโยบายความเป็นส่วนตัว',
    terms_of_service: 'เงื่อนไขการให้บริการ',
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
    subtitle: 'Homemade Thai Desserts',
    footer_desc: 'Preserving the deliciousness of traditional Thai desserts with quality ingredients and a secret recipe passed down from generation to generation.',
    shopping: 'Shopping',
    all_products: 'All Products',
    customer: 'Customer',
    my_account: 'My Account',
    loyalty_system: 'Loyalty System',
    refer_friend: 'Refer a Friend Bonus',
    refer_friend_short: 'Refer Friend',
    contact_us: 'Contact Us',
    address: '123 Dessert Alley, Sukhumvit Road<br />Bangkok 10110',
    phone: 'Tel: 02-123-4567',
    email: 'Email: hello@khanomhouse.com',
    copyright: 'All rights reserved.',
    privacy_policy: 'Privacy Policy',
    terms_of_service: 'Terms of Service',
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
