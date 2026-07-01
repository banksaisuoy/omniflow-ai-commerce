import { useState, useRef, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

// Mock Gemini API function
const mockGeminiSuggest = async (prompt: string): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const lowerPrompt = prompt.toLowerCase();
      if (lowerPrompt.includes('ผู้ใหญ่') || lowerPrompt.includes('ของฝาก')) {
        resolve('สำหรับการนำไปฝากผู้ใหญ่ ขอแนะนำ **เซ็ตขนมมงคล ๙ อย่าง** ครับ ประกอบด้วย ทองหยิบ ทองหยอด ฝอยทอง เสน่ห์จันทร์ และอื่นๆ ที่มีความหมายดีงาม และหวานน้อย เหมาะกับผู้ใหญ่มากครับ');
      } else if (lowerPrompt.includes('สดชื่น') || lowerPrompt.includes('ร้อน')) {
        resolve('อากาศร้อนๆ แบบนี้ แนะนำ **บัวลอยเบญจรงค์น้ำกะทิสดเย็น** หรือ **ทับทิมกรอบ** ครับ หวานเย็นชื่นใจ ทานแล้วสดชื่นแน่นอนครับ');
      } else if (lowerPrompt.includes('งานแต่ง') || lowerPrompt.includes('มงคล')) {
        resolve('สำหรับงานมงคลสมรส เรามีบริการรับจัดพานขนมมงคลตามประเพณีไทยครับ แนะนำเป็น **พานเอกขนมมงคล ๙ ชนิด** ประดับด้วยดอกไม้สดสวยงาม หากต้องการทราบรายละเอียดเพิ่มเติม สามารถติดต่อทีมจัดเลี้ยงได้เลยครับ');
      } else {
        resolve(`จากที่คุณบอกว่า "${prompt}" ผมขอแนะนำ **ขนมชั้นใบเตย** และ **ข้าวเหนียวมะม่วง** ครับ เป็นเมนูยอดฮิตที่ใครๆ ก็ชอบ หอม หวานกำลังดีครับ`);
      }
    }, 1200);
  });
};

const SUGGESTED_PROMPTS = [
  "อยากได้ขนมไปฝากผู้ใหญ่",
  "ขนมอะไรทานแล้วสดชื่น?",
  "มีขนมสำหรับจัดงานแต่งไหม?",
];

export default function AiConcierge() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'สวัสดีครับ! ผมคือผู้ช่วย AI ของ Khanom House มีอะไรให้ผมแนะนำเกี่ยวกับการเลือกซื้อขนมไทยไหมครับ?',
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (text: string = input) => {
    if (!text.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await mockGeminiSuggest(text);
      const aiMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: response };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      const errorMessage: Message = { id: (Date.now() + 1).toString(), role: 'assistant', content: 'ขออภัยครับ เกิดข้อผิดพลาดในการประมวลผล กรุณาลองใหม่อีกครั้ง' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl min-h-[calc(100vh-100px)] flex flex-col">
        {/* Header */}
        <div className="text-center mb-8">
          <Badge variant="outline" className="border-primary/30 text-primary bg-primary/5 mb-4 flex w-fit mx-auto items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            AI Concierge (Beta)
          </Badge>
          <h1 className="font-display text-4xl mb-2">
            ผู้ช่วย <span className="italic gradient-text">ส่วนตัวของคุณ</span>
          </h1>
          <p className="text-muted-foreground">
            ให้ AI ช่วยค้นหาและแนะนำขนมไทยที่เหมาะกับความต้องการของคุณ
          </p>
        </div>

        {/* Chat Interface */}
        <Card className="flex-1 flex flex-col overflow-hidden border-primary/20 shadow-elegant bg-white/70 backdrop-blur-xl">
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-6 max-w-3xl mx-auto pb-4">
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
                      msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                    }`}>
                      {msg.role === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                    </div>
                    <div className={`max-w-[80%] rounded-2xl px-5 py-3.5 shadow-sm ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-tr-none'
                        : 'bg-white border border-border/50 text-foreground rounded-tl-none'
                    }`}>
                      <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                        {/* Simple markdown parsing for bold text */}
                        {msg.content.split('**').map((part, i) => i % 2 === 1 ? <strong key={i} className={msg.role === 'user' ? 'text-white font-bold' : 'text-primary font-bold'}>{part}</strong> : part)}
                      </p>
                    </div>
                  </motion.div>
                ))}

                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-4"
                  >
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                      <Bot className="h-5 w-5" />
                    </div>
                    <div className="bg-white border border-border/50 rounded-2xl rounded-tl-none px-5 py-4 shadow-sm flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-primary/80 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </ScrollArea>

          <div className="p-4 bg-white/50 border-t border-border/50 backdrop-blur-md">
            <div className="max-w-3xl mx-auto">
              <div className="flex flex-wrap gap-2 mb-3">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    size="sm"
                    className="rounded-full bg-white/80 text-xs text-muted-foreground hover:text-primary"
                    onClick={() => handleSend(prompt)}
                    disabled={isTyping}
                  >
                    {prompt}
                  </Button>
                ))}
              </div>

              <div className="flex items-center gap-2 relative">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="พิมพ์ข้อความเพื่อสอบถาม AI..."
                  className="rounded-full pr-12 bg-white/80 focus-visible:ring-primary/30"
                  disabled={isTyping}
                />
                <Button
                  size="icon"
                  className="absolute right-1 top-1 bottom-1 h-auto rounded-full w-10"
                  onClick={() => handleSend()}
                  disabled={isTyping || !input.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-2 flex items-center justify-center gap-1">
                <AlertCircle className="h-3 w-3" />
                AI อาจให้ข้อมูลที่คลาดเคลื่อน กรุณาตรวจสอบข้อมูลก่อนการสั่งซื้อ
              </p>
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
