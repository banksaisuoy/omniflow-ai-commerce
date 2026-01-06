import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Loader2,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Lightbulb,
  RefreshCw
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AIForecastPanelProps {
  salesData: any[];
}

interface ForecastResult {
  forecast?: number[];
  trend?: string;
  confidence?: number;
  insights?: string[];
  recommendations?: string[];
}

interface TrendResult {
  peakHours?: number[];
  peakDays?: string[];
  seasonalTrends?: string;
  categoryPerformance?: string;
  growthRate?: number;
}

const chartConfig = {
  actual: {
    label: "ยอดจริง",
    color: "hsl(var(--chart-1))",
  },
  forecast: {
    label: "พยากรณ์",
    color: "hsl(var(--chart-2))",
  },
};

export function AIForecastPanel({ salesData }: AIForecastPanelProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [forecastResult, setForecastResult] = useState<ForecastResult | null>(null);
  const [trendResult, setTrendResult] = useState<TrendResult | null>(null);
  const [activeTab, setActiveTab] = useState('forecast');

  const runForecast = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-forecast', {
        body: {
          salesData: salesData.slice(-14), // Last 14 days
          type: 'sales_forecast'
        }
      });

      if (error) throw error;
      setForecastResult(data);
      toast.success('วิเคราะห์เสร็จสมบูรณ์!');
    } catch (error: any) {
      console.error('Forecast error:', error);
      toast.error(error.message || 'เกิดข้อผิดพลาดในการวิเคราะห์');
    } finally {
      setIsLoading(false);
    }
  };

  const runTrendAnalysis = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-forecast', {
        body: {
          salesData,
          type: 'trend_analysis'
        }
      });

      if (error) throw error;
      setTrendResult(data);
      toast.success('วิเคราะห์เทรนด์เสร็จสมบูรณ์!');
    } catch (error: any) {
      console.error('Trend analysis error:', error);
      toast.error(error.message || 'เกิดข้อผิดพลาดในการวิเคราะห์');
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare forecast chart data
  const getForecastChartData = () => {
    if (!forecastResult?.forecast) return salesData.slice(-7);
    
    const last7Days = salesData.slice(-7);
    const forecastData = forecastResult.forecast.map((value, index) => {
      const date = new Date();
      date.setDate(date.getDate() + index + 1);
      return {
        displayDate: date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }),
        forecast: value,
        isForecast: true,
      };
    });

    return [
      ...last7Days.map(d => ({ ...d, actual: d.revenue })),
      ...forecastData
    ];
  };

  const getTrendIcon = (trend?: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="h-5 w-5 text-success" />;
      case 'decreasing':
        return <TrendingDown className="h-5 w-5 text-destructive" />;
      default:
        return <Minus className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getTrendText = (trend?: string) => {
    switch (trend) {
      case 'increasing':
        return 'ขาขึ้น';
      case 'decreasing':
        return 'ขาลง';
      default:
        return 'ทรงตัว';
    }
  };

  return (
    <Card className="glass border-border/50 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/20">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="flex items-center gap-2">
                AI Forecasting & Insights
                <Sparkles className="h-4 w-4 text-accent animate-pulse" />
              </CardTitle>
              <CardDescription>
                วิเคราะห์และพยากรณ์ยอดขายด้วย AI
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="forecast">📈 พยากรณ์ยอดขาย</TabsTrigger>
            <TabsTrigger value="trends">🔍 วิเคราะห์เทรนด์</TabsTrigger>
          </TabsList>

          <TabsContent value="forecast" className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                พยากรณ์ยอดขาย 7 วันข้างหน้าด้วย AI
              </p>
              <Button onClick={runForecast} disabled={isLoading} className="gap-2">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Brain className="h-4 w-4" />
                )}
                วิเคราะห์
              </Button>
            </div>

            {forecastResult && (
              <div className="space-y-6">
                {/* Forecast Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      {getTrendIcon(forecastResult.trend)}
                      <span className="text-sm font-medium">แนวโน้ม</span>
                    </div>
                    <p className="text-lg font-bold">{getTrendText(forecastResult.trend)}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                      <span className="text-sm font-medium">ความมั่นใจ</span>
                    </div>
                    <p className="text-lg font-bold">{forecastResult.confidence}%</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">ยอดพยากรณ์</span>
                    </div>
                    <p className="text-lg font-bold">
                      ฿{(forecastResult.forecast?.reduce((a, b) => a + b, 0) || 0).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Forecast Chart */}
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                  <LineChart data={getForecastChartData()} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis 
                      dataKey="displayDate" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `฿${(value / 1000).toFixed(0)}k`}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="actual"
                      stroke="hsl(var(--chart-1))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--chart-1))' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="forecast"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: 'hsl(var(--chart-2))' }}
                    />
                  </LineChart>
                </ChartContainer>

                {/* Insights */}
                {forecastResult.insights && forecastResult.insights.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-accent" />
                      AI Insights
                    </h4>
                    <div className="space-y-2">
                      {forecastResult.insights.map((insight, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 rounded-lg bg-muted/50">
                          <CheckCircle2 className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                          <p className="text-sm">{insight}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recommendations */}
                {forecastResult.recommendations && forecastResult.recommendations.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      คำแนะนำ
                    </h4>
                    <div className="space-y-2">
                      {forecastResult.recommendations.map((rec, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                          <span className="text-primary font-bold">{index + 1}.</span>
                          <p className="text-sm">{rec}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!forecastResult && !isLoading && (
              <div className="text-center py-12 text-muted-foreground">
                <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>กดปุ่ม "วิเคราะห์" เพื่อให้ AI พยากรณ์ยอดขาย</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                วิเคราะห์รูปแบบและเทรนด์การขาย
              </p>
              <Button onClick={runTrendAnalysis} disabled={isLoading} className="gap-2">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Brain className="h-4 w-4" />
                )}
                วิเคราะห์เทรนด์
              </Button>
            </div>

            {trendResult && (
              <div className="grid gap-4 md:grid-cols-2">
                {trendResult.peakDays && (
                  <div className="p-4 rounded-lg bg-muted/50">
                    <h4 className="font-semibold mb-2">📅 วันที่ขายดี</h4>
                    <div className="flex flex-wrap gap-2">
                      {trendResult.peakDays.map((day, index) => (
                        <Badge key={index} variant="secondary">{day}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {trendResult.growthRate !== undefined && (
                  <div className="p-4 rounded-lg bg-muted/50">
                    <h4 className="font-semibold mb-2">📈 อัตราการเติบโต</h4>
                    <p className={`text-2xl font-bold ${trendResult.growthRate >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {trendResult.growthRate >= 0 ? '+' : ''}{trendResult.growthRate.toFixed(1)}%
                    </p>
                  </div>
                )}

                {trendResult.seasonalTrends && (
                  <div className="p-4 rounded-lg bg-muted/50 md:col-span-2">
                    <h4 className="font-semibold mb-2">🌸 แนวโน้มตามฤดูกาล</h4>
                    <p className="text-sm text-muted-foreground">{trendResult.seasonalTrends}</p>
                  </div>
                )}

                {trendResult.categoryPerformance && (
                  <div className="p-4 rounded-lg bg-muted/50 md:col-span-2">
                    <h4 className="font-semibold mb-2">📊 ประสิทธิภาพตามหมวดหมู่</h4>
                    <p className="text-sm text-muted-foreground">{trendResult.categoryPerformance}</p>
                  </div>
                )}
              </div>
            )}

            {!trendResult && !isLoading && (
              <div className="text-center py-12 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>กดปุ่ม "วิเคราะห์เทรนด์" เพื่อดูรูปแบบการขาย</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
