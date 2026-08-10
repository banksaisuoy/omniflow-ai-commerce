## 2026-08-02 - [Token Leakage in Payment Service]
**Vulnerability:** The secure payment token from Stripe/API was being appended directly to the `_notes` field when calling the `create_order` RPC, causing the token to be stored unencrypted in the database.
**Learning:** Notes fields are often assumed to be safe for unstructured data but are frequently logged or displayed in admin interfaces, leading to unintentional exposure of sensitive tokens.
**Prevention:** Never append sensitive tokens or credentials to unstructured text fields intended for user notes or generic logging. Pass them strictly via dedicated secure headers, specific encrypted database fields, or avoid persisting them entirely if they are only needed for a single API transaction.## 2024-08-07 - Prevent payment token leakage in logs
**Vulnerability:** The application was logging raw payment data directly to the console in `src/services/paymentService.ts`, which violates PCI-DSS and leaks sensitive tokens.
**Learning:** This repo logs the entire `orderData` object, failing to proactively redact internal, non-redacted keys like `paymentToken` prior to serialization.
**Prevention:** Always implement an explicit redaction layer over unstructured or dynamically-composed data objects before writing to logs, particularly those handling PCI/PII data.
## 2024-08-11 - [Hardcoded Fallback Encryption Key]
**Vulnerability:** The application was using a hardcoded fallback string ('default-secure-key-32-chars-long!') for its payment encryption key in `src/payment/services/security.ts` if the environment variable was missing.
**Learning:** This is a critical security risk as it allows anyone with access to the source code to decrypt sensitive data like payment tokens if the environment variable is not explicitly set in a deployment.
**Prevention:** Never use hardcoded fallback values for cryptographic keys, passwords, or secrets. Ensure that cryptographic functions fail securely (e.g., throwing an error) if the required environment variables are absent.
