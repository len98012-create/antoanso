import React, { useState, useRef, useEffect } from 'react';
import { Send, ShieldCheck, RefreshCw } from 'lucide-react';
import { Message, Role } from './types';
import { sendMessageStream, resetChatSession } from './services/geminiService';
import ChatMessage from './components/ChatMessage';
import QuickPrompts from './components/QuickPrompts';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load messages từ localStorage khi App load
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      setMessages([
        {
          id: 'welcome',
          role: Role.MODEL,
          text: 'Xin chào! Tớ là Cố vấn An toàn Số. Tớ ở đây để giúp cậu giải đáp các thắc mắc về an toàn trực tuyến, bảo mật thông tin và cách ứng xử trên mạng xã hội. Cậu đang gặp vấn đề gì thế?',
          timestamp: new Date(),
        },
      ]);
    }
  }, []);

  // Lưu messages vào localStorage mỗi khi thay đổi
  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (text: string = inputValue) => {
    const trimmedText = text.trim();
    if (!trimmedText || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      text: trimmedText,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsLoading(true);

    try {
      const aiMsgId = (Date.now() + 1).toString();
      setMessages(prev => [
        ...prev,
        { id: aiMsgId, role: Role.MODEL, text: '', timestamp: new Date() },
      ]);

      let fullResponse = '';
      const stream = sendMessageStream(trimmedText);

      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev =>
          prev.map(msg =>
            msg.id === aiMsgId ? { ...msg, text: fullResponse } : msg
          )
        );
      }
    } catch (error) {
      console.error('Error streaming AI response:', error);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 2).toString(),
          role: Role.MODEL,
          text: 'Xin lỗi, tớ đang gặp chút trục trặc khi kết nối. Cậu thử lại sau nhé!',
          timestamp: new Date(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
      if (window.matchMedia('(min-width: 768px)').matches) {
        inputRef.current?.focus();
      }
    }
  };

  const handleReset = () => {
    if (confirm('Cậu có chắc muốn xóa cuộc trò chuyện và bắt đầu lại không?')) {
      resetChatSession();
      const newMsg: Message = {
        id: Date.now().toString(),
        role: Role.MODEL,
        text: 'Chúng mình đã bắt đầu lại. Cậu cần tư vấn về điều gì mới không?',
        timestamp: new Date(),
      };
      setMessages([newMsg]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
      {/* Header */}
      <header className="flex-none bg-white border-b border-slate-200 px-4 py-3 shadow-sm z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 className="font-bold text-slate-800 text-lg leading-tight">
                Cố vấn An toàn Số
              </h1>
              <p className="text-xs text-slate-500">Người bạn đồng hành tin cậy</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
            title="Bắt đầu cuộc trò chuyện mới"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
        <div className="max-w-3xl mx-auto">
          {messages.map(msg => (
            <ChatMessage key={msg.id} message={msg} />
          ))}

          {isLoading && (
            <div className="flex justify-start mb-6">
              <div className="flex items-center gap-2 text-slate-400 bg-white px-4 py-3 rounded-2xl rounded-tl-sm border border-slate-100 shadow-sm">
                <div
                  className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0ms' }}
                />
                <div
                  className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
                  style={{ animationDelay: '150ms' }}
                />
                <div
                  className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Quick Prompts */}
      {!isLoading &&
        messages.length < 4 &&
        messages[messages.length - 1].role === Role.MODEL && (
          <div className="flex-none bg-slate-50 pt-2">
            <QuickPrompts onSelect={handleSendMessage} disabled={isLoading} />
          </div>
        )}

      {/* Input Area */}
      <footer className="flex-none bg-white border-t border-slate-200 px-4 py-4 z-10">
        <div className="max-w-3xl mx-auto flex items-end gap-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập câu hỏi của cậu tại đây..."
              disabled={isLoading}
              className="w-full pl-4 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-slate-800 placeholder-slate-400 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isLoading}
            className="flex-none w-12 h-12 flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white rounded-xl shadow-sm transition-all duration-200 transform hover:scale-105 active:scale-95"
          >
            <Send size={20} className={isLoading ? 'opacity-0' : 'opacity-100'} />
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <RefreshCw size={20} className="animate-spin" />
              </div>
            )}
          </button>
        </div>
        <div className="max-w-3xl mx-auto mt-2 text-center">
          <p className="text-[10px] text-slate-400">
            * Cố vấn An toàn Số là AI và có thể mắc lỗi. Với các tình huống khẩn cấp, hãy liên hệ người lớn hoặc tổng đài 111.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
