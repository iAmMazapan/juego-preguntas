import { useState, useEffect } from 'react';

const preguntas = [
  {
    id: 1,
    pregunta: "¿Cuál es el organismo encargado de supervisar la correcta aplicación de la Ley N° 32069?",
    respuesta: "OSCE",
    posicion: { fila: 4, col: 2, direccion: "vertical" } // S en fila 6, col 2
  },
  {
    id: 2,
    pregunta: "¿Qué requisito es indispensable para que un proveedor participe en licitaciones públicas?",
    respuesta: "HABILITACIONENELRNP",
    posicion: { fila: 2, col: 0, direccion: "horizontal" } // T en pos 6, col 6
  },
  {
    id: 3,
    pregunta: "¿Cómo se denomina el acto que se publica para formalizar la adjudicación de un proceso?",
    respuesta: "ACTADEOTORGAMIENTO",
    posicion: { fila: 0, col: 6, direccion: "vertical" } // pos 2 (fila 2), pos 5 (fila 5), pos 13 (fila 13)
  },
  {
    id: 4,
    pregunta: "¿Cuál es el plazo máximo para que el proveedor subsane observaciones en su oferta?",
    respuesta: "TRESDIASHABILES",
    posicion: { fila: 13, col: 1, direccion: "horizontal" } // I en pos 5 = col 6
  },
  {
    id: 5,
    pregunta: "¿Qué plataforma oficial facilita la transparencia en las contrataciones públicas?",
    respuesta: "SEACE",
    posicion: { fila: 5, col: 2, direccion: "horizontal" } // S en col 2, E en pos 4 = col 6
  }
];

