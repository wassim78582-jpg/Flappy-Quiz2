import React, { useState, useCallback } from 'react';
import GameCanvas from './components/GameCanvas';
import QuizModal from './components/QuizModal';
import NoteUploader from './components/NoteUploader';
import { GameState, Question, ScoreBoard } from './types';
import { generateQuestionsFromText } from './services/geminiService';
import { Play, Trophy } from 'lucide-react';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [score, setScore] = useState<ScoreBoard>({ current: 0, best: 0 });
  const [activeTab, setActiveTab] = useState<'play' | 'notes'>('play');
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasQuestions, setHasQuestions] = useState(false);

  const handleScoreUpdate = useCallback((newScore: number) => {
    setScore(prev => {
      const newBest = Math.max(prev.best, newScore);
      return {
        current: newScore,
        best: newBest
      };
    });
  }, []);

  const handleCrash = useCallback(() => {
    setGameState(GameState.QUIZ);
  }, []);

  const handleQuizCorrect = () => {
    setGameState(GameState.MENU);
    setCurrentQuestionIndex(prev => (prev + 1) % questions.length);
  };

  const handleQuizIncorrect = () => {
    setCurrentQuestionIndex(prev => (prev + 1) % questions.length);
  };

  const handleGenerateQuestions = async (text: string) => {
    setIsGenerating(true);
    try {
      const newQuestions = await generateQuestionsFromText(text, 15);
      setQuestions(newQuestions);
      setHasQuestions(true);
      setCurrentQuestionIndex(0);
      setActiveTab('play');
      setGameState(GameState.MENU); 
    } catch (err) {
      console.error(err);
      alert("Could not process notes. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const useDefaultQuestions = async () => {
    const defaultText = `General knowledge trivia.`;
    await handleGenerateQuestions(defaultText);
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col items-center selection:bg-black selection:text-white">
      
      {/* Navbar / Header */}
      <header className="w-full max-w-[800px] p-6 flex justify-center items-center">
         <div className="flex items-center gap-3">
             <h1 className="text-xl font-black tracking-tighter text-black">Flappy Quiz</h1>
         </div>
      </header>

      <main className="flex-1 w-full max-w-[600px] flex flex-col items-center px-4 pb-12">
        {/* Header Text */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-black tracking-tighter text-black mb-2">Learn or Lose.</h1>
          <p className="text-gray-500 font-bold text-lg tracking-tight">The ultimate study accountability tool.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 w-full justify-center">
          <button
            onClick={() => setActiveTab('play')}
            className={`flex-1 max-w-[140px] py-3 rounded-xl font-black border-2 border-black transition-all duration-150 ${
              activeTab === 'play' 
                ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(100,100,100,1)] translate-y-[-2px]' 
                : 'bg-white text-black hover:bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none'
            }`}
          >
            PLAY
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex-1 max-w-[140px] py-3 rounded-xl font-black border-2 border-black transition-all duration-150 ${
              activeTab === 'notes' 
                ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(100,100,100,1)] translate-y-[-2px]' 
                : 'bg-white text-black hover:bg-gray-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-none'
            }`}
          >
            NOTES
          </button>
        </div>

        {/* Content Area */}
        <div className="w-full relative min-h-[500px] flex flex-col items-center">
          
          {/* Play View */}
          <div className={`${activeTab === 'play' ? 'flex' : 'hidden'} flex-col items-center w-full animate-in fade-in duration-300`}>
            <div className="relative w-full flex justify-center mb-6">
              <GameCanvas 
                gameState={gameState}
                onCrash={handleCrash}
                onScore={handleScoreUpdate}
                setGameState={setGameState}
              />
              
              {/* Quiz Overlay */}
              {gameState === GameState.QUIZ && questions.length > 0 && (
                <QuizModal 
                  question={questions[currentQuestionIndex]}
                  onCorrect={handleQuizCorrect}
                  onIncorrect={handleQuizIncorrect}
                />
              )}
              
              {/* No Questions State */}
              {gameState === GameState.QUIZ && questions.length === 0 && (
                <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm rounded-xl">
                    <div className="bg-white p-6 rounded-xl text-center border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                      <p className="font-black text-xl mb-4">No Notes Loaded!</p>
                      <button 
                        onClick={() => setActiveTab('notes')} 
                        className="bg-[#73bf2e] text-white px-6 py-3 rounded-lg font-bold border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-y-1 transition-all"
                      >
                        UPLOAD NOTES
                      </button>
                    </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 w-full max-w-[320px]">
              <div className="bg-white border-2 border-black p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center">
                  <div className="text-gray-500 text-xs font-black uppercase tracking-widest mb-1">Score</div>
                  <div className="text-4xl font-black text-black">{score.current}</div>
              </div>
              <div className="bg-[#f4ce42] border-2 border-black p-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center relative overflow-hidden">
                  <div className="text-black/60 text-xs font-black uppercase tracking-widest mb-1 z-10">Best</div>
                  <div className="text-4xl font-black text-black z-10">{score.best}</div>
                  <Trophy className="absolute -bottom-4 -right-4 w-16 h-16 text-white/30 rotate-12" />
              </div>
            </div>
            
          </div>

          {/* Notes View */}
          <div className={`${activeTab === 'notes' ? 'block' : 'hidden'} w-full max-w-[400px] animate-in fade-in slide-in-from-bottom-4 duration-300`}>
            <div className="bg-white rounded-2xl p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
              <div className="mb-6">
                  <h2 className="text-2xl font-black mb-2">Study Material</h2>
                  <p className="text-gray-600 font-medium leading-relaxed">
                    Upload your notes, articles, or lectures. The game will generate questions to test you when you crash.
                  </p>
              </div>

              <NoteUploader onGenerate={handleGenerateQuestions} isGenerating={isGenerating} />
              
              {!hasQuestions && (
                <div className="mt-6 pt-6 border-t-2 border-gray-100">
                  <button 
                      onClick={useDefaultQuestions}
                      disabled={isGenerating}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold py-4 rounded-xl border-2 border-transparent hover:border-black transition-all flex items-center justify-center text-sm gap-2"
                  >
                      <Play className="w-4 h-4" />
                      Load Random Trivia
                  </button>
                </div>
              )}

              {hasQuestions && (
                  <div className="mt-6 p-4 bg-[#73bf2e] border-2 border-black text-white rounded-xl font-bold text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    {questions.length} questions loaded. Go Play!
                  </div>
              )}
            </div>
          </div>

        </div>
      </main>

      <footer className="py-8 text-center">
        <a href="#" className="text-gray-400 font-bold hover:text-black transition-colors">
          Made by Wassim Benrabia
        </a>
      </footer>
    </div>
  );
};

export default App;