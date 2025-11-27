import React from 'react';
import { Message, Role } from '../types';
import { User, Bot, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isUser = message.role === Role.USER;
  const isError = message.isError;

  return (
    <div className={`flex w-full mb-6 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[85%] md:max-w-[70%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-3`}>
        
        {/* Avatar */}
        <div className={`
          flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm
          ${isUser ? 'bg-blue-600 text-white' : isError ? 'bg-red-100 text-red-600' : 'bg-emerald-600 text-white'}
        `}>
          {isUser ? <User size={18} /> : isError ? <AlertCircle size={18} /> : <Bot size={18} />}
        </div>

        {/* Bubble */}
        <div className={`
          flex flex-col
          ${isUser ? 'items-end' : 'items-start'}
        `}>
          <div className={`
            px-4 py-3 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed break-words overflow-hidden
            ${isUser 
              ? 'bg-blue-600 text-white rounded-tr-sm' 
              : isError
                ? 'bg-red-50 text-red-800 border border-red-200 rounded-tl-sm'
                : 'bg-white text-slate-800 border border-slate-100 rounded-tl-sm'}
          `}>
             {isUser ? (
                <p className="whitespace-pre-wrap">{message.text}</p>
             ) : (
                <div className="markdown-content">
                  <ReactMarkdown 
                     components={{
                        ul: ({node, ...props}) => <ul className="list-disc pl-4 my-2 space-y-1" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal pl-4 my-2 space-y-1" {...props} />,
                        li: ({node, ...props}) => <li className="pl-1" {...props} />,
                        p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-bold text-emerald-700" {...props} />,
                        a: ({node, ...props}) => <a className="text-blue-600 underline hover:text-blue-800" {...props} />,
                     }}
                  >
                    {message.text}
                  </ReactMarkdown>
                </div>
             )}
          </div>
          <span className="text-xs text-slate-400 mt-1 px-1">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;