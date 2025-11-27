
import React, { useRef, useEffect, useCallback } from 'react';
import { GameState } from '../types';
import { 
  GAME_WIDTH, GAME_HEIGHT, GRAVITY, JUMP_STRENGTH, 
  PIPE_SPEED, PIPE_SPAWN_RATE, PIPE_GAP, PIPE_WIDTH, 
  BIRD_SIZE, COLORS, GROUND_HEIGHT
} from '../constants';

interface GameCanvasProps {
  gameState: GameState;
  onCrash: () => void;
  onScore: (score: number) => void;
  setGameState: (state: GameState) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, onCrash, onScore, setGameState }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  
  // Game Entities
  const birdY = useRef(GAME_HEIGHT / 2);
  const birdVelocity = useRef(0);
  const birdRotation = useRef(0);
  const pipes = useRef<{ x: number; topHeight: number; passed: boolean }[]>([]);
  const frameCount = useRef(0);
  const scoreRef = useRef(0);

  const resetGame = useCallback(() => {
    birdY.current = GAME_HEIGHT / 2;
    birdVelocity.current = 0;
    birdRotation.current = 0;
    pipes.current = [];
    frameCount.current = 0;
    scoreRef.current = 0;
    onScore(0);
  }, [onScore]);

  const jump = useCallback(() => {
    if (gameState === GameState.PLAYING) {
      birdVelocity.current = JUMP_STRENGTH;
    } else if (gameState === GameState.MENU) {
      setGameState(GameState.PLAYING);
      resetGame();
      birdVelocity.current = JUMP_STRENGTH;
    }
  }, [gameState, setGameState, resetGame]);

  // Input Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        jump();
      }
    };
    
    const handleTouch = (e: TouchEvent) => {
        if (gameState === GameState.PLAYING || (e.target as HTMLElement).tagName === 'CANVAS') {
           e.preventDefault(); 
           jump();
        }
    };

    const handleMouseDown = (e: MouseEvent) => {
        if((e.target as HTMLElement).tagName === 'CANVAS') {
            e.preventDefault();
            jump();
        }
    }

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouch, { passive: false });
    window.addEventListener('mousedown', handleMouseDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('touchstart', handleTouch);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [jump, gameState]);

  // The Game Loop
  const loop = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // --- Physics ---
    if (gameState === GameState.PLAYING) {
      birdVelocity.current += GRAVITY;
      birdY.current += birdVelocity.current;

      // Rotation logic
      if (birdVelocity.current < 0) {
        birdRotation.current = -25 * (Math.PI / 180);
      } else {
        birdRotation.current += 3 * (Math.PI / 180);
        if (birdRotation.current > 90 * (Math.PI / 180)) {
            birdRotation.current = 90 * (Math.PI / 180);
        }
      }

      frameCount.current++;
      
      // Spawn Pipes
      if (frameCount.current % PIPE_SPAWN_RATE === 0) {
        const minPipeHeight = 50;
        const maxPipeHeight = GAME_HEIGHT - GROUND_HEIGHT - PIPE_GAP - minPipeHeight;
        const randomHeight = Math.floor(Math.random() * (maxPipeHeight - minPipeHeight + 1) + minPipeHeight);
        
        pipes.current.push({
          x: GAME_WIDTH,
          topHeight: randomHeight,
          passed: false
        });
      }

      // Update Pipes
      for (let i = pipes.current.length - 1; i >= 0; i--) {
        const pipe = pipes.current[i];
        pipe.x -= PIPE_SPEED;

        // Collision Detection
        const hitboxPadding = 6; // slightly forgiving
        const birdLeft = (GAME_WIDTH / 2 - BIRD_SIZE / 2) + hitboxPadding;
        const birdRight = (GAME_WIDTH / 2 + BIRD_SIZE / 2) - hitboxPadding;
        const birdTop = birdY.current + hitboxPadding;
        const birdBottom = birdY.current + BIRD_SIZE - hitboxPadding;

        const pipeLeft = pipe.x;
        const pipeRight = pipe.x + PIPE_WIDTH;
        const topPipeBottom = pipe.topHeight;
        const bottomPipeTop = pipe.topHeight + PIPE_GAP;

        const hitTopPipe = birdRight > pipeLeft && birdLeft < pipeRight && birdTop < topPipeBottom;
        const hitBottomPipe = birdRight > pipeLeft && birdLeft < pipeRight && birdBottom > bottomPipeTop;

        if (hitTopPipe || hitBottomPipe) {
          onCrash();
        }

        // Score
        if (!pipe.passed && pipe.x + PIPE_WIDTH < (GAME_WIDTH / 2 - BIRD_SIZE / 2)) {
          pipe.passed = true;
          scoreRef.current += 1;
          onScore(scoreRef.current);
        }

        // Remove off-screen pipes
        if (pipe.x < -PIPE_WIDTH) {
          pipes.current.splice(i, 1);
        }
      }

      // Ground Collision
      if (birdY.current + BIRD_SIZE >= GAME_HEIGHT - GROUND_HEIGHT) {
        birdY.current = GAME_HEIGHT - GROUND_HEIGHT - BIRD_SIZE;
        onCrash();
      }
    }

    // --- Rendering ---
    
    // 1. Sky
    ctx.fillStyle = COLORS.sky;
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    
    // 2. Decor (Clouds)
    ctx.fillStyle = '#b7e8eb'; // Faint cloud color
    // Simple clouds
    ctx.fillRect(40, 300, 60, 20);
    ctx.fillRect(150, 350, 80, 24);
    ctx.fillRect(280, 280, 50, 18);


    // 3. Pipes
    // Render order: Pipes behind ground
    pipes.current.forEach(pipe => {
      const outlineColor = '#543847'; 
      const mainColor = '#73bf2e'; 
      const lightColor = '#9ce659'; 
      const darkColor = '#558c22'; 
      const capHeight = 26;

      ctx.lineWidth = 3; // Thicker outline for visibility
      ctx.strokeStyle = outlineColor;

      // --- Top Pipe ---
      const topHeight = pipe.topHeight;
      // Body
      ctx.fillStyle = mainColor;
      ctx.beginPath();
      ctx.rect(pipe.x, 0, PIPE_WIDTH, topHeight);
      ctx.fill();
      ctx.stroke();
      
      // Cap
      ctx.beginPath();
      ctx.rect(pipe.x - 2, topHeight - capHeight, PIPE_WIDTH + 4, capHeight);
      ctx.fill();
      ctx.stroke();

      // Highlights
      ctx.fillStyle = lightColor; // Light strip
      ctx.fillRect(pipe.x + 2, 0, 4, topHeight - capHeight); 
      ctx.fillRect(pipe.x, topHeight - capHeight + 2, 4, capHeight - 4);
      
      // Shadows
      ctx.fillStyle = darkColor;
      ctx.fillRect(pipe.x + PIPE_WIDTH - 6, 0, 4, topHeight - capHeight);
      ctx.fillRect(pipe.x + PIPE_WIDTH - 4, topHeight - capHeight + 2, 4, capHeight - 4);

      // --- Bottom Pipe ---
      const bottomY = topHeight + PIPE_GAP;
      const bottomHeight = GAME_HEIGHT - GROUND_HEIGHT - bottomY;
      
      // Body
      ctx.fillStyle = mainColor;
      ctx.beginPath();
      ctx.rect(pipe.x, bottomY, PIPE_WIDTH, bottomHeight);
      ctx.fill();
      ctx.stroke();

      // Cap
      ctx.beginPath();
      ctx.rect(pipe.x - 2, bottomY, PIPE_WIDTH + 4, capHeight);
      ctx.fill();
      ctx.stroke();
      
      // Highlights
      ctx.fillStyle = lightColor;
      ctx.fillRect(pipe.x + 2, bottomY + capHeight, 4, bottomHeight); 
      ctx.fillRect(pipe.x, bottomY + 2, 4, capHeight - 4);

       // Shadows
       ctx.fillStyle = darkColor;
       ctx.fillRect(pipe.x + PIPE_WIDTH - 6, bottomY + capHeight, 4, bottomHeight);
       ctx.fillRect(pipe.x + PIPE_WIDTH - 4, bottomY + 2, 4, capHeight - 4);

    });

    // 4. Ground
    const groundY = GAME_HEIGHT - GROUND_HEIGHT;
    
    // Top Border Line
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#543847';
    
    // Scroll effect
    // We draw a repeating pattern
    const groundScroll = (frameCount.current * PIPE_SPEED) % 18; 
    
    ctx.fillStyle = '#ded895'; // Light sand
    ctx.fillRect(0, groundY, GAME_WIDTH, GROUND_HEIGHT);
    
    // Top Grass Layer
    ctx.fillStyle = '#73bf2e';
    ctx.fillRect(0, groundY, GAME_WIDTH, 14);
    
    // Border between grass and sand
    ctx.beginPath();
    ctx.moveTo(0, groundY + 14);
    ctx.lineTo(GAME_WIDTH, groundY + 14);
    ctx.stroke();

    // Top border of ground
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(GAME_WIDTH, groundY);
    ctx.stroke();

    // Diagonal lines on Grass (classic look)
    ctx.strokeStyle = '#558c22';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = -20; i < GAME_WIDTH + 20; i += 18) {
       const x = i - groundScroll;
       ctx.moveTo(x, groundY);
       ctx.lineTo(x - 10, groundY + 14);
    }
    ctx.stroke();

    // 5. Bird
    const birdX = GAME_WIDTH / 2 - BIRD_SIZE / 2;
    ctx.save();
    ctx.translate(birdX + BIRD_SIZE/2, birdY.current + BIRD_SIZE/2);
    ctx.rotate(birdRotation.current);
    
    const r = BIRD_SIZE/2;
    
    // Bird Body
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#543847';
    ctx.fillStyle = '#f4ce42';
    
    // Main shape
    ctx.beginPath();
    ctx.ellipse(0, 0, r, r * 0.8, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.stroke();
    
    // Eye
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(r/2, -r/4, r/2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Pupil
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(r/2 + 3, -r/4, 2, 0, Math.PI * 2);
    ctx.fill();

    // Wing
    ctx.fillStyle = '#e8dfcd';
    ctx.beginPath();
    ctx.ellipse(-r/3, r/6, r/2, r/3, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.stroke();

    // Beak
    ctx.fillStyle = '#f46327';
    ctx.beginPath();
    ctx.ellipse(r/2, r/4, r/3, r/5, 0, 0, Math.PI*2);
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();
    
    requestRef.current = requestAnimationFrame(loop);
  }, [gameState, onCrash, onScore]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [loop]);

  useEffect(() => {
    if (gameState === GameState.MENU) {
      resetGame();
    }
  }, [gameState, resetGame]);

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] border-4 border-black select-none bg-black">
      <canvas
        ref={canvasRef}
        width={GAME_WIDTH}
        height={GAME_HEIGHT}
        className="block bg-[#70c5ce] w-full h-auto max-w-[320px] max-h-[480px] touch-none cursor-pointer mx-auto"
        style={{ imageRendering: 'pixelated' }}
      />
      
      {/* Start Screen Overlay */}
      {gameState === GameState.MENU && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
           <div className="bg-white border-2 border-black px-6 py-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-bounce">
             <p className="font-black text-black text-xl">TAP TO JUMP</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default GameCanvas;
