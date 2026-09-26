
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: { title: string; uri: string }[];
}

interface GardenAssistantProps {
  onClose: () => void;
}

const GardenAssistant: React.FC<GardenAssistantProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hello! I\'m your Citizen Gardens AI assistant. How can I help you grow today? (e.g., "What should I plant in Seattle in April?" or "How do I start a community garden?")' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => console.log('Location access denied.')
      );
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMessage,
        config: {
          systemInstruction: `You are a helpful and knowledgeable Urban Agriculture Assistant for Citizen Gardens. 
          Use a friendly, community-oriented tone. 
          Focus on organic practices, companion planting, and urban space optimization.
          If providing climate-specific advice, consider the user's likely location.
          Always mention Citizen Gardens values: sustainability, community sharing, and fresh food access.`,
          tools: [{ googleSearch: {} }]
        }
      });

      const text = response.text || "I'm sorry, I couldn't find a response right now.";
      const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
        ?.filter(chunk => chunk.web)
        ?.map(chunk => ({ title: chunk.web!.title, uri: chunk.web!.uri })) || [];

      setMessages(prev => [...prev, { role: 'assistant', content: text, sources }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Oops, something went wrong with my gardening knowledge. Please try again later!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-stone-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl h-[80vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="bg-emerald-600 p-6 flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v8"/><path d="m4.93 10.93 1.41 1.41"/><path d="M2 18h2"/><path d="M20 18h2"/><path d="m19.07 10.93-1.41 1.41"/><path d="M22 22H2"/><path d="m8 22 4-10 4 10"/></svg>
            </div>
            <div>
              <h3 className="font-bold text-lg">Garden AI Guide</h3>
              <p className="text-xs text-emerald-100">Powered by Citizen Gardens & Gemini</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:rotate-90 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
        </div>

        <div ref={scrollRef} className="flex-grow overflow-y-auto p-6 space-y-4 bg-stone-50">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-4 rounded-2xl ${
                m.role === 'user' 
                ? 'bg-emerald-100 text-emerald-900 rounded-tr-none' 
                : 'bg-white text-stone-800 shadow-sm border border-stone-100 rounded-tl-none'
              }`}>
                <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                {m.sources && m.sources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-stone-100">
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">Sources</p>
                    <div className="flex flex-wrap gap-2">
                      {m.sources.slice(0, 3).map((s, si) => (
                        <a 
                          key={si} 
                          href={s.uri} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="text-xs text-emerald-600 hover:underline bg-emerald-50 px-2 py-1 rounded"
                        >
                          {s.title.length > 30 ? s.title.substring(0, 30) + '...' : s.title}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex gap-1 items-center">
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-.1s]"></div>
                <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce [animation-delay:-.2s]"></div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t border-stone-200 bg-white">
          <div className="flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your gardening question..."
              className="flex-grow px-4 py-3 rounded-full bg-stone-100 border-none focus:ring-2 focus:ring-emerald-500 outline-none"
            />
            <button 
              type="submit"
              disabled={isLoading}
              className="w-12 h-12 bg-emerald-600 text-white rounded-full flex items-center justify-center hover:bg-emerald-700 disabled:bg-stone-300 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GardenAssistant;
