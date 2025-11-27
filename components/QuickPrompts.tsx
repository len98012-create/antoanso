import React from 'react';
import { QuickPrompt } from '../types';
import { ShieldAlert, Fingerprint, Copyright, MessageSquareWarning } from 'lucide-react';

interface QuickPromptsProps {
  onSelect: (prompt: string) => void;
  disabled: boolean;
}

const QuickPrompts: React.FC<QuickPromptsProps> = ({ onSelect, disabled }) => {
  const prompts: QuickPrompt[] = [
    {
      id: 'cyberbullying',
      label: 'Bị nói xấu trên mạng',
      prompt: 'Tớ đang bị một nhóm bạn nói xấu và chế ảnh trên Facebook. Tớ nên làm gì bây giờ?',
      icon: <MessageSquareWarning size={20} className="text-orange-500" />
    },
    {
      id: 'privacy',
      label: 'Lộ mật khẩu',
      prompt: 'Tớ lỡ đăng nhập Facebook ở quán nét và quên đăng xuất, giờ tớ không vào được nữa. Giúp tớ với!',
      icon: <Fingerprint size={20} className="text-blue-500" />
    },
    {
      id: 'copyright',
      label: 'Bản quyền nhạc',
      prompt: 'Tớ muốn dùng bài hát nổi tiếng để làm nhạc nền cho video bài tập của lớp đăng lên YouTube thì có bị phạt không?',
      icon: <Copyright size={20} className="text-purple-500" />
    },
    {
      id: 'scam',
      label: 'Link lạ',
      prompt: 'Có người lạ gửi cho tớ một đường link bảo là trúng thưởng iPhone. Tớ có nên click vào không?',
      icon: <ShieldAlert size={20} className="text-red-500" />
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-3xl mx-auto px-4 mb-6">
      {prompts.map((item) => (
        <button
          key={item.id}
          onClick={() => onSelect(item.prompt)}
          disabled={disabled}
          className="flex items-center gap-3 p-4 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md text-left disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-white transition-colors">
            {item.icon}
          </div>
          <div>
            <span className="block font-medium text-slate-700 text-sm">{item.label}</span>
            <span className="block text-xs text-slate-500 mt-0.5 line-clamp-1">{item.prompt}</span>
          </div>
        </button>
      ))}
    </div>
  );
};

export default QuickPrompts;