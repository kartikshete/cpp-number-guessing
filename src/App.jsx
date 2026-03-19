import React, { useState, useEffect, useRef } from 'react';
import { Target, RefreshCw, Trophy, Zap, Moon, Sun, ChevronRight, AlertCircle, Hash } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const DIFFICULTIES = {
  EASY: { name: 'Easy', range: 50, attempts: 10, multiplier: 1 },
  MEDIUM: { name: 'Medium', range: 100, attempts: 7, multiplier: 2 },
  HARD: { name: 'Hard', range: 250, attempts: 5, multiplier: 5 }
};

function App() {
  const [theme, setTheme] = useState('light');
  const [difficulty, setDifficulty] = useState('EASY');
  const [targetNumber, setTargetNumber] = useState(0);
  const [guess, setGuess] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState({ text: 'Select a difficulty and start guessing!', type: 'info' });
  const [isGameOver, setIsGameOver] = useState(false);
  const [score, setScore] = useState(0);


  const inputRef = useRef(null);

  useEffect(() => {
    startNewGame();
    // Default system theme detection or manual default light
    const savedTheme = localStorage.getItem('theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const startNewGame = (diff = difficulty) => {
    const range = DIFFICULTIES[diff].range;
    setTargetNumber(Math.floor(Math.random() * range) + 1);
    setAttempts(0);
    setHistory([]);
    setGuess('');
    setIsGameOver(false);
    setMessage({ text: `I'm thinking of a number between 1 and ${range}...`, type: 'info' });
    setDifficulty(diff);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleGuess = (e) => {
    e.preventDefault();
    if (isGameOver) return;

    const numGuess = parseInt(guess);

    // Safety Validation
    if (isNaN(numGuess) || numGuess < 1 || numGuess > DIFFICULTIES[difficulty].range) {
      setMessage({ text: `Please enter a valid number between 1 and ${DIFFICULTIES[difficulty].range}.`, type: 'error' });
      return;
    }

    const newAttempts = attempts + 1;
    setAttempts(newAttempts);

    if (numGuess === targetNumber) {
      const finalScore = (DIFFICULTIES[difficulty].attempts - attempts) * DIFFICULTIES[difficulty].multiplier * 100;
      setScore(prev => prev + Math.max(finalScore, 50));
      setMessage({ text: `🎉 BINGO! You found it in ${newAttempts} attempts!`, type: 'success' });
      setIsGameOver(true);
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: [theme === 'light' ? '#000000' : '#ffffff', '#10b981', '#f59e0b']
      });
    } else if (newAttempts >= DIFFICULTIES[difficulty].attempts) {
      setMessage({ text: `💀 Game Over! The number was ${targetNumber}.`, type: 'error' });
      setIsGameOver(true);
    } else {
      const diffStr = numGuess > targetNumber ? 'Too High' : 'Too Low';
      setMessage({ text: `${diffStr}! Try again.`, type: 'info' });
      setHistory([{ val: numGuess, type: numGuess > targetNumber ? 'high' : 'low' }, ...history]);
      setGuess('');
      inputRef.current.focus();
    }
  };

  return (
    <div className="auth-container">
      <header>
        <div className="brand">
          <div className="brand-icon">
            <Hash size={24} strokeWidth={3} />
          </div>
          <motion.h1
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
          >
            QuestNumber
          </motion.h1>
        </div>
        <div className="flex gap-3">

          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </header>

      <main>
        <section className="hero-section">
          <motion.h2
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            Number Guessing Game
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            Master logic building through C++ concepts. Choose your difficulty and crack the code.
          </motion.p>
        </section>

        {!isGameOver && attempts === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="difficulty-grid"
          >
            {Object.entries(DIFFICULTIES).map(([key, value]) => (
              <div
                key={key}
                className={`difficulty-card \${difficulty === key ? 'active' : ''}`}
                onClick={() => startNewGame(key)}
              >
                <Zap size={20} className="mb-2" />
                <h3>{value.name}</h3>
                <p>1 - {value.range}</p>
                <p>{value.attempts} Attempts</p>
              </div>
            ))}
          </motion.div>
        )}

        <div className="card">
          <AnimatePresence mode="wait">
            <motion.div
              key={message.text}
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`feedback-msg msg-\${message.type}`}
            >
              <div className="flex items-center justify-center gap-2">
                {message.type === 'error' && <AlertCircle size={18} />}
                {message.type === 'success' && <Trophy size={18} />}
                <span>{message.text}</span>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="stats-bar">
            <div className="stat-item">
              <span className="stat-value">{DIFFICULTIES[difficulty].attempts - attempts}</span>
              <span className="stat-label">Lives Left</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">{score}</span>
              <span className="stat-label">Total XP</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">1-{DIFFICULTIES[difficulty].range}</span>
              <span className="stat-label">Range</span>
            </div>
          </div>

          {!isGameOver ? (
            <form onSubmit={handleGuess} className="game-area">
              <div className="input-container">
                <input
                  ref={inputRef}
                  type="number"
                  placeholder="Enter your guess..."
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  disabled={isGameOver}
                  autoFocus
                />
                <button type="submit" className="guess-btn" disabled={!guess || isGameOver}>
                  Guess <ChevronRight size={18} className="inline ml-1" />
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center">
              <button className="guess-btn" onClick={() => startNewGame()}>
                <RefreshCw size={18} className="inline mr-2" /> Play Again
              </button>
            </div>
          )}

          {history.length > 0 && (
            <div className="history-section">
              <h4 className="text-sm font-bold text-slate-500 uppercase mb-3">Guess Timeline</h4>
              <div className="history-list">
                {history.map((h, i) => (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    key={i}
                    className={`history-badge \${h.type === 'high' ? 'too-high' : 'too-low'}`}
                  >
                    {h.val} {h.type === 'high' ? '↑' : '↓'}
                  </motion.span>
                ))}
              </div>
            </div>
          )}
        </div>


      </main>

      <footer>
        <p>© 2026 NumberQuest | Logic Building Project</p>
      </footer>
    </div>
  );
}

export default App;
