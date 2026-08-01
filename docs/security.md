# Payment Security and Fraud Detection

This document outlines the payment security architecture and fraud detection mechanisms implemented in the application.

## Payment API Flow

The payment checkout process includes multi-layered security from the client-side to the backend.

1. **User Checkout Action:** User submits checkout form with selected payment method (COD, PromptPay, or Secure Credit Card).
2. **Fraud Analysis (Client-side):**
   - The transaction details (amount, payment method, timestamp) are passed through the fraud detection module (`analyzeTransaction`).
   - Risk scoring algorithm flags anomalies (e.g., unusually high amount, anomalous time window).
   - If risk score > threshold (e.g., 75), transaction is blocked immediately.
3. **Data Encryption:**
   - Sensitive transaction details and the fraud risk score are passed to `encryptPaymentData`.
   - Data is encrypted using `AES-256` via `crypto-js`.
   - The key is derived securely from environment variables (`VITE_PAYMENT_ENCRYPTION_KEY`).
4. **Order Creation:**
   - The encrypted payload (secure token) is passed in the transaction notes/metadata.
   - Standard order details are sent to Supabase RPC `create_order`.
5. **Backend Verification (Future state):**
   - Supabase Edge Functions or backend services can decrypt the payload and verify the transaction integrity.

## Security Headers

To ensure the client environment remains secure during checkout, the following HTTP Security Headers should be configured in the production environment / server settings:

- **Content-Security-Policy (CSP):** Restricts the origins of scripts and resources, preventing XSS attacks.
  `Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; connect-src 'self' https://*.supabase.co; img-src 'self' data: https:;`
- **Strict-Transport-Security (HSTS):** Enforces HTTPS connections.
  `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- **X-Frame-Options:** Prevents clickjacking by restricting embedding in iframes.
  `X-Frame-Options: DENY`
- **X-Content-Type-Options:** Prevents MIME-sniffing.
  `X-Content-Type-Options: nosniff`

## Encryption Implementation Details

- **Algorithm:** AES (Advanced Encryption Standard)
- **Key Size:** 256 bits
- **Library:** `crypto-js`
- **Location:** `/src/payment/services/security.ts`

### Risk Factors Evaluated (Fraud Detection)

- **Amount Thresholds:** High scores for transactions exceeding standard bounds.
- **Time Anomalies:** Elevated risk for late-night transactions.
- **Authentication:** Higher baseline risk for guest checkouts compared to authenticated users.
- **Payment Method:** Specific weights based on payment method chargeback risks.