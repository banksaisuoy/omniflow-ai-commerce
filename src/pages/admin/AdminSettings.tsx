import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Settings, Store, Bell, Shield } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSettings() {
  const { user } = useAuth();
  const [storeName, setStoreName] = useState('OmniFlow Store');
  const [storeEmail, setStoreEmail] = useState(user?.email || '');
  const [notifications, setNotifications] = useState(true);
  const [autoApproveReviews, setAutoApproveReviews] = useState(false);

  const handleSave = () => {
    toast.success('บันทึกการตั้งค่าแล้ว');
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-3xl font-bold gradient-text">ตั้งค่า</h1>
        <p className="text-muted-foreground mt-1">จัดการการตั้งค่าร้านค้า</p>
      </div>

      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Store className="h-5 w-5" /> ข้อมูลร้านค้า</CardTitle>
          <CardDescription>ตั้งค่าข้อมูลทั่วไปของร้านค้า</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>ชื่อร้านค้า</Label>
            <Input value={storeName} onChange={e => setStoreName(e.target.value)} className="mt-1" />
          </div>
          <div>
            <Label>อีเมลร้านค้า</Label>
            <Input value={storeEmail} onChange={e => setStoreEmail(e.target.value)} className="mt-1" />
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" /> การแจ้งเตือน</CardTitle>
          <CardDescription>ตั้งค่าการแจ้งเตือนต่างๆ</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label>แจ้งเตือนออเดอร์ใหม่</Label>
              <p className="text-sm text-muted-foreground">รับแจ้งเตือนเมื่อมีออเดอร์เข้ามา</p>
            </div>
            <Switch checked={notifications} onCheckedChange={setNotifications} />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Label>อนุมัติรีวิวอัตโนมัติ</Label>
              <p className="text-sm text-muted-foreground">อนุมัติรีวิวที่ AI ตรวจแล้วว่า positive</p>
            </div>
            <Switch checked={autoApproveReviews} onCheckedChange={setAutoApproveReviews} />
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> ความปลอดภัย</CardTitle>
          <CardDescription>ข้อมูลบัญชีและความปลอดภัย</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>อีเมลผู้ดูแลระบบ</Label>
            <Input value={user?.email || ''} disabled className="mt-1" />
          </div>
          <div>
            <Label>รหัส User ID</Label>
            <Input value={user?.id || ''} disabled className="mt-1 font-mono text-xs" />
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="w-full">บันทึกการตั้งค่า</Button>
    </div>
  );
}
