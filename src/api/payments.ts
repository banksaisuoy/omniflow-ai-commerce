  
  try {
    const json = await req.json();
    const schema = z.object({ token: z.string().startsWith('tok_').max(200, "Token length exceeds limit") });
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Invalid token', details: parsed.error.format() }), { status: 400 });
