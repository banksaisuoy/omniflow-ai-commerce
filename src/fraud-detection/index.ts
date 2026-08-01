export interface TransactionData {
  userId: string | null;
  amount: number;
  ipAddress?: string;
  deviceFingerprint?: string;
  paymentMethod: string;
  timestamp: number;
}

export interface FraudAnalysisResult {
  riskScore: number;
  isBlocked: boolean;
  reasons: string[];
}

/**
 * Analyzes transaction data for potential fraud.
 * Generates a risk score from 0 (safe) to 100 (high risk).
 */
export const analyzeTransaction = (data: TransactionData): FraudAnalysisResult => {
  let riskScore = 0;
  const reasons: string[] = [];

  // 1. Unusually high amount check
  if (data.amount > 50000) {
    riskScore += 40;
    reasons.push('Unusually high transaction amount');
  } else if (data.amount > 10000) {
    riskScore += 15;
    reasons.push('High transaction amount');
  }

  // 2. Guest user check (higher baseline risk)
  if (!data.userId) {
    riskScore += 10;
    reasons.push('Guest checkout');
  }

  // 3. Time anomaly (e.g., very late night checkout, just a mock check)
  const hour = new Date(data.timestamp).getHours();
  if (hour >= 2 && hour <= 5) {
    riskScore += 20;
    reasons.push('Late night transaction anomaly');
  }

  // 4. Payment method check
  if (data.paymentMethod === 'credit_card') {
    // Credit cards have a slightly higher fraud risk online compared to PromptPay/COD
    riskScore += 5;
  }

  // Normalize score
  riskScore = Math.min(100, Math.max(0, riskScore));
  
  // Define blocking threshold (e.g., score > 75 means blocked)
  const isBlocked = riskScore > 75;

  return {
    riskScore,
    isBlocked,
    reasons
  };
};