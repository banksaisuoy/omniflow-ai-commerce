import { supabase } from '@/integrations/supabase/client';

export const mockTokenizeEndpoint = async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  
  try {
    const { token } = await req.json();
    if (!token || !token.startsWith('tok_')) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 400 });
    }
    
    const confirmationToken = `conf_${token.substring(4)}`;
    return new Response(JSON.stringify({ message: 'Token validated', token: confirmationToken }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};

export const mockWebhookEndpoint = async (req: Request) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  
  try {
    const body = await req.json();
    const signature = req.headers.get('stripe-signature');
    
    if (!signature) {
      return new Response(JSON.stringify({ error: 'Missing signature' }), { status: 400 });
    }
    
    
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};