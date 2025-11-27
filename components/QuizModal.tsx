
import React, { useState } from 'react';
import { Question } from '../types';
import { Check, X, Brain } from 'lucide-react';

interface QuizModalProps {
  question: Question;
  onCorrect: () => void;
  onIncorrect: () => void;
}

const QuizModal: React.FC<QuizModalProps> = ({ question, onCorrect, onIncorrect }) => {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  const handleSelect = (index: number) => {
    if (showFeedback) return;
    
    setSelectedOption(index);
    setShowFeedback(true);

    if (index === question.correctIndex) {
      setTimeout(onCorrect, 1000);
    } else {
      setTimeout(() => {
        setShowFeedback(false);
        setSelectedOption(null);
        onIncorrect(); 
      }, 1500);
    }
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
      <div className="bg-white w-full max-w-[300px] rounded-2xl p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black text-center">
        
        <div className="mb-6 flex flex-col items-center">
          <div className="bg-black text-white p-3 rounded-full mb-3 shadow-[4px_4px_0px_0px_rgba(100,100,100,1)]">
             <Brain size={24} />
          </div>
          <h3 className="text-xl font-black text-black leading-tight">
            {question.text}
          </h3>
        </div>

        <div className="space-y-3">
          {question.options.map((option, idx) => {
            let btnClass = "w-full p-4 rounded-xl font-bold text-sm transition-all duration-150 flex items-center justify-between border-2 border-black ";
            let shadowClass = "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-[2px] ";

            if (showFeedback) {
              shadowClass = "shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-y-[2px] "; // Pressed state
              if (idx === question.correctIndex) {
                btnClass += "bg-[#73bf2e] border-black text-white ";
              } else if (idx === selectedOption) {
                btnClass += "bg-[#e04848] border-black text-white ";
              } else {
                btnClass += "bg-gray-100 text-gray-400 opacity-50 ";
              }
            } else {
              btnClass += "bg-white text-black hover:bg-gray-50 ";
            }

            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={showFeedback}
                className={btnClass + shadowClass}
              >
                <span className="text-left flex-1">{option}</span>
                {showFeedback && idx === question.correctIndex && <Check className="w-5 h-5 ml-2 stroke-[3]" />}
                {showFeedback && idx === selectedOption && idx !== question.correctIndex && <X className="w-5 h-5 ml-2 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuizModal;
