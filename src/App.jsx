import { useState, useEffect } from 'react';

const preguntas = [
  {
    id: 1,
    pregunta: "¿Cuál es el organismo encargado de supervisar la correcta aplicación de la Ley N° 32069?",
    respuesta: "OSCE"
  },
  {
    id: 2,
    pregunta: "¿Qué requisito es indispensable para que un proveedor participe en licitaciones públicas?",
    respuesta: "HABILITACION EN EL RNP"
  },
  {
    id: 3,
    pregunta: "¿Cómo se denomina el acto que se publica para formalizar la adjudicación de un proceso?",
    respuesta: "ACTA DE OTORGAMIENTO"
  },
  {
    id: 4,
    pregunta: "¿Cuál es el plazo máximo para que el proveedor subsane observaciones en su oferta?",
    respuesta: "TRES DIAS HABILES"
  },
  {
    id: 5,
    pregunta: "¿Qué plataforma oficial facilita la transparencia en las contrataciones públicas?",
    respuesta: "SEACE"
  }
];

export default function App() {
  const [gameMode, setGameMode] = useState('menu');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [usedQuestions, setUsedQuestions] = useState([]);

  const alfabeto = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');
  const maxWrongGuesses = 6;

  useEffect(() => {
    if (gameMode === 'ahorcado' && timeLeft > 0 && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !gameOver) {
      setGameOver(true);
      setWrongGuesses(maxWrongGuesses);
    }
  }, [timeLeft, gameMode, gameOver]);

  const getRandomQuestion = () => {
    const available = preguntas.filter(q => !usedQuestions.includes(q.id));
    if (available.length === 0) {
      setUsedQuestions([]);
      return preguntas[Math.floor(Math.random() * preguntas.length)];
    }
    return available[Math.floor(Math.random() * available.length)];
  };

  const startGame = (mode) => {
    const question = getRandomQuestion();
    setGameMode(mode);
    setCurrentQuestion(question);
    setUserAnswer('');
    setGuessedLetters([]);
    setWrongGuesses(0);
    setTimeLeft(30);
    setGameOver(false);
    setShowSuccess(false);
  };

  const handleLetterClick = (letter) => {
    if (guessedLetters.includes(letter) || gameOver) return;

    const newGuessed = [...guessedLetters, letter];
    setGuessedLetters(newGuessed);

    const normalizedAnswer = currentQuestion.respuesta.toUpperCase().replace(/\s/g, '');
    if (!normalizedAnswer.includes(letter)) {
      const newWrong = wrongGuesses + 1;
      setWrongGuesses(newWrong);
      if (newWrong >= maxWrongGuesses) {
        setGameOver(true);
      }
    } else {
      const allLetters = normalizedAnswer.split('').filter(l => l !== ' ');
      const uniqueLetters = [...new Set(allLetters)];
      const foundLetters = newGuessed.filter(l => uniqueLetters.includes(l));
      
      if (foundLetters.length === uniqueLetters.length) {
        setShowSuccess(true);
        setScore(score + 1);
        setUsedQuestions([...usedQuestions, currentQuestion.id]);
        setTimeout(() => {
          startGame('ahorcado');
        }, 2000);
      }
    }
  };

  const handleDirectAnswer = () => {
    const normalized = userAnswer.toUpperCase().trim();
    const correct = currentQuestion.respuesta.toUpperCase().trim();
    
    if (normalized === correct) {
      setShowSuccess(true);
      setScore(score + 1);
      setUsedQuestions([...usedQuestions, currentQuestion.id]);
      setTimeout(() => {
        const question = getRandomQuestion();
        setCurrentQuestion(question);
        setUserAnswer('');
        setShowSuccess(false);
      }, 2000);
    } else {
      alert('Respuesta incorrecta. Intenta de nuevo.');
      setUserAnswer('');
    }
  };

  const displayWord = () => {
    if (!currentQuestion) return '';
    return currentQuestion.respuesta.split('').map((char, idx) => {
      if (char === ' ') return ' ';
      const upperChar = char.toUpperCase();
      return guessedLetters.includes(upperChar) ? upperChar : '_';
    }).join(' ');
  };

  const renderHangman = () => {
    const parts = [
      <line key="base" x1="20" y1="180" x2="180" y2="180" stroke="white" strokeWidth="3" />,
      <line key="pole" x1="60" y1="180" x2="60" y2="20" stroke="white" strokeWidth="3" />,
      <line key="top" x1="60" y1="20" x2="140" y2="20" stroke="white" strokeWidth="3" />,
      <line key="rope" x1="140" y1="20" x2="140" y2="50" stroke="white" strokeWidth="3" />,
      <circle key="head" cx="140" cy="70" r="20" stroke="white" strokeWidth="3" fill="none" />,
      <line key="body" x1="140" y1="90" x2="140" y2="130" stroke="white" strokeWidth="3" />
    ];
    return parts.slice(0, wrongGuesses + 1);
  };

  if (gameMode === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
          <h1 className="text-4xl font-bold text-center text-blue-900 mb-4">
            🎮 Juego de Preguntas OSCE
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Pon a prueba tus conocimientos sobre contrataciones públicas
          </p>
          
          <div className="space-y-4">
            <button
              onClick={() => startGame('ahorcado')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg transition duration-200 text-xl"
            >
              🎯 Juego del Ahorcado
            </button>
            
            <button
              onClick={() => startGame('directo')}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition duration-200 text-xl"
            >
              ⚡ Respuesta Directa
            </button>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <p className="text-center text-blue-900 font-semibold">
              Puntuación actual: {score}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (gameMode === 'ahorcado') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setGameMode('menu')}
              className="bg-white text-blue-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100"
            >
              ← Menú
            </button>
            <div className="text-white text-2xl font-bold">
              Puntos: {score}
            </div>
            <div className="text-white text-2xl font-bold">
              ⏱️ {timeLeft}s
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">
              {currentQuestion?.pregunta}
            </h2>

            <div className="flex justify-center mb-8">
              <svg width="200" height="200" className="bg-blue-100 rounded-lg">
                {renderHangman()}
              </svg>
            </div>

            <div className="text-3xl font-mono text-center mb-8 text-blue-900 tracking-wider">
              {displayWord()}
            </div>

            <div className="grid grid-cols-9 gap-2 mb-6">
              {alfabeto.map(letter => (
                <button
                  key={letter}
                  onClick={() => handleLetterClick(letter)}
                  disabled={guessedLetters.includes(letter) || gameOver}
                  className={`p-3 rounded-lg font-bold text-lg transition duration-200 ${
                    guessedLetters.includes(letter)
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>

            {showSuccess && (
              <div className="bg-green-100 border-2 border-green-500 text-green-800 px-4 py-3 rounded-lg text-center font-bold">
                ¡Correcto! +1 punto
              </div>
            )}

            {gameOver && (
              <div className="bg-red-100 border-2 border-red-500 text-red-800 px-4 py-3 rounded-lg text-center">
                <p className="font-bold mb-2">Juego terminado</p>
                <p className="mb-4">La respuesta era: {currentQuestion?.respuesta}</p>
                <button
                  onClick={() => startGame('ahorcado')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Nueva pregunta
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (gameMode === 'directo') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-700 to-green-500 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setGameMode('menu')}
              className="bg-white text-green-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100"
            >
              ← Menú
            </button>
            <div className="text-white text-2xl font-bold">
              Puntos: {score}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <h2 className="text-2xl font-bold text-green-900 mb-8 text-center">
              {currentQuestion?.pregunta}
            </h2>

            <div className="space-y-4">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleDirectAnswer()}
                placeholder="Escribe tu respuesta aquí..."
                className="w-full p-4 border-2 border-green-300 rounded-lg text-lg focus:outline-none focus:border-green-500"
              />
              
              <button
                onClick={handleDirectAnswer}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-lg transition duration-200 text-xl"
              >
                Enviar respuesta
              </button>
            </div>

            {showSuccess && (
              <div className="mt-6 bg-green-100 border-2 border-green-500 text-green-800 px-4 py-3 rounded-lg text-center font-bold">
                ¡Correcto! +1 punto
              </div>
            )}

            <div className="mt-8 text-center text-gray-600">
              <p className="text-sm">Tienes 10 segundos para leer la pregunta antes de responder</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}