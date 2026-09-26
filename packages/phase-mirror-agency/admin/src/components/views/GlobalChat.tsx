import React, { useState, useRef, useEffect } from 'react';
import { Send, Hash, User, Bot } from 'lucide-react';

interface ChatMessage {
  id: string;
  user: string;
  role: 'user' | 'system' | 'bot';
  content: string;
  timestamp: string;
  avatarColor?: string;
}

export function GlobalChat() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: '1', user: 'System', role: 'system', content: 'Welcome to #general-dissonance. Please respect L0 invariants.', timestamp: '09:00' },
    { id: '2', user: 'Architect-Alpha', role: 'user', content: 'Has anyone seen the drift metrics for Sector 7G? They look concerning.', timestamp: '10:23', avatarColor: 'bg-blue-600' },
    { id: '3', user: 'DevOps-Lead', role: 'user', content: 'Checking now. It might be a side effect of the new agent deployment.', timestamp: '10:25', avatarColor: 'bg-purple-600' },
    { id: '4', user: 'Agent-01', role: 'bot', content: 'Optimization complete. Local entropy reduced by 0.04. No invariant violations detected.', timestamp: '10:26' },
    { id: '5', user: 'Architect-Alpha', role: 'user', content: 'Thanks @Agent-01. Keep monitoring.', timestamp: '10:27', avatarColor: 'bg-blue-600' },
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      user: 'Phase Mirror Dev',
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatarColor: 'bg-indigo-600'
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        user: 'Phase Mirror Dev',
        role: 'user',
        content: `Uploaded file: ${file.name}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        avatarColor: 'bg-indigo-600'
      };
      setMessages(prev => [...prev, newMessage]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex-1 bg-[#1e1e1e] flex flex-col h-full">
      {/* Header */}
      <div className="h-12 border-b border-[#333] flex items-center px-6 bg-[#252526]">
        <Hash size={20} className="text-gray-400 mr-2" />
        <h2 className="text-white font-medium">general-dissonance</h2>
        <span className="ml-4 text-xs text-gray-500">Global discussion for Phase Mirror operators</span>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg) => (
          <div key={msg.id} className="flex items-start group">
            {/* Avatar */}
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mr-4 ${
              msg.role === 'system' ? 'bg-gray-700' : 
              msg.role === 'bot' ? 'bg-green-700' : 
              msg.avatarColor || 'bg-blue-600'
            }`}>
              {msg.role === 'bot' ? <Bot size={20} className="text-white" /> : 
               msg.role === 'system' ? <Hash size={20} className="text-gray-400" /> :
               <User size={20} className="text-white" />}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline mb-1">
                <span className={`font-medium mr-2 ${
                  msg.role === 'bot' ? 'text-green-400' : 
                  msg.role === 'system' ? 'text-gray-400' : 
                  'text-white'
                }`}>
                  {msg.user}
                  {msg.role === 'bot' && <span className="ml-1 text-[10px] bg-blue-600 text-white px-1 rounded">BOT</span>}
                </span>
                <span className="text-xs text-gray-500">{msg.timestamp}</span>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-[#1e1e1e] border-t border-[#333]">
        <div className="bg-[#2a2d2e] rounded-lg p-2 flex items-end border border-[#333] focus-within:border-gray-500 transition-colors">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileUpload}
          />
          <button 
            className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-[#333]"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-5 h-5 flex items-center justify-center border-2 border-current rounded-full text-[10px] font-bold">+</div>
          </button>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Message #general-dissonance"
            className="flex-1 bg-transparent border-none focus:ring-0 text-gray-200 placeholder-gray-500 min-h-[44px] max-h-32 py-3 px-2 resize-none text-sm"
            rows={1}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-2 text-gray-400 hover:text-blue-400 disabled:opacity-50 disabled:hover:text-gray-400 transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
        <div className="mt-2 text-xs text-center text-gray-600">
          <strong>Tip:</strong> You can mention @agents to trigger specific workflows.
        </div>
      </div>
    </div>
  );
}
