
import React, { useState } from 'react';
import { Upload, Play, Loader2 } from 'lucide-react';

interface NoteUploaderProps {
  onGenerate: (text: string) => Promise<void>;
  isGenerating: boolean;
}

const NoteUploader: React.FC<NoteUploaderProps> = ({ onGenerate, isGenerating }) => {
  const [text, setText] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setText(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-4">
      <textarea
        className="w-full h-40 p-4 bg-gray-50 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:translate-y-[2px] focus:shadow-none transition-all rounded-xl text-sm font-mono resize-none outline-none text-gray-800"
        placeholder="Paste your study notes here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        disabled={isGenerating}
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <label className={`flex-1 flex items-center justify-center gap-2 bg-white border-2 border-black text-black font-bold py-3 rounded-xl cursor-pointer transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[2px] ${isGenerating ? 'opacity-50 pointer-events-none' : ''}`}>
          <Upload className="w-4 h-4" />
          <span className="text-sm">Upload File</span>
          <input 
            type="file" 
            accept=".txt,.md,.json" 
            onChange={handleFileChange} 
            className="hidden" 
            disabled={isGenerating}
          />
        </label>
        
        <button
          onClick={() => onGenerate(text)}
          disabled={isGenerating || text.trim().length === 0}
          className="flex-[1.5] bg-black text-white hover:bg-gray-900 font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-[4px_4px_0px_0px_rgba(100,100,100,1)] active:shadow-none active:translate-y-[2px] disabled:bg-gray-300 disabled:border-gray-400 disabled:shadow-none disabled:cursor-not-allowed border-2 border-transparent"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Generating...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span className="text-sm">Start Game</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default NoteUploader;
