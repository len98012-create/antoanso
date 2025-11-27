import React, { useState, useRef, useEffect } from "react";
import { Send, ShieldCheck, RefreshCw } from "lucide-react";
import { Message, Role } from "./types";
import { sendMessageStream, resetChatSession } from "./services/geminiService";
import ChatMessage from "./components/ChatMessage";
import QuickPrompts from "./components/QuickPrompts";

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: "welcome", role: Role.MODEL, text: "Xin chào! Tớ là Cố vấn An toàn Số. Bạn cần tư vấn gì?", timestamp: new Date() }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSendMessage = async (text: string = inputValue) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: Role.USER, text: trimmed, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const aiId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: aiId, role: Role.MODEL, text: "", timestamp: new Date() }]);

      let full = "";
      const stream = sendMessageStream(trimmed);
      for await (const chunk of stream) {
        full = chunk;
        setMessages(prev => prev.map(m => m.id === aiId ? { ...m, text: full } : m));
      }
    } catch {
      setMessages(prev => [...prev, { id: (Date.now() + 2).toString(), role: Role.MODEL, text: "Lỗi khi kết nối AI.", timestamp: new Date(), isError: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    if (confirm("Bạn muốn xóa cuộc trò chuyện và bắt đầu lại?")) {
      resetChatSession();
      setMessages([{ id: Date.now().toString(), role: Role.MODEL, text: "Đã bắt đầu lại!", timestamp: new Date() }]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      {/* Header */}
      <header className="flex-none bg-white p-3 border-b">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldCheck size={24} />
            <h1>Cố vấn An toàn Số</h1>
          </div>
          <button onClick={handleReset}><RefreshCw size={20} /></button>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4">
        {messages.map(m => <ChatMessage key={m.id} message={m} />)}
        {isLoading && <div>AI đang trả lời...</div>}
        <div ref={messagesEndRef} />
      </main>

      {/* Quick Prompts */}
      {!isLoading && messages.length < 4 && messages[messages.length-1].role === Role.MODEL && (
        <QuickPrompts onSelect={handleSendMessage} disabled={isLoading} />
      )}

      {/* Input */}
      <footer className="p-4 bg-white border-t flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Nhập câu hỏi..."
          className="flex-1 border p-2 rounded"
          disabled={isLoading}
        />
        <button onClick={() => handleSendMessage()} disabled={!inputValue.trim() || isLoading} className="p-2 bg-emerald-600 text-white rounded">
          <Send size={20} />
        </button>
      </footer>
    </div>
  );
};

export default App;
