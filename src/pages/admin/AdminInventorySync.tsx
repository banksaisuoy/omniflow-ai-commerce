import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, CheckCircle2, XCircle, AlertTriangle, Activity, Database, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminInventorySync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date>(new Date(Date.now() - 5 * 60000)); // 5 mins ago
  const [syncStatus, setSyncStatus] = useState<'success' | 'error' | 'syncing' | 'idle'>('idle');
  const [logs, setLogs] = useState([
    { id: 1, time: new Date(Date.now() - 5 * 60000), status: 'success', message: 'Auto-sync completed successfully (124 items updated)' },
    { id: 2, time: new Date(Date.now() - 65 * 60000), status: 'success', message: 'Auto-sync completed successfully (12 items updated)' },
    { id: 3, time: new Date(Date.now() - 125 * 60000), status: 'warning', message: 'Auto-sync completed with warnings (2 items skipped)' },
    { id: 4, time: new Date(Date.now() - 185 * 60000), status: 'error', message: 'Sync failed: Connection timeout' },
  ]);

  const handleManualSync = () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    setSyncStatus('syncing');
    
    const newLogId = logs.length + 1;
    const startTime = new Date();
    
    setLogs(prev => [
      { id: newLogId, time: startTime, status: 'info', message: 'Manual sync started...' },
      ...prev
    ]);
    
    setTimeout(() => {
      setIsSyncing(false);
      setSyncStatus('success');
      setLastSync(new Date());
      toast.success('Inventory sync completed successfully');
      
      setLogs(prev => [
        { id: newLogId + 1, time: new Date(), status: 'success', message: 'Manual sync completed successfully (45 items updated)' },
        ...prev.map(log => log.id === newLogId ? { ...log, status: 'success', message: 'Manual sync completed' } : log)
      ]);
      
      setTimeout(() => setSyncStatus('idle'), 3000);
    }, 2500);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="default" className="bg-success text-success-foreground"><CheckCircle2 className="h-3 w-3 mr-1" /> Success</Badge>;
      case 'error':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" /> Failed</Badge>;
      case 'warning':
        return <Badge variant="outline" className="text-warning border-warning"><AlertTriangle className="h-3 w-3 mr-1" /> Warning</Badge>;
      case 'syncing':
      case 'info':
        return <Badge variant="secondary"><RefreshCw className="h-3 w-3 mr-1 animate-spin" /> Syncing</Badge>;
      default:
        return <Badge variant="secondary">Idle</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Inventory Sync</h1>
          <p className="text-muted-foreground mt-1">
            Real-time monitoring for multi-channel inventory synchronization
          </p>
        </div>
        <Button 
          onClick={handleManualSync}
          disabled={isSyncing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overall Status
            </CardTitle>
            <Activity className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">Healthy</div>
            <p className="text-xs text-muted-foreground mt-1">All systems operational</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Last Sync
            </CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {lastSync.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {Math.floor((Date.now() - lastSync.getTime()) / 60000)} mins ago
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Synced Items (24h)
            </CardTitle>
            <Database className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,248</div>
            <p className="text-xs text-muted-foreground mt-1">Across 3 channels</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Sync Error Rate
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.8%</div>
            <p className="text-xs text-muted-foreground mt-1">-0.2% from yesterday</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sync Logs</CardTitle>
          <CardDescription>Recent synchronization activities and their outcomes.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{log.message}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {log.time.toLocaleString('th-TH')}
                  </div>
                </div>
                <div>
                  {getStatusBadge(log.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
