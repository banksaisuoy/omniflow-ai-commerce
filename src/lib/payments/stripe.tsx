import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

// Mock publishable key for testing/build purposes
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

export const createPaymentIntent = async (amount: number) => {
  // In a real app, this makes an API request to your server to generate the client_secret
  // For this exercise, we are mocking the response with a dummy string
  return {
    clientSecret: `pi_mock_${Math.random().toString(36).substring(7)}_secret_${Date.now()}`,
    amount,
  };
};

const CheckoutForm: React.FC<{ onSuccess: () => void; onFail: () => void }> = ({ onSuccess, onFail }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    // In a real environment, we'd use stripe.confirmPayment
    // Here we're mocking the success since we're using a fake client secret
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsProcessing(false);
    
    // Mocking success unconditionally for demo
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-card">
      <h3 className="font-semibold mb-4">💳 Secure Payment (Stripe)</h3>
      <PaymentElement />
      <div className="flex gap-4 pt-2">
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="w-full"
        >
          {isProcessing ? "Processing..." : "Pay now"}
        </Button>
      </div>
      <p className="text-sm text-muted-foreground mt-2 text-center">
        (Note: Using mocked payment confirmation for demo)
      </p>
    </form>
  );
};

export const StripePaymentWrapper: React.FC<{
  clientSecret?: string;
  onSuccess?: () => void;
  onFail?: () => void;
}> = ({ clientSecret, onSuccess, onFail }) => {
  if (!clientSecret) {
    return <div className="text-red-500 p-4 border rounded">Missing client secret for Stripe payment.</div>;
  }

  const options = {
    clientSecret,
    // In test mode we can use a dummy setup to prevent crash on invalid secret
    appearance: {
      theme: 'stripe' as const,
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm 
        onSuccess={onSuccess || (() => {})} 
        onFail={onFail || (() => {})} 
      />
    </Elements>
  );
};