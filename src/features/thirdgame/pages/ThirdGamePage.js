import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ThirdGame.css';

// --- Constants ---
const TOTAL_TURNS = 5;
const PERFECT_THROW_RANGE = [70, 90];
const USER_ID = 2; // The user ID for API calls

// Maps difficulty strings from the API to gauge speeds
const DIFFICULTY_TO_SPEED = {
  easy: 40,   // Slower gauge
  normal: 25, // Default speed
  hard: 15,   // Faster gaug5
};

function ThirdGamePage() {
  // --- State Hooks ---
  const [gameState, setGameState] = useState('explanation');
  const navigate = useNavigate();
  
  // Game-specific state
  const [successfulThrows, setSuccessfulThrows] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [ballState, setBallState] = useState('at-character');
  const [power, setPower] = useState(0);
  const [throwFeedback, setThrowFeedback] = useState('');
  const [characterState, setCharacterState] = useState('idle');
  const [gaugeSpeed, setGaugeSpeed] = useState(DIFFICULTY_TO_SPEED.normal);
  const [turnState, setTurnState] = useState('ready');
  const [turnStartTime, setTurnStartTime] = useState(null);
  
  // [추가] 버튼 활성화 여부를 제어하는 상태
  const [isInteractable, setIsInteractable] = useState(false);

  // Session and modal state
  const [sessionId, setSessionId] = useState(null);
  const [showExitModal, setShowExitModal] = useState(false);
  const [finalAssistanceLevel, setFinalAssistanceLevel] = useState(null);

  // --- RL-specific State ---
  const [rlAction, setRlAction] = useState(null);
  const [rlInitialState, setRlInitialState] = useState(null);

  // Refs
  const powerIntervalRef = useRef(null);
  const gaugeDirection = useRef('up');
  const isActionInProgress = useRef(false);

  // --- Effects ---
  useEffect(() => {
    if (gameState !== 'playing') return;

    if (ballState === 'at-character' && turnState === 'thrown') {
      const timer = setTimeout(() => {
        setBallState('at-child');
        setCharacterState('idle');
        setTurnState('ready');
        isActionInProgress.current = false;
      }, 1500);
      return () => clearTimeout(timer);
    } else if (ballState === 'at-child') {
      setTurnStartTime(Date.now());
      setPower(0);
      
      // [수정] 0.6초 지연 후 버튼을 활성화합니다.
      const activationTimer = setTimeout(() => {
        setIsInteractable(true);
      }, 1000); // 0.6초 딜레이
      
      // 컴포넌트가 언마운트되거나 상태가 바뀌면 타이머를 정리합니다.
      return () => clearTimeout(activationTimer);
    }
  }, [ballState, turnState, gameState]);

  // --- Core Functions ---

  const handleStartGame = async () => {
    try {
      const rlResponse = await fetch('/api/data/rl/game3/difficulty/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: USER_ID }),
      });
      if (!rlResponse.ok) throw new Error('Failed to get RL recommendation');
      const rlData = await rlResponse.json();

      setGaugeSpeed(DIFFICULTY_TO_SPEED[rlData.recommended_difficulty] || DIFFICULTY_TO_SPEED.normal);
      setRlAction(rlData.action);
      setRlInitialState(rlData.current_state);
      
      const sessionResponse = await fetch('/api/games/session/start/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: USER_ID, game_id: 3 }),
      });
      if (!sessionResponse.ok) throw new Error('Failed to start session');
      const sessionData = await sessionResponse.json();
      
      setSessionId(sessionData.session_id);
      setGameState('playing');
      setSuccessfulThrows(0);
      setTotalAttempts(0);
      setBallState('at-child'); 
      setTurnState('ready');
      setFinalAssistanceLevel(null);
      setIsInteractable(false); // [추가] 게임 시작 시 버튼 비활성화

    } catch (error) {
      console.error("Error starting game:", error);
      alert("Failed to start the game. Please check the server connection.");
    }
  };

  const handleChargeStart = () => {
    if (!isInteractable || turnState !== 'ready' || ballState !== 'at-child') return;

    setPower(0);
    gaugeDirection.current = 'up';
    setTurnState('charging');
    
    powerIntervalRef.current = setInterval(() => {
      setPower(p => {
        if (gaugeDirection.current === 'up') {
          return p >= 100 ? 100 : p + 0.7;
        } else {
          return p <= 0 ? 0 : p - 0.7;
        }
      });
    }, gaugeSpeed);
  };

  const handleThrow = async () => {
    if (isActionInProgress.current) return;
    if (turnState !== 'charging') return;
    
    isActionInProgress.current = true;
    setIsInteractable(false); // [수정] 던지는 즉시 버튼 비활성화

    clearInterval(powerIntervalRef.current);
    setTurnState('thrown');

    const currentPower = power;
    let isSuccess = false;
    let feedbackText = '';

    // if (currentPower >= PERFECT_THROW_RANGE[0] && currentPower <= PERFECT_THROW_RANGE[1]) {
    //   feedbackText = 'Perfect!';
    //   isSuccess = true;
    //   setGaugeSpeed(prev => Math.max(DIFFICULTY_TO_SPEED.hard - 8, prev - 2));
    // } else if (currentPower > PERFECT_THROW_RANGE[1]) {
    //   feedbackText = 'Too Strong!';
    //   isSuccess = false;
    //   setGaugeSpeed(prev => Math.min(DIFFICULTY_TO_SPEED.eaay - 16, prev + 3.5));
    // } else {
    //   feedbackText = 'Too Weak...';
    //   isSuccess = false;
    //   setGaugeSpeed(prev => Math.max(DIFFICULTY_TO_SPEED.hard + 16, prev - 3.5));
    // }

    if (currentPower >= PERFECT_THROW_RANGE[0] && currentPower <= PERFECT_THROW_RANGE[1]) {
      feedbackText = 'Perfect!';
      isSuccess = true;
      setGaugeSpeed(prev => {
        const newSpeed = Math.max(DIFFICULTY_TO_SPEED.hard, prev - prev * 0.1);
        console.log(`Success -> Previous: ${prev}, New: ${newSpeed.toFixed(2)}`);
        return newSpeed;
      });
    } else if (currentPower > PERFECT_THROW_RANGE[1]) {
      const gap = currentPower - PERFECT_THROW_RANGE[1];
      feedbackText = 'Too Strong!';
      isSuccess = false;
      setGaugeSpeed(prev => {
        const newSpeed = Math.min(DIFFICULTY_TO_SPEED.easy, prev + gap * 0.5); 
        console.log(`Too Strong -> Previous: ${prev}, New: ${newSpeed.toFixed(2)}`);
        return newSpeed;
      });
    } else {
      const gap = PERFECT_THROW_RANGE[0] - currentPower;
      feedbackText = 'Too Weak...';
      isSuccess = false;
      setGaugeSpeed(prev => {
        const newSpeed = Math.max(DIFFICULTY_TO_SPEED.hard, prev - gap * 0.1); 
        console.log(`Too Weak -> Previous: ${prev}, New: ${newSpeed.toFixed(2)}`);
        return newSpeed;
      });
    }
    
    setThrowFeedback(feedbackText);

    const logData = {
        session_id: sessionId,
        is_successful: isSuccess,
        response_time_ms: Date.now() - turnStartTime,
        interaction_data: { throw_power: currentPower, result: feedbackText },
    };

    try {
        await fetch('/api/games/interaction/log/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(logData),
        });
        
        const newTotalAttempts = totalAttempts + 1;
        setTotalAttempts(newTotalAttempts);
        setBallState(isSuccess ? 'thrown' : 'dropped');

        if (isSuccess) {
            setSuccessfulThrows(prev => prev + 1);
            setCharacterState('happy');
        } else {
            setCharacterState('sad');
        }

        setTimeout(() => {
            setThrowFeedback('');
            if (newTotalAttempts >= TOTAL_TURNS) {
                setGameState('finished');
            } else {
                setBallState('at-character');
            }
        }, 1200);
    } catch (error) {
      console.error("Error logging interaction:", error);
      alert("Failed to save game record.");
      setTurnState('ready');
      isActionInProgress.current = false;
    }
  };

  const updateRLModel = () => {
    if (sessionId === null || rlInitialState === null || rlAction === null) {
      console.log("Skipping RL update: Missing session data.");
      return Promise.resolve();
    }
    return fetch('/api/data/rl/game3/difficulty/', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        initial_state: rlInitialState,
        action: rlAction,
      }),
    });
  };

  const logSessionEnd = () => {
    if (!sessionId) return Promise.resolve();
    return fetch('/api/games/third-game/session/end/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        session_id: sessionId, 
        successful_throws: successfulThrows,
        assistance_level: finalAssistanceLevel
      }),
    });
  };

  const triggerAiAnalysis = () => {
    if (!sessionId) return Promise.resolve();
    return fetch('/api/data/ai-analysis/game3/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: USER_ID }),
    });
  };

  const handleGameEnd = async () => {
    if (!sessionId) return;
    try {
      await Promise.all([
        updateRLModel(),
        logSessionEnd(),
        triggerAiAnalysis()
      ]);
      console.log("Game end process (RL update, session log, AI analysis) triggered.");
    } catch (error) {
      console.error("Error during game end process:", error);
    } finally {
      setSessionId(null);
    }
  };

  const handleFinishAndExit = async () => {
    await handleGameEnd();
    navigate('/play');
  };

  const handlePlayAgain = async () => {
    await handleGameEnd();
    setGameState('explanation');
  };
  
  const handleConfirmExit = async () => {
    try {
      await logSessionEnd();
      console.log("Session ended without RL update or AI analysis.");
    } catch (error) {
      console.error("Error ending session early:", error);
    } finally {
      setSessionId(null);
      navigate('/play');
    }
  };
  
  const handleBackButtonClick = () => {
    setShowExitModal(true);
  };
  
  // --- Render Functions ---
  const renderExplanationPage = () => (
    <div className="game-explanation-container">
      <h1><span role="img" aria-label="ball emoji">⚽</span> 'Ball Toss' Game</h1>
      <p>
        Press and release the button with the right timing<br/>
        to throw the ball to the character.<br/>
        You have 5 chances.<br/>
        This helps with learning <strong>interactive turn-taking</strong>.
      </p>
      <div className="game-buttons-container">
        <button onClick={() => navigate('/play')} className="game-back-button">Go Back</button>
        <button onClick={handleStartGame} className="game-start-button">Start Game</button>
      </div>
    </div>
  );

  const renderGamePage = () => (
    <div className="third-game-container">
      <button onClick={handleBackButtonClick} className="game-play-back-button">‹</button>
      <div className="game-area" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/assets/soccer.png)` }}>
        <div className="turn-counter">Turns Left: {TOTAL_TURNS - totalAttempts}</div>
        <div className={`character ${characterState}`} style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/assets/character_idle.png)` }}></div>
        <div className={`ball-container ${ballState}`}>
          <div className="ball-image" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/assets/ball.png)` }}></div>
        </div>
        <div className="child" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/assets/child_idle.png)` }}></div>
        {throwFeedback && <div className="throw-feedback">{throwFeedback}</div>}
      </div>
      <div className="power-meter-container">
        <div className="power-meter-bar">
          <div className="power-meter-fill" style={{ width: `${power}%` }}></div>
          <div className="power-meter-sweet-spot" style={{ left: `${PERFECT_THROW_RANGE[0]}%`, width: `${PERFECT_THROW_RANGE[1] - PERFECT_THROW_RANGE[0]}%` }}></div>
        </div>
      </div>
      <button 
        className="throw-button"
        onMouseDown={handleChargeStart}
        onMouseUp={handleThrow}
        onTouchStart={handleChargeStart}
        onTouchEnd={handleThrow}
        // [수정] 버튼의 disabled 속성을 새로운 상태와 연결
        disabled={!isInteractable}
      >
        {turnState === 'charging' ? 'Release to Throw!' : 'Press to Charge Power!'}
      </button>
    </div>
  );

  const renderGameFinishedModal = () => (
    <div className="game-modal-overlay">
      <div className="game-modal-content">
        <h2>Great Job!</h2>
        <div className="stamp-container">
          {successfulThrows > 0 ? (
            Array.from({ length: successfulThrows }).map((_, index) => (
              <img key={index} src="/assets/goodjob.png" alt="Stamp" className="stamp-image" />
            ))
          ) : (
            <p className="no-stamp-message">Let's collect stamps next time!</p>
          )}
        </div>
        <div className="assistance-final-container">
          <p className="assistance-title">Was any help needed during the game?</p>
          <div className="assistance-buttons">
            <button className={finalAssistanceLevel === 'NONE' ? 'selected' : ''} onClick={() => setFinalAssistanceLevel('NONE')}>No Help</button>
            <button className={finalAssistanceLevel === 'VERBAL' ? 'selected' : ''} onClick={() => setFinalAssistanceLevel('VERBAL')}>A little help</button>
            <button className={finalAssistanceLevel === 'PHYSICAL' ? 'selected' : ''} onClick={() => setFinalAssistanceLevel('PHYSICAL')}>A lot of help</button>
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
        <p className="exit-confirm-text">Are you sure you want to quit the game? Your progress will not be saved, but the AI will still learn from your play.</p>
        <div className="game-modal-buttons">
          <button onClick={() => setShowExitModal(false)} className="game-modal-button game-exit-button">Cancel</button>
          <button onClick={handleConfirmExit} className="game-modal-button game-play-again-button">Confirm</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="third-game-page">
      {gameState === 'explanation' && renderExplanationPage()}
      {gameState === 'playing' && renderGamePage()}
      {gameState === 'finished' && renderGameFinishedModal()}
      {showExitModal && renderExitModal()}
    </div>
  );
}

export default ThirdGamePage;