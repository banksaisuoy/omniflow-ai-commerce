import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Mock data for inventory sync
const MOCK_SYNC_LOGS = [
  { id: '1', product: 'Vitamin C Serum', status: 'success', time: '10 mins ago', source: 'Lazada', quantity: 45 },
  { id: '2', product: 'Hydrating Cleanser', status: 'success', time: '15 mins ago', source: 'Shopee', quantity: 120 },
  { id: '3', product: 'Sunscreen SPF 50', status: 'error', time: '1 hour ago', source: 'Line Shopping', quantity: 0 },
  { id: '4', product: 'Night Cream', status: 'success', time: '2 hours ago', source: 'TikTok Shop', quantity: 30 },
  { id: '5', product: 'Acne Patch', status: 'pending', time: 'Just now', source: 'Lazada', quantity: 200 },
];

export default function AdminInventorySync() {
  const [logs, setLogs] = useState(MOCK_SYNC_LOGS);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSync, setLastSync] = useState(new Date());

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastSync(new Date());
      setIsRefreshing(false);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Inventory Sync</h1>
          <p className="text-muted-foreground mt-1">
            Real-time monitoring of multi-channel inventory synchronization
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Last sync: {lastSync.toLocaleTimeString()}
          </div>
          <Button onClick={handleRefresh} disabled={isRefreshing} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Sync Now
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sync Events (24h)</CardTitle>
            <Cloud className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,248</div>
            <p className="text-xs text-muted-foreground">+12% from yesterday</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">99.2%</div>
            <p className="text-xs text-muted-foreground">Target: 99.9%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Syncs</CardTitle>
            <Cloud className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">12</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Synchronization Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Channel</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-medium">{log.product}</TableCell>
                  <TableCell>{log.source}</TableCell>
                  <TableCell>{log.quantity}</TableCell>
                  <TableCell>
                    <Badge variant={
                      log.status === 'success' ? 'default' : 
                      log.status === 'error' ? 'destructive' : 'secondary'
                    }>
                      {log.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{log.time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
