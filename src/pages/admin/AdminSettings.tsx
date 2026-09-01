      });
      schema.parse({ storeName, storeEmail });
      
      const sanitizedName = storeName.trim();
      const sanitizedEmail = storeEmail.trim();

      // Ensure mock variables are technically 'used' to prevent ts warnings
