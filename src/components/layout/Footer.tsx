import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, MapPin, Phone, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-muted py-12 border-t border-border mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-soft">
                <span className="font-display text-primary-foreground text-xl">ข</span>
              </div>
              <div className="leading-tight">
                <div className="font-display text-xl text-foreground">Khanom House</div>
                <div className="text-[10px] text-muted-foreground tracking-widest uppercase">ขนมไทยโฮมเมด</div>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground">
              ขนมไทยต้นตำรับ ทำสดใหม่ทุกวัน คัดสรรวัตถุดิบคุณภาพเพื่อความอร่อยและสุขภาพของคุณ
            </p>
            <div className="flex gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">เมนูแนะนำ</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/products" className="hover:text-primary transition-colors">ขนมชั้นใบเตย</Link></li>
              <li><Link to="/products" className="hover:text-primary transition-colors">ข้าวเหนียวมะม่วง</Link></li>
              <li><Link to="/products" className="hover:text-primary transition-colors">ทองหยิบ ทองหยอด</Link></li>
              <li><Link to="/products" className="hover:text-primary transition-colors">ลูกชุบ</Link></li>
            </ul>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold mb-4">เกี่ยวกับเรา</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-primary transition-colors">หน้าแรก</Link></li>
              <li><Link to="/products" className="hover:text-primary transition-colors">เมนูทั้งหมด</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">เรื่องราวของเรา</Link></li>
              <li><Link to="#" className="hover:text-primary transition-colors">ติดต่อเรา</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">ติดต่อ</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0" />
                <span>123 ถนนสุขุมวิท แขวงคลองเตย<br />เขตคลองเตย กรุงเทพฯ 10110</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <span>02-xxx-xxxx</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <span>contact@khanomhouse.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Khanom House. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
