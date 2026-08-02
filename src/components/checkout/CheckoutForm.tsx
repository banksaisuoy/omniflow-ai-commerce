import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';

interface CheckoutFormProps {
  onSubmit: (stripe: any, elements: any) => Promise<void>;
  isSubmitting: boolean;
}

export const CheckoutForm = ({ onSubmit, isSubmitting }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    onSubmit(stripe, elements);
  };

  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-md bg-white">
        <CardElement options={{ hidePostalCode: true }} />
      </div>
      <Button 
        type="button" 
        onClick={handleSubmit} 
        disabled={isSubmitting || !stripe || !elements} 
        className="w-full mt-6" 
        size="lg"
      >
        {isSubmitting ? 'กำลังดำเนินการ...' : 'ยืนยันคำสั่งซื้อ'}
      </Button>
    </div>
  );
};