import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Cloud, Download, Upload, RefreshCw, Loader2, ExternalLink } from "lucide-react";

export default function AdminGDrive() {
  const [importFolder, setImportFolder] = useState("");
  const [backupFolder, setBackupFolder] = useState("");
  const [createProducts, setCreateProducts] = useState(false);
  const [importing, setImporting] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const [backups, setBackups] = useState<any[]>([]);
  const [lastResult, setLastResult] = useState<any>(null);

  const loadSettings = async () => {
    const { data } = await supabase.from("gdrive_settings").select("key,value");
    (data || []).forEach((s: any) => {
      if (s.key === "import_folder_id") setImportFolder(s.value?.folder_id || "");
      if (s.key === "backup_folder_id") setBackupFolder(s.value?.folder_id || "");
    });
    const { data: b } = await supabase.from("gdrive_backups").select("*").order("created_at", { ascending: false }).limit(20);
    setBackups(b || []);
  };
  useEffect(() => { loadSettings(); }, []);

  const saveSetting = async (key: string, folderId: string) => {
    const { error } = await supabase.from("gdrive_settings").upsert({ key, value: { folder_id: folderId } }, { onConflict: "key" });
    if (error) toast.error(error.message); else toast.success("บันทึกแล้ว");
  };

  const runImport = async () => {
    if (!importFolder) return toast.error("กรุณาใส่ Folder ID");
    setImporting(true);
    try {
      const { data, error } = await supabase.functions.invoke("gdrive-import", {
        body: { folder_id: importFolder, create_products: createProducts },
      });
      if (error) throw error;
      setLastResult(data);
      toast.success(`นำเข้า ${data.imported} รูปสำเร็จ`);
    } catch (e: any) { toast.error(e.message); } finally { setImporting(false); }
  };

  const runBackup = async () => {
    setBackingUp(true);
    try {
      const { data, error } = await supabase.functions.invoke("gdrive-backup", { body: {} });
      if (error) throw error;
      toast.success(`สำรองข้อมูลสำเร็จ: ${data.file?.name}`);
      loadSettings();
    } catch (e: any) { toast.error(e.message); } finally { setBackingUp(false); }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div className="flex items-center gap-3">
        <Cloud className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Google Drive Integration</h1>
          <p className="text-muted-foreground">นำเข้ารูปสินค้าและสำรองฐานข้อมูลไปยัง Google Drive</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Download className="h-5 w-5" /> นำเข้ารูปจาก Drive</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Google Drive Folder ID</Label>
              <div className="flex gap-2">
                <Input value={importFolder} onChange={e => setImportFolder(e.target.value)} placeholder="เช่น 1AbC..." />
                <Button variant="outline" onClick={() => saveSetting("import_folder_id", importFolder)}>บันทึก</Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">คัดลอกจาก URL: drive.google.com/drive/folders/<b>FOLDER_ID</b></p>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={createProducts} onCheckedChange={setCreateProducts} id="create" />
              <Label htmlFor="create">สร้าง Product draft อัตโนมัติจากแต่ละรูป</Label>
            </div>
            <Button onClick={runImport} disabled={importing} className="w-full">
              {importing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
              เริ่มนำเข้า
            </Button>
            {lastResult && (
              <div className="text-sm bg-muted p-3 rounded-lg max-h-48 overflow-auto">
                <div className="font-semibold mb-1">นำเข้า {lastResult.imported} รายการ</div>
                {(lastResult.results || []).slice(0, 5).map((r: any, i: number) => (
                  <div key={i} className="text-xs truncate">✓ {r.name} {r.error && <span className="text-destructive">— {r.error}</span>}</div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5" /> สำรองฐานข้อมูลไป Drive</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Backup Folder ID (ปล่อยว่าง = My Drive)</Label>
              <div className="flex gap-2">
                <Input value={backupFolder} onChange={e => setBackupFolder(e.target.value)} placeholder="Folder ID (optional)" />
                <Button variant="outline" onClick={() => saveSetting("backup_folder_id", backupFolder)}>บันทึก</Button>
              </div>
            </div>
            <Button onClick={runBackup} disabled={backingUp} className="w-full">
              {backingUp ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
              สำรองข้อมูลตอนนี้
            </Button>
            <p className="text-xs text-muted-foreground">Auto-backup รัน 03:00 น. ทุกวัน (ถ้าเปิด cron)</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex-row justify-between items-center">
          <CardTitle>ประวัติการสำรองข้อมูล</CardTitle>
          <Button size="sm" variant="ghost" onClick={loadSettings}><RefreshCw className="h-4 w-4" /></Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {backups.length === 0 && <p className="text-sm text-muted-foreground">ยังไม่มีประวัติ</p>}
            {backups.map(b => (
              <div key={b.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <div className="font-medium">{b.file_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(b.created_at).toLocaleString("th-TH")} · {(b.size_bytes / 1024).toFixed(1)} KB · {Object.keys(b.row_counts || {}).length} ตาราง
                  </div>
                </div>
                {b.file_url && <a href={b.file_url} target="_blank" rel="noopener noreferrer" className="text-primary flex items-center gap-1 text-sm"><ExternalLink className="h-3 w-3" /> เปิด</a>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
