import generatePayload from 'promptpay-qr';
import QRCode from 'qrcode';

/** PromptPay merchant ID — replace with real phone/ID for production */
export const PROMPTPAY_ID = '0812345678';

export async function generatePromptPayQR(amount: number, id: string = PROMPTPAY_ID) {
  const payload = generatePayload(id, { amount });
  return await QRCode.toDataURL(payload, { width: 320, margin: 1 });
}
