import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";

type Msg = { role: "user" | "assistant"; content: string };

export function AIChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "สวัสดีค่ะ 🌸 มีอะไรให้ Khanom House ช่วยไหมคะ? ลองถามเรื่องขนม เมนูแนะนำ หรือวิธีสั่งได้เลย" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, open]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    if (!user) { setMessages(m => [...m, { role: "assistant", content: "กรุณา[เข้าสู่ระบบ](/auth)ก่อนใช้แชทค่ะ" }]); return; }
    const next = [...messages, { role: "user" as const, content: text }];
    setMessages(next); setInput(""); setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: { messages: next.slice(-10), session_id: sessionId },
      });
      if (error) throw error;
      if (data?.session_id) setSessionId(data.session_id);
      setMessages(m => [...m, { role: "assistant", content: data?.reply || "ขออภัย ระบบไม่พร้อม" }]);
    } catch (e) {
      setMessages(m => [...m, { role: "assistant", content: "ขออภัย เชื่อมต่อ AI ไม่สำเร็จ" }]);
    } finally { setLoading(false); }
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:scale-105 transition flex items-center justify-center"
          aria-label="เปิดแชท"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[92vw] max-w-sm h-[70vh] max-h-[600px] rounded-3xl bg-card shadow-2xl border flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-primary/5">
            <div>
              <div className="font-semibold">ผู้ช่วย Khanom House</div>
              <div className="text-xs text-muted-foreground">ตอบทุกคำถามเรื่องขนมไทย</div>
            </div>
            <Button size="icon" variant="ghost" onClick={() => setOpen(false)}><X className="h-4 w-4" /></Button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  <div className="prose prose-sm max-w-none [&>*]:my-1 [&_a]:text-primary [&_a]:underline">
                    <ReactMarkdown
                      components={{
                        a: ({ href, children }) => href?.startsWith("/") ? <Link to={href}>{children}</Link> : <a href={href} target="_blank" rel="noreferrer">{children}</a>,
                      }}
                    >{m.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {loading && <div className="flex justify-start"><div className="rounded-2xl bg-muted px-3 py-2"><Loader2 className="h-4 w-4 animate-spin" /></div></div>}
            <div ref={bottomRef} />
          </div>
          <div className="p-3 border-t flex gap-2">
            <Input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="พิมพ์ข้อความ..." disabled={loading} />
            <Button size="icon" onClick={send} disabled={loading || !input.trim()}><Send className="h-4 w-4" /></Button>
          </div>
        </div>
      )}
    </>
  );
}
