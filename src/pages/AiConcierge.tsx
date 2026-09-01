      return;
    }
    
    // Sanitize input (DOM element/JSX is safe, this handles basic cleanup)
    const sanitizedText = text.trim();

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: sanitizedText };
    setMessages(prev => [...prev, userMessage]);