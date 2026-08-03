## 2026-08-02 - [Token Leakage in Payment Service]
**Vulnerability:** The secure payment token from Stripe/API was being appended directly to the `_notes` field when calling the `create_order` RPC, causing the token to be stored unencrypted in the database.
**Learning:** Notes fields are often assumed to be safe for unstructured data but are frequently logged or displayed in admin interfaces, leading to unintentional exposure of sensitive tokens.
**Prevention:** Never append sensitive tokens or credentials to unstructured text fields intended for user notes or generic logging. Pass them strictly via dedicated secure headers, specific encrypted database fields, or avoid persisting them entirely if they are only needed for a single API transaction.
