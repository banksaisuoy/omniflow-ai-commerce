import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';

export default function AdminInventorySync() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Inventory Sync</h1>
        <p className="text-muted-foreground mt-1">
          Monitor real-time inventory synchronization.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 text-primary" />
            Sync Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Main Warehouse</h3>
                <p className="text-sm text-muted-foreground">Last synced: Just now</p>
              </div>
              <div className="text-success font-medium">In Sync</div>
            </div>
            <div className="flex justify-between items-center p-4 border rounded-lg">
              <div>
                <h3 className="font-semibold">Store Front (BKK)</h3>
                <p className="text-sm text-muted-foreground">Last synced: 2 mins ago</p>
              </div>
              <div className="text-success font-medium">In Sync</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
