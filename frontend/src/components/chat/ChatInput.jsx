import React, { useRef, useState } from 'react';
import { Send, Smile, Paperclip, Loader2 } from 'lucide-react';
import ProButton from '../ui/ProButton';
import AttachmentPreview from './AttachmentPreview';

const ChatInput = ({ onSendMessage, onTyping, isLoading }) => {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const handleTyping = (e) => {
    setContent(e.target.value);

    // Throttle typing event
    if (onTyping) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      onTyping(true);
      typingTimeoutRef.current = setTimeout(() => onTyping(false), 2000);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    if (files.length === 1) { // after removal it will be empty, so reset input to allow re-selecting same file
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if ((!content.trim() && files.length === 0) || isLoading) return;

    onSendMessage(content.trim(), files);

    setContent('');
    setFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onTyping && onTyping(false);
  };

  return (
    <div className="bg-white border-t border-slate-200">
      <AttachmentPreview files={files} onRemove={removeFile} />

      <form onSubmit={handleSubmit} className="p-4 flex items-end gap-3">
        <div className="flex gap-1 mb-1">
          {/* Emoji Trigger (Placeholder) */}
          <ProButton type="button" variant="ghost" className="!p-2 text-slate-400 hover:text-primary-500">
            <Smile size={24} />
          </ProButton>

          <ProButton type="button" variant="ghost" className="!p-2 text-slate-400 hover:text-primary-500" onClick={() => fileInputRef.current?.click()}>
            <Paperclip size={24} />
          </ProButton>
          <input
            type="file"
            multiple
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
          />
        </div>

        <div className="flex-1 min-w-0 bg-slate-100 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-primary-300 transition-all">
          <textarea
            value={content}
            onChange={handleTyping}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Nhập tin nhắn..."
            className="w-full bg-transparent border-none outline-none resize-none max-h-32 text-sm text-slate-800 placeholder:text-slate-400"
            rows={1}
            style={{ height: 'auto', minHeight: '24px' }}
          />
        </div>

        <ProButton
          type="submit"
          variant="primary"
          className={`!p-3 rounded-full flex-shrink-0 transition-transform ${(!content.trim() && files.length === 0) ? 'opacity-50 scale-90' : 'hover:scale-105 active:scale-95'}`}
          disabled={(!content.trim() && files.length === 0) || isLoading}
        >
          {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
        </ProButton>
      </form>
    </div>
  );
};

export default ChatInput;
