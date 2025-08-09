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

  const [showExitModal, setShowExitModal] = useState(false);

  const pollTimeoutRef = useRef(null);
  const userId = 2; // In a real environment, this should be retrieved from login info, etc.

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
          pollTimeoutRef.current = setTimeout(pollForAvailableQuizzes, 5000);
        }
      } catch (error)
{
        console.error("Error polling for available quizzes:", error);
        alert(error.message);
        setIsGameReady(false);
        setLoadingMessage('An error occurred');
      }
    };

    if (gameState === 'explanation') {
      pollForAvailableQuizzes();
    }

    return () => clearTimeout(pollTimeoutRef.current);
  }, [gameState]);

  const currentQuestion = gameData[currentQuestionIndex];

  const handleStartGame = async () => {
    if (!isGameReady) {
      alert("The quiz is not ready yet. The button will be enabled shortly.");
      return;
    }

    try {
      fetch('/api/games/firstgame/trigger-generation/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      });

      const sessionResponse = await fetch('/api/games/session/start/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, game_id: 1 }),
      });
      if (!sessionResponse.ok) throw new Error('Failed to start session');
      
      const sessionData = await sessionResponse.json();
      setSessionId(sessionData.session_id);

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
  
  // --- [수정] 세션 종료와 AI 분석 로직을 명확히 분리 ---
  
  const logSessionEnd = () => {
    if (!sessionId) return Promise.resolve();
    return fetch('/api/games/first-game/session/end/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        session_id: sessionId, 
        correct_answers: correctAnswers,
        assistance_level: finalAssistanceLevel,
        quiz_ids: playedQuizIds
      }),
    });
  };

  const triggerAiAnalysis = () => {
    if (!sessionId) return Promise.resolve();
    return fetch('/api/data/ai-analysis/game1/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId }),
    });
  };

  // 게임을 정상적으로 완료했을 때 호출 (분석O)
  const handleGameEnd = async () => {
    if (!sessionId) return;
    try {
      await Promise.all([logSessionEnd(), triggerAiAnalysis()]);
      console.log("Session ended and AI analysis for Game 1 triggered successfully.");
    } catch (error) {
      console.error("Error during game end process:", error);
    } finally {
      setSessionId(null);
      setPlayedQuizIds([]);
    }
  };

  // '게임 완료' 모달의 '나가기' 버튼
  const handleFinishAndExit = async () => {
    await handleGameEnd();
    navigate('/play/');
  };

  // '다시하기' 버튼
  const handlePlayAgain = async () => {
    await handleGameEnd();
    setGameState('explanation');
  };

  // '뒤로가기' 모달의 '확인' 버튼 (분석X)
  const handleConfirmExit = async () => {
    try {
      await logSessionEnd();
      console.log("Session ended without AI analysis.");
    } catch (error) {
      console.error("Error ending session early:", error);
    } finally {
      setSessionId(null);
      setPlayedQuizIds([]);
      navigate('/play/');
    }
  };

  const handleBackButtonClick = () => {
    setShowExitModal(true);
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
        <button onClick={handleBackButtonClick} className="game-play-back-button">‹</button>
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
          <button onClick={handleFinishAndExit} className="game-modal-button game-exit-button" disabled={!finalAssistanceLevel}>Exit</button>
          <button onClick={handlePlayAgain} className="game-modal-button game-play-again-button" disabled={!finalAssistanceLevel}>Play Again</button>
        </div>
      </div>
    </div>
  );

  const renderExitModal = () => (
    <div className="game-modal-overlay">
      <div className="game-modal-content">
        <h2>Exit Game?</h2>
        <p className="exit-confirm-text">Are you sure you want to quit the game? Your progress will not be saved.</p>
        <div className="game-modal-buttons">
          <button onClick={() => setShowExitModal(false)} className="game-modal-button game-exit-button">Cancel</button>
          <button onClick={handleConfirmExit} className="game-modal-button game-play-again-button">Confirm</button>
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
      {showExitModal && renderExitModal()}
    </div>
  );
}

export default FirstGamePage;