import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, X, Paperclip, Mic, MicOff } from 'lucide-react';
import { PhaseMirrorAgent } from 'phase-mirror-agent';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export function CopilotPanel({ width }: { width: number }) {
  const [agent, setAgent] = useState<PhaseMirrorAgent | null>(null);

  // ... existing state ...
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I am the Phase Mirror Copilot. I can help you navigate the Dissonance Graph, analyze L0 invariants, or generate Terraform configs. How can I assist you today?',
      timestamp: '12:55'
    }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize PhaseMirrorAgent
    const initAgent = async () => {
      const a = new PhaseMirrorAgent();
      await a.load();
      setAgent(a);
    };
    initAgent();

    // Initialize Speech Recognition
    if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setInput(prev => prev + (prev ? ' ' : '') + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        console.error("Could not start speech recognition", e);
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMessage]);
    setInput('');

    if (agent) {
      try {
        const responseText = await agent.analyze(input);
        const response: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: responseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, response]);
      } catch (e) {
        console.error('Agent error', e);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: `Uploaded file: ${file.name}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, newMessage]);
      
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div 
      className="bg-[#1e1e1e] border-l border-[#333] flex flex-col h-full flex-shrink-0"
      style={{ width }}
    >
      {/* Header */}
      <div className="h-9 px-4 flex items-center justify-between bg-[#252526] border-b border-[#333]">
        <div className="flex items-center space-x-2 text-xs font-bold text-gray-300 uppercase tracking-wider">
          <Sparkles size={14} className="text-blue-400" />
          <span>Copilot</span>
        </div>
        <button className="text-gray-500 hover:text-white">
          <X size={14} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`flex items-center space-x-2 mb-1 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center ${msg.role === 'assistant' ? 'bg-blue-600' : 'bg-gray-600'}`}>
                {msg.role === 'assistant' ? <Bot size={12} className="text-white" /> : <User size={12} className="text-white" />}
              </div>
              <span className="text-[10px] text-gray-500">{msg.timestamp}</span>
            </div>
            <div className={`max-w-[90%] rounded-lg p-3 text-sm ${
              msg.role === 'user' 
                ? 'bg-[#007acc] text-white' 
                : 'bg-[#2a2d2e] text-gray-300 border border-[#333]'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-[#333] bg-[#1e1e1e]">
        <div className="relative bg-[#252526] border border-[#333] rounded-md focus-within:border-blue-500 focus-within:ring-1 focus-within:ring-blue-500 transition-all">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={isListening ? "Listening..." : "Ask Copilot..."}
            className="w-full bg-transparent border-none py-2 pl-3 pr-3 text-sm text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-0 resize-none h-16"
          />
          <div className="flex items-center justify-between px-2 pb-2">
            <div className="flex items-center space-x-1">
              <button 
                className="p-1.5 text-gray-500 hover:text-gray-300 hover:bg-[#333] rounded transition-colors"
                title="Attach file"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip size={14} />
              </button>
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                onChange={handleFileUpload} 
              />
              <button 
                className={`p-1.5 rounded transition-colors ${isListening ? 'text-red-400 bg-red-400/10 hover:bg-red-400/20' : 'text-gray-500 hover:text-gray-300 hover:bg-[#333]'}`}
                title={isListening ? "Stop listening" : "Talk to type"}
                onClick={toggleListening}
              >
                {isListening ? <MicOff size={14} /> : <Mic size={14} />}
              </button>
            </div>
            <button 
              onClick={handleSend}
              disabled={!input.trim()}
              className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
        <div className="mt-2 text-[10px] text-gray-600 text-center">
          AI generated responses may be inaccurate.
        </div>
      </div>
    </div>
  );
}
