import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Send, PauseCircle, Volume2, VolumeX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { COPY } from '../constants';
import { Message } from '../types';
import { calculateDrift, generateSystemResponse, generateSpeech } from '../services/resonanceEngine';
import BreathOverlay from '../components/BreathOverlay';

// --- Audio Helper Functions ---
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const SoftLoop: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 'init', 
      sender: 'guide', 
      text: COPY.welcome, 
      timestamp: Date.now(), 
      type: 'text' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [drift, setDrift] = useState(0.1);
  const [showBreath, setShowBreath] = useState(false);
  const [breathReason, setBreathReason] = useState<string>('');
  
  // Voice & Audio State
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const recognitionRef = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    // Initialize Speech Recognition
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            setInput(prev => prev + event.results[i][0].transcript + ' ');
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const initAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioContextClass({ sampleRate: 24000 });
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const playAudioResponse = async (base64Data: string) => {
    try {
      initAudioContext();
      if (!audioCtxRef.current) return;

      const audioBuffer = await decodeAudioData(
        decode(base64Data),
        audioCtxRef.current,
        24000,
        1
      );
      
      const source = audioCtxRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtxRef.current.destination);
      source.start();
    } catch (e) {
      console.error("Failed to play audio", e);
    }
  };

  const toggleVoice = () => {
    initAudioContext();
    setIsVoiceEnabled(!isVoiceEnabled);
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    // Ensure AudioContext is ready on user interaction
    initAudioContext();

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: Date.now(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    
    // Stop listening when sending
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    }

    // Update Drift (Mock)
    const newDrift = calculateDrift(userMsg.text, drift);
    setDrift(newDrift);

    // Check Safety Layer
    if (newDrift > 0.8) {
      setTimeout(() => {
        setIsTyping(false);
        setBreathReason(COPY.offerPause);
        setShowBreath(true);
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            sender: 'system',
            text: "System offered a pause due to high semantic drift.",
            timestamp: Date.now(),
            type: 'pause-offer'
        }]);
      }, 1500);
      return;
    }

    // Generate Response via Gemini
    const responseText = await generateSystemResponse(userMsg.text);
    
    setIsTyping(false);
    setMessages(prev => [...prev, {
      id: (Date.now() + 1).toString(),
      sender: 'guide',
      text: responseText,
      timestamp: Date.now(),
      type: 'text'
    }]);

    // Handle TTS if enabled
    if (isVoiceEnabled) {
      const audioData = await generateSpeech(responseText);
      if (audioData) {
        playAudioResponse(audioData);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleManualPause = () => {
    setBreathReason("Requested by user");
    setShowBreath(true);
  };

  return (
    <div className="h-[calc(100dvh-5rem)] md:h-screen flex flex-col bg-stone-50 dark:bg-stone-950 md:pl-20 relative transition-colors duration-300">
      <BreathOverlay 
        isOpen={showBreath} 
        onClose={() => {
            setShowBreath(false);
            setDrift(prev => Math.max(prev - 0.3, 0)); // Reduce drift after breathing
        }} 
        reason={breathReason}
      />

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 pt-4">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex flex-col max-w-[85%] md:max-w-2xl ${
              msg.sender === 'user' ? 'self-end items-end' : 'self-start items-start'
            } ${msg.type === 'pause-offer' ? 'w-full max-w-full items-center' : ''}`}
          >
            {msg.type === 'pause-offer' ? (
                <div className="my-4 px-4 py-2 bg-stone-100 dark:bg-stone-900 rounded-full text-xs text-stone-500 dark:text-stone-500 border border-stone-200 dark:border-stone-800">
                    {msg.text}
                </div>
            ) : (
                <div className={`
                p-4 md:p-6 rounded-3xl text-lg md:text-xl font-light leading-relaxed transition-colors duration-300
                ${msg.sender === 'user' 
                    ? 'bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 shadow-sm border border-stone-100 dark:border-stone-800 rounded-tr-none' 
                    : 'bg-transparent text-stone-700 dark:text-stone-400 border border-stone-300/50 dark:border-stone-800/50 rounded-tl-none'}
                `}>
                {msg.text}
                </div>
            )}
            <span className="text-[10px] text-stone-500 dark:text-stone-600 mt-2 px-2">
                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>
          </div>
        ))}
        
        {isTyping && (
          <div className="self-start p-6 rounded-3xl bg-transparent border border-stone-300/50 dark:border-stone-800/50 rounded-tl-none flex items-center gap-2">
            <div className="w-2 h-2 bg-stone-400 dark:bg-stone-700 rounded-full animate-bounce" style={{ animationDelay: '0s' }}/>
            <div className="w-2 h-2 bg-stone-400 dark:bg-stone-700 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}/>
            <div className="w-2 h-2 bg-stone-400 dark:bg-stone-700 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}/>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 md:p-6 bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-800 transition-colors duration-300">
        <div className="max-w-4xl mx-auto">
          <div className={`relative flex items-center gap-2 bg-stone-50 dark:bg-stone-800/50 rounded-[2.5rem] p-1.5 border transition-all duration-500 ${
            isListening 
              ? 'ring-2 ring-teal-500/20 border-teal-500/50 bg-teal-500/5' 
              : 'border-stone-200 dark:border-stone-800 focus-within:border-stone-300 dark:focus-within:border-stone-600 focus-within:ring-4 focus-within:ring-stone-500/5'
          }`}>
            <div className="flex items-center gap-0.5 bg-white/80 dark:bg-stone-900/80 backdrop-blur-sm rounded-full p-1 border border-stone-200/50 dark:border-stone-700/50 shrink-0">
              {/* Inline Pause Button */}
              <button 
                onClick={handleManualPause}
                className="p-2 rounded-full text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-stone-700 dark:hover:text-stone-300 transition-colors"
                title="Request a Pause"
                aria-label="Request a Pause"
              >
                <PauseCircle size={18} />
              </button>

              {/* Talk to Type */}
              <button 
                onClick={toggleListening}
                className={`p-2 rounded-full transition-all duration-300 ${
                  isListening 
                    ? 'bg-teal-500 text-white shadow-lg shadow-teal-500/20 animate-pulse' 
                    : 'text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
                title={isListening ? "Stop Listening" : "Talk to Type"}
                aria-label="Toggle Speech Recognition"
              >
                {isListening ? <Mic size={18} /> : <MicOff size={18} />}
              </button>

              {/* Voice Toggle */}
              <button 
                onClick={toggleVoice}
                className={`p-2 rounded-full transition-all duration-300 ${
                  isVoiceEnabled 
                    ? 'bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200' 
                    : 'text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`}
                title={isVoiceEnabled ? "Mute Voice" : "Enable Voice"}
                aria-label="Toggle Voice Response"
              >
                {isVoiceEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
              </button>
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={isListening ? "Listening..." : COPY.inputPlaceholder}
              rows={1}
              className="flex-1 bg-transparent border-none px-3 py-2 text-stone-800 dark:text-stone-200 placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:ring-0 resize-none overflow-hidden min-h-[44px] font-light text-lg self-center"
              style={{ height: input ? Math.min(input.split('\n').length * 24 + 24, 150) + 'px' : '44px' }}
            />
            
            <button 
              onClick={handleSend}
              disabled={!input.trim()}
              className={`p-3 rounded-full transition-all duration-300 shrink-0 ${
                input.trim() 
                  ? 'bg-stone-800 dark:bg-stone-200 text-stone-100 dark:text-stone-900 shadow-lg hover:scale-105 active:scale-95' 
                  : 'bg-stone-200 dark:bg-stone-800 text-stone-400 dark:text-stone-600 opacity-50 cursor-not-allowed'
              }`}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SoftLoop;