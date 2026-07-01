import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { useLoyalty, TIER_INFO } from '@/hooks/useLoyalty';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Gift, TrendingUp, Crown } from 'lucide-react';

export default function Loyalty() {
  const { user, loading } = useAuth();
  const { account, transactions, tier, info, progress } = useLoyalty();

  if (!loading && !user) return <Navigate to="/auth" replace />;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <div className="text-center mb-8">
          <Sparkles className="h-10 w-10 mx-auto text-primary mb-3" />
          <h1 className="font-display text-4xl mb-2">Khanom Rewards</h1>
          <p className="text-muted-foreground">สะสมแต้ม แลกส่วนลด รับสิทธิพิเศษระดับ VIP</p>
        </div>

        <Card className={`bg-gradient-to-br ${info.color} text-white border-none rounded-3xl overflow-hidden mb-6`}>
          <CardContent className="p-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm opacity-80">ระดับปัจจุบัน</div>
                <div className="font-display text-4xl flex items-center gap-2">
                  <Crown className="h-8 w-8" /> {info.label}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm opacity-80">แต้มคงเหลือ</div>
                <div className="font-display text-4xl">{account?.points_balance ?? 0}</div>
              </div>
            </div>
            <div className="text-sm opacity-90 mb-2">สะสม {account?.lifetime_points ?? 0} แต้มตลอดชีพ</div>
            {info.next !== Infinity && (
              <>
                <Progress value={progress} className="h-2 bg-white/20" />
                <div className="text-xs mt-2 opacity-80">อีก {info.next - (account?.lifetime_points ?? 0)} แต้ม → tier ถัดไป</div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {Object.entries(TIER_INFO).map(([k, v]) => (
            <Card key={k} className={`rounded-2xl ${tier === k ? 'ring-2 ring-primary' : ''}`}>
              <CardContent className="p-4">
                <Badge className={`bg-gradient-to-r ${v.color} text-white border-none mb-2`}>{v.label}</Badge>
                <p className="text-xs text-muted-foreground">{v.perk}</p>
                <p className="text-xs mt-2">ต้องมี {v.min.toLocaleString()} แต้ม</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> ประวัติแต้ม</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">ยังไม่มีรายการ — ซื้อสินค้ารับแต้มทันที!</p>
            ) : (
              <div className="space-y-2">
                {transactions.map((t: any) => (
                  <div key={t.id} className="flex justify-between items-center p-3 rounded-xl bg-muted/50">
                    <div>
                      <div className="text-sm font-medium">{t.description ?? t.source}</div>
                      <div className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleDateString('th-TH')}</div>
                    </div>
                    <div className={`font-display text-lg ${t.points > 0 ? 'text-success' : 'text-destructive'}`}>
                      {t.points > 0 ? '+' : ''}{t.points}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
