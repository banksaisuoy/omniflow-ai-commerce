import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { z } from 'zod';

import { Cloud, Download, Upload, RefreshCw, Loader2, ExternalLink } from "lucide-react";


const folderIdSchema = z.string().regex(/^[a-zA-Z0-9_-]{10,}$/, "Folder ID ไม่ถูกต้อง (ต้องเป็นตัวอักษร, ตัวเลข, -, _ เท่านั้น)").or(z.literal(''));

export default function AdminGDrive() {
  const [importFolder, setImportFolder] = useState("");
  const [backupFolder, setBackupFolder] = useState("");
  useEffect(() => { loadSettings(); }, []);

  const saveSetting = async (key: string, folderId: string) => {
    try {
      folderIdSchema.parse(folderId);
    } catch (err: any) {
      return toast.error(err.errors[0].message);
    }
    const { error } = await supabase.from("gdrive_settings").upsert({ key, value: { folder_id: folderId } }, { onConflict: "key" });
    if (error) toast.error(error.message); else toast.success("บันทึกแล้ว");
  };

  const runImport = async () => {
    if (!importFolder) return toast.error("กรุณาใส่ Folder ID");
    try {
      folderIdSchema.parse(importFolder);
    } catch (err: any) {
      return toast.error(err.errors[0].message);
    }
    setImporting(true);
    try {
      const { data, error } = await supabase.functions.invoke("gdrive-import", {
  };

  const runBackup = async () => {
    try {
      folderIdSchema.parse(backupFolder);
    } catch (err: any) {
      return toast.error(err.errors[0].message);
    }
    setBackingUp(true);
    try {
      const { data, error } = await supabase.functions.invoke("gdrive-backup", { body: {} });
