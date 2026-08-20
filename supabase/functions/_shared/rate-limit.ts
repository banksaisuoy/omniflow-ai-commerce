const rateLimits = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (req: Request, limit: number = 60, windowMs: number = 60000): { allowed: boolean; remaining: number } => {
  const ip = req.headers.get('x-forwarded-for') || 'unknown';
  const now = Date.now();
  
  let record = rateLimits.get(ip);
  if (!record || record.resetTime < now) {
    record = { count: 1, resetTime: now + windowMs };
    rateLimits.set(ip, record);
    return { allowed: true, remaining: limit - 1 };
  }
  
  if (record.count >= limit) {
    return { allowed: false, remaining: 0 };
  }
  
  record.count += 1;
  return { allowed: true, remaining: limit - record.count };
};