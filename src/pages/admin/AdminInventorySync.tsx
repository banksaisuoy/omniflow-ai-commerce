import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const mockSyncData = [
  { id: '1', platform: 'Shopee', lastSync: '2023-10-27 10:00:00', status: 'Success', itemsUpdated: 150 },
  { id: '2', platform: 'Lazada', lastSync: '2023-10-27 10:05:00', status: 'Failed', itemsUpdated: 0 },
  { id: '3', platform: 'TikTok Shop', lastSync: '2023-10-27 10:10:00', status: 'Success', itemsUpdated: 45 },
  { id: '4', platform: 'Line Shopping', lastSync: '2023-10-27 10:15:00', status: 'Pending', itemsUpdated: 0 },
];

export default function AdminInventorySync() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Inventory Sync Monitoring</h1>
        <p className="text-muted-foreground mt-1">
          Monitor real-time inventory synchronization across platforms.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Sync Activity</CardTitle>
          <CardDescription>Status of the latest inventory synchronizations.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Platform</TableHead>
                <TableHead>Last Sync</TableHead>
                <TableHead>Items Updated</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSyncData.map((sync) => (
                <TableRow key={sync.id}>
                  <TableCell className="font-medium">{sync.platform}</TableCell>
                  <TableCell>{sync.lastSync}</TableCell>
                  <TableCell>{sync.itemsUpdated}</TableCell>
                  <TableCell>
                    <Badge variant={sync.status === 'Success' ? 'default' : sync.status === 'Failed' ? 'destructive' : 'secondary'}>
                      {sync.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
