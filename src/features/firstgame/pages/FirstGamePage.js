import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import FirstGame from '../components/FirstGame';
import '../styles/FirstGame.css';

function FirstGamePage() {
  const [gameState, setGameState] = useState('explanation');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState('');
  const navigate = useNavigate();

  const [sessionId, setSessionId] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [finalAssistanceLevel, setFinalAssistanceLevel] = useState(null);
  
  const [gameData, setGameData] = useState([]);
  const [playedQuizIds, setPlayedQuizIds] = useState([]);
  
  const [isGameReady, setIsGameReady] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Checking for available quizzes...');

  const pollTimeoutRef = useRef(null);
  const userId = 2; // In a real environment, this should be retrieved from login info, etc.

  // --- Step 1: On page entry, check for available quizzes every 5 seconds ---
  useEffect(() => {
    const pollForAvailableQuizzes = async () => {
      try {
        const response = await fetch('/api/games/firstgame/get-or-wait-quizzes/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId }),
        });

        if (!response.ok) throw new Error('Server error while checking for quizzes');
        const data = await response.json();

        if (data.status === 'ready' && data.quizzes.length >= 3) {
          setGameData(data.quizzes);
          setPlayedQuizIds(data.quizzes.map(q => q.quiz_id));
          setIsGameReady(true);
          setLoadingMessage('Start Game');
        } else {
          setIsGameReady(false);
          setLoadingMessage('The AI is preparing the next quiz. Please wait a moment...');
          pollTimeoutRef.current = setTimeout(pollForAvailableQuizzes, 5000); // Check again after 5 seconds
        }
      } catch (error) {
        console.error("Error polling for available quizzes:", error);
        alert(error.message);
        setIsGameReady(false);
        setLoadingMessage('An error occurred');
      }
    };

    // Start polling only when in the 'explanation' state
    if (gameState === 'explanation') {
      pollForAvailableQuizzes();
    }

    // Clear the poll timeout when the component unmounts or gameState changes
    return () => clearTimeout(pollTimeoutRef.current);
  }, [gameState]);

  const currentQuestion = gameData[currentQuestionIndex];

  // --- Step 2: When the 'Start Game' button is clicked ---
  const handleStartGame = async () => {
    if (!isGameReady) {
      alert("The quiz is not ready yet. The button will be enabled shortly.");
      return;
    }

    try {
      // 2-1. Start generating quizzes for the next game in the background
      fetch('/api/games/firstgame/trigger-generation/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });

      // 2-2. Start the current game session
      const sessionResponse = await fetch('/api/games/session/start/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, game_id: 1 }),
      });
      if (!sessionResponse.ok) throw new Error('Failed to start session');
      
      const sessionData = await sessionResponse.json();
      setSessionId(sessionData.session_id);

      // 2-3. Change the game state to 'playing'
      setGameState('playing');
      setCurrentQuestionIndex(0);
      setCorrectAnswers(0);
      setFinalAssistanceLevel(null);

    } catch (error) {
      console.error("Error starting game:", error);
      alert(error.message);
    }
  };

  useEffect(() => {
    if (gameState === 'playing') {
      setQuestionStartTime(Date.now());
    }
  }, [gameState, currentQuestionIndex]);

  const handleAnswerClick = async (itemName) => {
    if (feedback || !currentQuestion) return;

    const isSuccessful = itemName === currentQuestion.correct_answer;
    if (isSuccessful) {
      setCorrectAnswers(prevCount => prevCount + 1);
    }
    
    const logData = {
      session_id: sessionId,
      is_successful: isSuccessful,
      response_time_ms: Date.now() - questionStartTime,
      interaction_data: {
        prompt_text: currentQuestion.prompt_text,
        target_item: currentQuestion.correct_answer,
        selected_item: itemName,
        all_items: currentQuestion.items.map(i => i.name),
      }
    };

    try {
      await fetch('/api/games/interaction/log/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData),
      });

      if (isSuccessful) { setFeedback('correct'); }

      setTimeout(() => {
        setFeedback('');
        if (currentQuestionIndex < gameData.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
          setGameState('finished');
        }
      }, isSuccessful ? 1500 : 500);

    } catch (error) {
      console.error("Error logging interaction:", error);
      alert("Failed to save game record.");
    }
  };
  
  // --- Step 3: On game end, end the current session ---
  const endCurrentSession = async () => {
    if (!sessionId) return;
    try {
      await fetch('/api/games/first-game/session/end/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          session_id: sessionId, 
          correct_answers: correctAnswers,
          assistance_level: finalAssistanceLevel,
          quiz_ids: playedQuizIds
        }),
      });
      setSessionId(null);
      setPlayedQuizIds([]);
    } catch (error) {
      console.error("Error ending session:", error);
    }
  };

  const handleExit = async () => {
    await endCurrentSession();
    navigate('/play/');
  };

  const handlePlayAgain = async () => {
    await endCurrentSession();
    setGameState('explanation');
  };
  
  const renderExplanationPage = () => (
    <div className="explanation-container">
      <h1><span className="icon">🔎</span> 'Look Over There!' Game</h1>
      <p>
        Answer new questions created by the AI.<br />
        When your child looks at the correct object, praise them and tap the card. <br />
        This helps develop <strong>Joint Attention</strong> skills.
      </p>
      <div className="explanation-buttons">
        <button onClick={() => navigate('/play/')} className="back-button">Back</button>
        <button onClick={handleStartGame} className="start-button" disabled={!isGameReady}>
          {loadingMessage}
        </button>
      </div>
    </div>
  );

  const renderGamePage = () => {
    if (!currentQuestion) {
      return <div className="loading-text">Could not display the quiz...</div>;
    }
    return (
      <div className="game-container">
        {feedback === 'correct' && <div className="feedback-correct"><h1>Correct! 🎉</h1></div>}
        <h2 className="game-prompt">{currentQuestion.prompt_text}</h2>
        <div className="cards-container">
          {currentQuestion.items.map((item) => (
            <FirstGame key={item.name} name={item.name} image={item.image_url} onClick={handleAnswerClick} />
          ))}
        </div>
        <div className="parent-guide">Parent's Guide: When your child looks at the correct answer, please tap the card for them!</div>
      </div>
    );
  };

  const renderGameFinishedModal = () => (
    <div className="game-modal-overlay">
      <div className="game-modal-content">
        <h2>Great Job!</h2>
        <div className="stamp-container">
          {correctAnswers > 0 ? (
            Array.from({ length: correctAnswers }).map((_, index) => (
              <img key={index} src="/assets/goodjob.png" alt="Correct Answer Stamp" className="stamp-image" />
            ))
          ) : ( <p className="no-stamp-message">That's okay, let's try to collect stamps next time!</p> )}
        </div>
        <div className="assistance-final-container">
          <p className="assistance-title">Was any help needed during the game?</p>
          <div className="assistance-buttons">
            <button className={finalAssistanceLevel === 'NONE' ? 'selected' : ''} onClick={() => setFinalAssistanceLevel('NONE')}>No Help</button>
            <button className={finalAssistanceLevel === 'VERBAL' ? 'selected' : ''} onClick={() => setFinalAssistanceLevel('VERBAL')}>Verbal Help</button>
            <button className={finalAssistanceLevel === 'PHYSICAL' ? 'selected' : ''} onClick={() => setFinalAssistanceLevel('PHYSICAL')}>Physical Help</button>
          </div>
        </div>
        <div className="game-modal-buttons">
          <button onClick={handleExit} className="game-modal-button game-exit-button" disabled={!finalAssistanceLevel}>Exit</button>
          <button onClick={handlePlayAgain} className="game-modal-button game-play-again-button" disabled={!finalAssistanceLevel}>Play Again</button>
        </div>
      </div>
    </div>
  );

  const renderByGameState = () => {
    switch (gameState) {
      case 'playing':
        return renderGamePage();
      case 'finished':
        return (
          <>
            {renderGamePage()}
            {renderGameFinishedModal()}
          </>
        );
      case 'explanation':
      default:
        return renderExplanationPage();
    }
  };

  return (
    <div className="first-game-page">
      {renderByGameState()}
    </div>
  );
}

export default FirstGamePage;