
  const createMut = useMutation({
    mutationFn: async () => {
      if (!form.code || form.code.trim().length < 3 || form.code.trim().length > 20) {
        throw new Error('โค้ดต้องมีความยาว 3-20 ตัวอักษร');
      }
      if (!/^[a-zA-Z0-9_-]+$/.test(form.code.trim())) {
        throw new Error('โค้ดต้องเป็นตัวอักษรภาษาอังกฤษ ตัวเลข ขีดล่าง หรือขีดกลางเท่านั้น');
      }
      if (form.discount_value < 0) {
        throw new Error('มูลค่าส่วนลดต้องไม่ติดลบ');
      }
      if (form.min_order < 0) {
        throw new Error('ยอดขั้นต่ำต้องไม่ติดลบ');
      }
      if (form.bogo_buy_qty !== null && form.bogo_buy_qty < 0) {
        throw new Error('จำนวน BOGO (ซื้อ) ต้องไม่ติดลบ');
      }
      if (form.bogo_get_qty !== null && form.bogo_get_qty < 0) {
        throw new Error('จำนวน BOGO (แถม) ต้องไม่ติดลบ');
      }
      if (form.bogo_get_discount_percent !== null && (form.bogo_get_discount_percent < 0 || form.bogo_get_discount_percent > 100)) {
        throw new Error('ส่วนลด BOGO ชิ้นแถมต้องอยู่ระหว่าง 0-100%');
      }
      let tiers: any = null;
      if (form.tier_thresholds?.trim()) {
        try { tiers = JSON.parse(form.tier_thresholds); } catch { throw new Error('tier_thresholds ต้องเป็น JSON'); }
