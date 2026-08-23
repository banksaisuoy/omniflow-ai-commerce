
const emailSchema = z.string().email('กรุณากรอกอีเมลที่ถูกต้อง');
const passwordSchema = z.string().min(6, 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
const nameSchema = z.string().min(2, 'ชื่อ-นามสกุลต้องมีอย่างน้อย 2 ตัวอักษร').max(50, 'ชื่อ-นามสกุลต้องยาวไม่เกิน 50 ตัวอักษร');

export default function Auth() {
  const navigate = useNavigate();
    setIsLoading(true);

    try {
      nameSchema.parse(signupData.fullName);
      emailSchema.parse(signupData.email);
      passwordSchema.parse(signupData.password);
    } catch (err) {
