import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ThirdGame.css';

const TOTAL_TURNS = 7;
const PERFECT_THROW_RANGE = [70, 100];

function ThirdGamePage() {
  const [gameState, setGameState] = useState('explanation');
  const navigate = useNavigate();
  
  const [successfulThrows, setSuccessfulThrows] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  
  const [ballState, setBallState] = useState('at-character');
  const [power, setPower] = useState(0);
  const [throwFeedback, setThrowFeedback] = useState('');
  const [characterState, setCharacterState] = useState('idle');
  const [gaugeSpeed, setGaugeSpeed] = useState(25);

  const powerIntervalRef = useRef(null);
  const [turnState, setTurnState] = useState('ready');
  
  const gaugeDirection = useRef('up');

  const [sessionId, setSessionId] = useState(null);
  const [finalAssistanceLevel, setFinalAssistanceLevel] = useState(null);
  const [turnStartTime, setTurnStartTime] = useState(null);

  useEffect(() => {
    if (gameState !== 'playing') return;
    if (ballState === 'at-character' && turnState === 'thrown') {
      const timer = setTimeout(() => {
        setBallState('at-child');
        setCharacterState('idle');
        setTurnState('ready');
      }, 1500);
      return () => clearTimeout(timer);
    } 
    else if (ballState === 'at-child') {
      setTurnStartTime(Date.now());
      setPower(0);
    }
  }, [ballState, turnState, gameState]);
  
  const handleStartGame = async () => {
    try {
      const response = await fetch('/api/games/session/start/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 2, game_id: 3 }),
      });
      if (!response.ok) throw new Error('Failed to start session');
      const data = await response.json();
      setSessionId(data.session_id);
      setGameState('playing');
      setSuccessfulThrows(0);
      setTotalAttempts(0);
      setBallState('at-child'); 
      setFinalAssistanceLevel(null);
      setGaugeSpeed(25);
      setTurnState('ready');
    } catch (error) {
      console.error("Error starting game session:", error);
      alert("Failed to start game session.");
    }
  };

  const handleChargeStart = () => {
    if (turnState !== 'ready' || ballState !== 'at-child') return;

    setPower(0);
    gaugeDirection.current = 'up';
    setTurnState('charging');
    
    powerIntervalRef.current = setInterval(() => {
      setPower(p => {
        if (gaugeDirection.current === 'up') {
          if (p >= 100) {
            gaugeDirection.current = 'down';
            return p - 1;
          }
          return p + 1;
        } else { 
          if (p <= 0) {
            gaugeDirection.current = 'up';
            return p + 1;
          }
          return p - 1;
        }
      });
    }, gaugeSpeed);
  };

  const handleThrow = async () => {
    if (turnState !== 'charging') return;

    clearInterval(powerIntervalRef.current);
    setTurnState('thrown');

    const currentPower = power;
    const responseTimeMs = Date.now() - turnStartTime;
    let feedbackText = '';
    let isSuccess = false;

    if (currentPower >= PERFECT_THROW_RANGE[0] && currentPower <= PERFECT_THROW_RANGE[1]) {
      feedbackText = 'Perfect!';
      isSuccess = true;
    } else {
      feedbackText = 'Too Weak...';
      isSuccess = false;
    }
    
    setThrowFeedback(feedbackText);

    if (isSuccess) {
      setGaugeSpeed(prevSpeed => Math.max(10, prevSpeed - 3));
    } else {
      setGaugeSpeed(prevSpeed => Math.min(40, prevSpeed + 8));
    }

    const logData = {
        session_id: sessionId,
        is_successful: isSuccess,
        response_time_ms: responseTimeMs,
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
    }
  };

  const endCurrentSession = async () => {
    if (!sessionId) return;
    try {
      await fetch('/api/games/third-game/session/end/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          session_id: sessionId, 
          successful_throws: successfulThrows,
          assistance_level: finalAssistanceLevel
        }),
      });
      setSessionId(null);
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
    <div className="game-explanation-container">
      <h1><span role="img" aria-label="ball emoji">⚽</span> 'Ball Toss' Game</h1>
      <p>
        Press and release the button with the right timing<br/>
        to throw the ball to the character.<br/>
        You have 7 chances.<br/>
        This helps with learning <strong>interactive turn-taking</strong>.
      </p>
      <div className="game-buttons-container">
        <button onClick={handleExit} className="game-back-button">Go Back</button>
        <button onClick={handleStartGame} className="game-start-button">Start Game</button>
      </div>
    </div>
  );

  const renderGamePage = () => (
    <div className="third-game-container">
      <button onClick={() => navigate('/play')} className="game-play-back-button">‹</button>
      
      <div 
        className="game-area"
        style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/assets/soccer.png)` }}
      >
        <div className="turn-counter">Turns Left: {TOTAL_TURNS - totalAttempts}</div>
        <div 
          className={`character ${characterState}`}
          style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/assets/character_idle.png)` }}
        ></div>
        <div className={`ball-container ${ballState}`}>
          <div 
            className="ball-image"
            style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/assets/ball.png)` }}
          ></div>
        </div>
        <div 
          className="child"
          style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/assets/child_idle.png)` }}
        ></div>
        {throwFeedback && <div className="throw-feedback">{throwFeedback}</div>}
      </div>
      
      <div className="power-meter-container">
        <div className="power-meter-bar">
          <div className="power-meter-fill" style={{ width: `${power}%` }}>
            <div className="gauge-indicator"></div>
          </div>
          <div className="power-meter-sweet-spot"></div>
        </div>
      </div>
      
      <button 
        className="throw-button"
        onMouseDown={handleChargeStart}
        onMouseUp={handleThrow}
        onTouchStart={handleChargeStart}
        onTouchEnd={handleThrow}
        disabled={turnState !== 'ready' || ballState !== 'at-child'}
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
              <img 
                key={index} 
                src="/assets/goodjob.png" 
                alt="Stamp" 
                className="stamp-image" 
              />
            ))
          ) : (
            <p className="no-stamp-message">Let's collect stamps next time!</p>
          )}
        </div>
        <div className="assistance-final-container">
          <p className="assistance-title">Was any help needed during the game?</p>
          <div className="assistance-buttons">
            <button 
              className={finalAssistanceLevel === 'NONE' ? 'selected' : ''}
              onClick={() => setFinalAssistanceLevel('NONE')}
            >No Help</button>
            <button 
              className={finalAssistanceLevel === 'VERBAL' ? 'selected' : ''}
              onClick={() => setFinalAssistanceLevel('VERBAL')}
            >A little help</button>
            <button 
              className={finalAssistanceLevel === 'PHYSICAL' ? 'selected' : ''}
              onClick={() => setFinalAssistanceLevel('PHYSICAL')}
            >A lot of help</button>
          </div>
        </div>
        <div className="game-modal-buttons">
          <button onClick={handleExit} className="game-modal-button game-exit-button" disabled={!finalAssistanceLevel}>Exit</button>
          <button onClick={handlePlayAgain} className="game-modal-button game-play-again-button" disabled={!finalAssistanceLevel}>Play Again</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="third-game-page">
      {gameState === 'explanation' && renderExplanationPage()}
      {gameState === 'playing' && renderGamePage()}
      {gameState === 'finished' && renderGameFinishedModal()}
    </div>
  );
}

export default ThirdGamePage;