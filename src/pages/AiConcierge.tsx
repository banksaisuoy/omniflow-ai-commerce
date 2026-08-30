import { useState, useRef, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;
    if (text.length > 500) {
      toast.error('ข้อความยาวเกินไป');
      return;
    }
    
    // Sanitize input
    const sanitizedText = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;').trim();

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: sanitizedText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await mockGeminiSuggest(sanitizedText);
      const aiMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: response };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
                  placeholder="พิมพ์ข้อความเพื่อสอบถาม AI..."
                  className="rounded-full pr-12 bg-white/80 focus-visible:ring-primary/30"
                  disabled={isTyping}
                  maxLength={500}
                />
                <Button
                  size="icon"
