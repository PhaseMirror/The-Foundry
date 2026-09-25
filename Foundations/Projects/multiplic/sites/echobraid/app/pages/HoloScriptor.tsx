import React, { useState, useEffect, useRef } from 'react';
import { PRIME_PROMPTS } from '../constants';
import { PrimePrompt } from '../types';
import { Hash, Mic, MicOff, Volume2, PlayCircle, StopCircle, Trash2 } from 'lucide-react';
import { generateSpeech } from '../services/resonanceEngine';

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

const HoloScriptor: React.FC = () => {
  // Persistence Initialization
  const [selectedPrompt, setSelectedPrompt] = useState<PrimePrompt | null>(() => {
    const savedId = localStorage.getItem('holo_prompt_id');
    if (savedId) {
        return PRIME_PROMPTS.find(p => p.id === savedId) || null;
    }
    return null;
  });

  const [journalEntry, setJournalEntry] = useState(() => {
    return localStorage.getItem('holo_journal') || '';
  });

  // UI State
  const [isListening, setIsListening] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Persistence Effects
  useEffect(() => {
    if (selectedPrompt) {
        localStorage.setItem('holo_prompt_id', selectedPrompt.id);
    } else {
        localStorage.removeItem('holo_prompt_id');
    }
  }, [selectedPrompt]);

  useEffect(() => {
    localStorage.setItem('holo_journal', journalEntry);
  }, [journalEntry]);

  // Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTranscript) {
          setJournalEntry(prev => prev + finalTranscript);
        }
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }

    return () => {
      recognitionRef.current?.stop();
      audioSourceRef.current?.stop();
    };
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

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      if (selectedPrompt) {
        recognitionRef.current?.start();
        setIsListening(true);
      }
    }
  };

  const handleReadAloud = async () => {
    if (isPlaying) {
      audioSourceRef.current?.stop();
      setIsPlaying(false);
      return;
    }

    if (!journalEntry.trim()) return;

    setIsPlaying(true);
    initAudioContext();
    
    try {
      const audioData = await generateSpeech(journalEntry);
      if (audioData && audioCtxRef.current) {
        const audioBuffer = await decodeAudioData(
          decode(audioData),
          audioCtxRef.current,
          24000,
          1
        );
        
        const source = audioCtxRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtxRef.current.destination);
        source.onended = () => setIsPlaying(false);
        audioSourceRef.current = source;
        source.start();
      } else {
        setIsPlaying(false);
      }
    } catch (e) {
      console.error("Read aloud failed", e);
      setIsPlaying(false);
    }
  };

  const handleClear = () => {
    if (window.confirm("Clear this reflection? The words will fade, leaving space for new ones.")) {
      setJournalEntry('');
      setSelectedPrompt(null);
      localStorage.removeItem('holo_journal');
      localStorage.removeItem('holo_prompt_id');
      if (isListening) recognitionRef.current?.stop();
      if (isPlaying) audioSourceRef.current?.stop();
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 md:pl-20 p-6 transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-light text-stone-700 dark:text-stone-200 mb-2">Holo-Scriptor</h1>
            <p className="text-stone-400 dark:text-stone-500 text-sm">Linearity is optional. Start anywhere.</p>
          </div>
          
          <div className="flex items-center gap-2 bg-white dark:bg-stone-900 p-2 rounded-2xl border border-stone-100 dark:border-stone-800 shadow-sm">
            <button 
              onClick={handleReadAloud}
              disabled={!journalEntry.trim()}
              className={`p-3 rounded-xl transition-all duration-300 flex items-center gap-2 ${
                isPlaying 
                  ? 'bg-stone-800 text-stone-100 dark:bg-stone-100 dark:text-stone-900' 
                  : 'text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 disabled:opacity-30'
              }`}
              title={isPlaying ? "Stop Reading" : "Read Reflection Aloud"}
            >
              {isPlaying ? <StopCircle size={20} /> : <Volume2 size={20} />}
              <span className="text-xs font-medium hidden sm:inline">Read Aloud</span>
            </button>
            
            <div className="w-px h-6 bg-stone-100 dark:bg-stone-800" />

            <button 
              onClick={toggleListening}
              disabled={!selectedPrompt}
              className={`p-3 rounded-xl transition-all duration-300 flex items-center gap-2 ${
                isListening 
                  ? 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400 animate-pulse' 
                  : 'text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800 disabled:opacity-30'
              }`}
              title={isListening ? "Stop Listening" : "Talk to Type"}
            >
              {isListening ? <Mic size={20} /> : <MicOff size={20} />}
              <span className="text-xs font-medium hidden sm:inline">Voice Type</span>
            </button>
          </div>
        </header>

        {/* Prime Board */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {PRIME_PROMPTS.map((prompt) => (
            <button
              key={prompt.id}
              onClick={() => setSelectedPrompt(prompt)}
              className={`
                text-left p-6 rounded-[2rem] border transition-all duration-300
                ${selectedPrompt?.id === prompt.id 
                  ? 'bg-white dark:bg-stone-800 border-stone-400 dark:border-stone-500 shadow-md transform scale-[1.01]' 
                  : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-800 hover:border-stone-300 dark:hover:border-stone-600 hover:shadow-sm'}
              `}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-300 dark:text-stone-600">
                  Prime {prompt.prime} • {prompt.category}
                </span>
                <Hash size={14} className="text-stone-200 dark:text-stone-700" />
              </div>
              <p className="text-stone-600 dark:text-stone-300 font-medium leading-relaxed">
                {prompt.text}
              </p>
            </button>
          ))}
        </div>

        {/* Writing Area */}
        <div className={`transition-all duration-700 ${selectedPrompt ? 'opacity-100 translate-y-0' : 'opacity-40 translate-y-4'}`}>
          <div className={`bg-white dark:bg-stone-900 rounded-[2.5rem] p-8 border shadow-sm min-h-[450px] flex flex-col transition-all duration-300 ${isListening ? 'border-teal-200 dark:border-teal-800 ring-2 ring-teal-50 dark:ring-teal-900/10' : 'border-stone-100 dark:border-stone-800'}`}>
            <div className="flex-1">
                <textarea
                className="w-full h-full min-h-[350px] resize-none border-none focus:ring-0 text-stone-700 dark:text-stone-200 text-xl leading-relaxed font-serif placeholder:text-stone-200 dark:placeholder:text-stone-700 bg-transparent"
                placeholder={selectedPrompt ? (isListening ? "Listening to your resonance..." : "The space is yours...") : "Select a Prime Tile above to begin your reflection."}
                value={journalEntry}
                onChange={(e) => setJournalEntry(e.target.value)}
                disabled={!selectedPrompt}
                />
            </div>
            
            <div className="mt-8 flex flex-col sm:flex-row justify-between items-center border-t border-stone-100 dark:border-stone-800 pt-6 gap-4">
               <div className="flex gap-2 flex-wrap justify-center">
                 {['#clarity', '#needs', '#unsaid', '#regulation'].map(tag => (
                   <button key={tag} className="px-4 py-1.5 rounded-full bg-stone-50 dark:bg-stone-800 text-stone-400 dark:text-stone-500 text-xs hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors border border-transparent hover:border-stone-200 dark:hover:border-stone-700">
                     {tag}
                   </button>
                 ))}
               </div>
               
               <button 
                 className="flex items-center gap-2 text-stone-300 hover:text-red-400 dark:text-stone-700 dark:hover:text-red-400/80 text-sm transition-colors group"
                 onClick={handleClear}
               >
                 <Trash2 size={16} className="group-hover:scale-110 transition-transform" />
                 <span>Incinerate Reflection</span>
               </button>
            </div>
          </div>
        </div>

        <footer className="mt-12 text-center text-stone-300 dark:text-stone-700 text-xs font-mono uppercase tracking-widest">
            Non-Linear Coprocessing Loop Active
        </footer>
      </div>
    </div>
  );
};

export default HoloScriptor;