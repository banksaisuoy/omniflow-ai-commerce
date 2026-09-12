  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('ไฟล์ที่อัปโหลดต้องเป็นรูปภาพเท่านั้น');
      return;
    }
    if (file.size > 5_000_000) {
      toast.error('ไฟล์ใหญ่เกิน 5MB');
      return;
