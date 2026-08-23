      throw new Error("LOVABLE_API_KEY is not configured");
    }

    if (!text || typeof text !== "string") {
      throw new Error("Text is required and must be a string for embedding generation");
    }
    
    if (text.length > 10000) {
      throw new Error("Text exceeds maximum allowed length of 10000 characters");
    }

    console.log("Generating embedding for text:", text.substring(0, 100) + "...");
