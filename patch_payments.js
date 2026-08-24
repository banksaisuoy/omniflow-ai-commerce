const fs = require('fs');
const path = 'src/api/payments.ts';
let code = fs.readFileSync(path, 'utf8');
code = `import { z } from 'zod';\n` + code;
code = code.replace(
  `    const { token } = await req.json();
    if (!token || !token.startsWith('tok_')) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 400 });
    }`,
  `    const json = await req.json();
    const schema = z.object({ token: z.string().startsWith('tok_') });
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Invalid token', details: parsed.error.format() }), { status: 400 });
    }
    const { token } = parsed.data;`
);
fs.writeFileSync(path, code);