export default function App() {
  const [vista, setVista] = useState('crucigrama');
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gameOver, setGameOver] = useState(false);
  const [crucigramaCompleto, setCrucigramaCompleto] = useState({});
  const [juegoTerminado, setJuegoTerminado] = useState(false);

  const alfabeto = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');
  const maxWrongGuesses = 6;

  useEffect(() => {
    if (vista === 'ahorcado' && timeLeft > 0 && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && vista === 'ahorcado' && !gameOver) {
      setGameOver(true);
      setWrongGuesses(maxWrongGuesses);
    }
  }, [timeLeft, vista, gameOver]);

  const selectQuestion = (questionId) => {
    if (crucigramaCompleto[questionId]) return;
    
    const question = preguntas.find(q => q.id === questionId);
    setCurrentQuestion(question);
    setGuessedLetters([]);
    setWrongGuesses(0);
    setTimeLeft(30);
    setGameOver(false);
    setVista('ahorcado');
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
      const allLetters = normalizedAnswer.split('');
      const uniqueLetters = [...new Set(allLetters)];
      const foundLetters = newGuessed.filter(l => uniqueLetters.includes(l));
      
      if (foundLetters.length === uniqueLetters.length) {
        const newCompleted = { ...crucigramaCompleto, [currentQuestion.id]: currentQuestion.respuesta };
        
        // Llenar automáticamente las intersecciones
        const updatedCompleted = fillIntersections(newCompleted);
        setCrucigramaCompleto(updatedCompleted);
        
        setTimeout(() => {
          setVista('crucigrama');
          setCurrentQuestion(null);
          
          if (Object.keys(updatedCompleted).length === preguntas.length) {
            setJuegoTerminado(true);
          }
        }, 1500);
      }
    }
  };

  const fillIntersections = (completed) => {
    const newCompleted = { ...completed };
    
    // Buscar intersecciones entre palabras ya completadas
    const completedQuestions = preguntas.filter(p => newCompleted[p.id]);
    
    completedQuestions.forEach(completedQ => {
      const { fila: f1, col: c1, direccion: dir1 } = completedQ.posicion;
      const resp1 = completedQ.respuesta.toUpperCase();
      
      preguntas.forEach(otherQ => {
        if (otherQ.id === completedQ.id || newCompleted[otherQ.id]) return;
        
        const { fila: f2, col: c2, direccion: dir2 } = otherQ.posicion;
        const resp2 = otherQ.respuesta.toUpperCase();
        
        // Buscar intersección
        for (let i = 0; i < resp1.length; i++) {
          for (let j = 0; j < resp2.length; j++) {
            const pos1Fila = dir1 === 'vertical' ? f1 + i : f1;
            const pos1Col = dir1 === 'horizontal' ? c1 + i : c1;
            const pos2Fila = dir2 === 'vertical' ? f2 + j : f2;
            const pos2Col = dir2 === 'horizontal' ? c2 + j : c2;
            
            // Si las posiciones coinciden y las letras son iguales
            if (pos1Fila === pos2Fila && pos1Col === pos2Col && resp1[i] === resp2[j]) {
              // Verificar si todas las demás letras de otherQ están adivinadas
              const allLettersGuessed = resp2.split('').every((letter, idx) => {
                const checkFila = dir2 === 'vertical' ? f2 + idx : f2;
                const checkCol = dir2 === 'horizontal' ? c2 + idx : c2;
                
                // Verificar si esta posición intersecta con alguna palabra completada
                return completedQuestions.some(cq => {
                  const { fila: cf, col: cc, direccion: cdir } = cq.posicion;
                  const cresp = cq.respuesta.toUpperCase();
                  
                  for (let k = 0; k < cresp.length; k++) {
                    const cFila = cdir === 'vertical' ? cf + k : cf;
                    const cCol = cdir === 'horizontal' ? cc + k : cc;
                    
                    if (cFila === checkFila && cCol === checkCol && cresp[k] === letter) {
                      return true;
                    }
                  }
                  return false;
                });
              });
              
              if (allLettersGuessed) {
                newCompleted[otherQ.id] = otherQ.respuesta;
              }
            }
          }
        }
      });
    });
    
    return newCompleted;
  };

  const volverAlCrucigrama = () => {
    setVista('crucigrama');
    setCurrentQuestion(null);
  };

  const reiniciarJuego = () => {
    setCrucigramaCompleto({});
    setJuegoTerminado(false);
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

  const renderCrucigrama = () => {
    const gridSize = 25;
    const grid = Array(gridSize).fill(null).map(() => Array(gridSize).fill(null));
    
    preguntas.forEach((pregunta) => {
      const { fila, col, direccion } = pregunta.posicion;
      const respuesta = pregunta.respuesta.toUpperCase();
      const isCompleted = crucigramaCompleto[pregunta.id];
      
      for (let i = 0; i < respuesta.length; i++) {
        const currentFila = direccion === 'vertical' ? fila + i : fila;
        const currentCol = direccion === 'horizontal' ? col + i : col;
        
        if (currentFila < gridSize && currentCol < gridSize) {
          if (!grid[currentFila][currentCol]) {
            grid[currentFila][currentCol] = {
              letters: {},
              questionIds: [],
              isStart: {}
            };
          }
          
          grid[currentFila][currentCol].letters[pregunta.id] = isCompleted ? respuesta[i] : '';
          grid[currentFila][currentCol].questionIds.push(pregunta.id);
          if (i === 0) {
            grid[currentFila][currentCol].isStart[pregunta.id] = true;
          }
        }
      }
    });

    return (
      <div className="inline-block bg-white p-4 rounded-lg shadow-lg">
        {grid.map((row, rowIdx) => (
          <div key={rowIdx} className="flex">
            {row.map((cell, colIdx) => (
              <div
                key={`${rowIdx}-${colIdx}`}
                className={`w-10 h-10 border ${
                  cell 
                    ? 'border-blue-600 bg-white' 
                    : 'border-transparent bg-gray-100'
                }`}
              >
                {cell && (
                  <div className="w-full h-full flex items-center justify-center relative">
                    {Object.keys(cell.isStart).map(qId => (
                      <span key={qId} className="absolute top-0 left-0 text-xs text-blue-600 font-bold">
                        {qId}
                      </span>
                    ))}
                    <span className="text-lg font-bold text-blue-900">
                      {Object.values(cell.letters).find(l => l) || ''}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  if (vista === 'crucigrama') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-purple-500 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-white"> Crucigrama </h1>
            <div className="text-white text-2xl font-bold">
              Completadas: {Object.keys(crucigramaCompleto).length}/{preguntas.length}
            </div>
          </div>

          {juegoTerminado && (
            <div className="bg-green-500 text-white p-6 rounded-2xl shadow-2xl mb-6 text-center">
              <h2 className="text-3xl font-bold mb-4">🎉 ¡Felicidades! 🎉</h2>
              <p className="text-xl mb-4">Has completado todo el crucigrama</p>
              <button
                onClick={reiniciarJuego}
                className="bg-white text-green-600 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
              >
                🔄 Jugar de nuevo
              </button>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <p className="text-center text-gray-600 mb-8 text-lg">
              Selecciona un número del crucigrama para responder la pregunta con el juego del ahorcado
            </p>

            <div className="flex justify-center mb-8">
              {renderCrucigrama()}
            </div>

            <div className="grid grid-cols-5 gap-4 max-w-2xl mx-auto">
              {preguntas.map((pregunta) => (
                <button
                  key={pregunta.id}
                  onClick={() => selectQuestion(pregunta.id)}
                  disabled={crucigramaCompleto[pregunta.id]}
                  className={`p-6 rounded-lg font-bold text-2xl transition duration-200 ${
                    crucigramaCompleto[pregunta.id]
                      ? 'bg-green-500 text-white cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700'
                  }`}
                >
                  {pregunta.id}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (vista === 'ahorcado') {
    const isWordComplete = currentQuestion && 
      currentQuestion.respuesta.toUpperCase().split('').every(char => 
        char === ' ' || guessedLetters.includes(char)
      );

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-700 to-blue-500 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={volverAlCrucigrama}
              className="bg-white text-blue-900 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100"
            >
              ← Volver al crucigrama
            </button>
            <div className="text-white text-2xl font-bold">
              Pregunta #{currentQuestion?.id}
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
                  disabled={guessedLetters.includes(letter) || gameOver || isWordComplete}
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

            {isWordComplete && !gameOver && (
              <div className="bg-green-100 border-2 border-green-500 text-green-800 px-4 py-3 rounded-lg text-center font-bold">
                ¡Correcto! La respuesta se agregó al crucigrama ✅
              </div>
            )}

            {gameOver && (
              <div className="bg-red-100 border-2 border-red-500 text-red-800 px-4 py-3 rounded-lg text-center">
                <p className="font-bold mb-2">¡Se acabó el tiempo! ⏰</p>
                <p className="mb-4">La respuesta era: <strong>{currentQuestion?.respuesta}</strong></p>
                <button
                  onClick={volverAlCrucigrama}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  Volver al crucigrama
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}