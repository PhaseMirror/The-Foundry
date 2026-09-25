import React, { useState, useRef } from 'react';
import { BookOpen, Save, Upload, FileText, X } from 'lucide-react';

interface UploadedFile {
  id: string;
  name: string;
  content: string;
}

const Library: React.FC = () => {
  const [curriculum, setCurriculum] = useState(() => localStorage.getItem('echo_curriculum') || '');
  const [sources, setSources] = useState<UploadedFile[]>(() => {
    const saved = localStorage.getItem('echo_curriculum_files');
    return saved ? JSON.parse(saved) : [];
  });
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCurriculumSave = () => {
    localStorage.setItem('echo_curriculum', curriculum);
    localStorage.setItem('echo_curriculum_files', JSON.stringify(sources));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const newSource: UploadedFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        content: content
      };
      const updatedSources = [...sources, newSource];
      setSources(updatedSources);
      localStorage.setItem('echo_curriculum_files', JSON.stringify(updatedSources));
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeSource = (id: string) => {
    const updated = sources.filter(s => s.id !== id);
    setSources(updated);
    localStorage.setItem('echo_curriculum_files', JSON.stringify(updated));
  };
  return (
    <div className="flex flex-col h-screen bg-stone-50 dark:bg-stone-950 text-stone-800 dark:text-stone-200 md:pl-20">
      <header className="sticky top-0 z-30 flex-shrink-0 px-4 py-3 bg-stone-50/80 dark:bg-stone-950/80 backdrop-blur-sm border-b border-stone-200 dark:border-stone-800">
        <h1 className="text-xl font-bold tracking-tight">Library</h1>
      </header>
      <main className="flex-1 p-6">
        <div className="bg-white dark:bg-stone-900 p-6 rounded-3xl border border-stone-200 dark:border-stone-800 transition-colors duration-300 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-stone-100 dark:bg-stone-800 rounded-full text-stone-600 dark:text-stone-400">
                < BookOpen size={18} />
              </div>
              <div>
                <h2 className="text-stone-700 dark:text-stone-300 font-medium">Session Curriculum</h2>
                <p className="text-xs text-stone-500 dark:text-stone-500">Guide the guide. Text instructions or reference documents.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-2 rounded-xl text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 transition-all"
                title="Upload Source File"
              >
                <Upload size={20} />
              </button>
              <button 
                onClick={handleCurriculumSave}
                className={`p-2 rounded-xl transition-all ${isSaved ? 'text-teal-500 bg-teal-50 dark:bg-teal-900/20' : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'}`}
                title="Save Curriculum"
              >
                <Save size={20} />
              </button>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileUpload}
              accept=".txt,.md,.json,.csv"
            />
          </div>
          
          <textarea 
            value={curriculum}
            onChange={(e) => setCurriculum(e.target.value)}
            placeholder="Example: Use Socratic questioning. Reference the 'Internal Family Systems' protocol..."
            className="w-full bg-stone-50 dark:bg-stone-800 border-none rounded-2xl px-4 py-4 text-stone-700 dark:text-stone-200 placeholder:text-stone-400 dark:placeholder:text-stone-600 focus:ring-1 focus:ring-stone-300 dark:focus:ring-stone-700 resize-none min-h-[120px] text-sm transition-colors duration-300 mb-4"
          />

          {sources.length > 0 && (
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-widest text-stone-500 dark:text-stone-500 font-bold mb-2">Attached Sources</p>
              {sources.map(source => (
                <div key={source.id} className="flex items-center justify-between p-3 bg-stone-50 dark:bg-stone-800 rounded-xl group">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText size={14} className="text-stone-500 flex-shrink-0" />
                    <span className="text-xs text-stone-700 dark:text-stone-300 truncate">{source.name}</span>
                  </div>
                  <button 
                    onClick={() => removeSource(source.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-stone-500 hover:text-red-500 transition-all"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Library;
