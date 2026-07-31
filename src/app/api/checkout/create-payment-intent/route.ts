// This file acts as a mocked Next.js API route as requested by the user,
// though in Vite it will not be executed natively on the server.
// The frontend will mock the call or hit a separate backend.

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount } = body;

    if (!amount) {
      return new Response(JSON.stringify({ error: 'Amount is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // In a real environment, this would call stripe.paymentIntents.create()
    const mockClientSecret = `pi_mock_${Math.random().toString(36).substring(7)}_secret_${Date.now()}`;

    return new Response(JSON.stringify({ clientSecret: mockClientSecret }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}