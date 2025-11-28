import React, { useState, useRef, useEffect } from 'react';
import { Send, ShieldCheck, RefreshCw, Moon, Sun } from 'lucide-react';
import { Message, Role } from './types';
import { sendMessageStream, resetChatSession } from './services/geminiService';
import ChatMessage from './components/ChatMessage';
import QuickPrompts from './components/QuickPrompts';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: Role.MODEL,
      text: 'Xin chào! Tớ là Cố vấn An toàn Số. Tớ ở đây để giúp cậu giải đáp các thắc mắc về an toàn trực tuyến, bảo mật thông tin và cách ứng xử trên mạng xã hội. Cậu đang gặp vấn đề gì thế?',
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Vuốt tự do + auto scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      inputRef.current?.focus();
    }
  };

  const handleReset = () => {
    if (confirm('Cậu có chắc muốn xóa cuộc trò chuyện và bắt đầu lại không?')) {
      resetChatSession();
      setMessages([
        {
          id: Date.now().toString(),
          role: Role.MODEL,
          text: 'Chúng mình đã bắt đầu lại. Cậu cần tư vấn về điều gì mới không?',
          timestamp: new Date(),
        },
      ]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
  };

  return (
    <div className={`${darkMode ? 'dark' : ''} flex flex-col h-full transition-colors duration-500`}>
      <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-500">
        {/* Header */}
        <header className="flex-none bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 py-3 shadow-sm z-10 flex justify-between items-center transition-colors duration-500">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-800 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-300">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h1 className="font-bold text-slate-800 dark:text-slate-100 text-lg leading-tight">
                Cố vấn An toàn Số
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">Người bạn đồng hành tin cậy</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-300"
              title="Toggle Dark/Light Mode"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={handleReset}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors duration-300"
              title="Bắt đầu cuộc trò chuyện mới"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </header>

        {/* Chat Area */}
        <main
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth transition-colors duration-500"
        >
          <div className="max-w-3xl mx-auto flex flex-col gap-3">
            {messages.map(msg => (
              <ChatMessage key={msg.id} message={msg} />
            ))}

            {isLoading && (
              <div className="flex justify-start mb-6">
                <div className="flex items-center gap-2 text-slate-400 bg-white dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-tl-sm border border-slate-100 dark:border-slate-700 shadow-sm">
                  <div className="w-2 h-2 bg-emerald-400 dark:bg-emerald-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-emerald-400 dark:bg-emerald-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-emerald-400 dark:bg-emerald-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
            <div className="flex-none bg-slate-50 dark:bg-slate-900 pt-2 transition-colors duration-500">
              <QuickPrompts onSelect={handleSendMessage} disabled={isLoading} />
            </div>
          )}

        {/* Input Area */}
        <footer className="flex-none bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-4 py-4 z-10 transition-colors duration-500">
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
                className="w-full pl-4 pr-4 py-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all duration-300 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 disabled:opacity-60 disabled:cursor-not-allowed"
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
            <p className="text-[10px] text-slate-400 dark:text-slate-500 transition-colors duration-300">
              * Cố vấn An toàn Số là AI và có thể mắc lỗi. Với các tình huống khẩn cấp, hãy liên hệ người lớn hoặc tổng đài 111.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default App;
