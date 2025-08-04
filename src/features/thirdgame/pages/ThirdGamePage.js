import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ThirdGame.css';

const TOTAL_TURNS = 5;
const PERFECT_THROW_RANGE = [70, 90];

function ThirdGamePage() {
  const [gameState, setGameState] = useState('explanation');
  const navigate = useNavigate();
  
  const [successfulThrows, setSuccessfulThrows] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  
  const [ballState, setBallState] = useState('at-character');
  const [power, setPower] = useState(0);
  const [isCharging, setIsCharging] = useState(false);
  const [throwFeedback, setThrowFeedback] = useState('');
  const [characterState, setCharacterState] = useState('idle');

  const powerIntervalRef = useRef(null);

  // --- API 연동 상태 ---
  const [sessionId, setSessionId] = useState(null);
  const [finalAssistanceLevel, setFinalAssistanceLevel] = useState(null);
  const [turnStartTime, setTurnStartTime] = useState(null);

  useEffect(() => {
    if (isCharging) {
      powerIntervalRef.current = setInterval(() => {
        setPower(p => (p >= 100 ? 0 : p + 2));
      }, 20);
    } else {
      clearInterval(powerIntervalRef.current);
    }
    return () => clearInterval(powerIntervalRef.current);
  }, [isCharging]);

  useEffect(() => {
    if (gameState !== 'playing') return;

    if (ballState === 'at-character') {
      const timer = setTimeout(() => {
        setBallState('at-child');
        setCharacterState('idle');
      }, 1500);
      return () => clearTimeout(timer);
    } 
    else if (ballState === 'at-child') {
      setTurnStartTime(Date.now());
    }
  }, [ballState, gameState]);
  
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
      setBallState('at-character');
      setFinalAssistanceLevel(null);
    } catch (error) {
      console.error("Error starting game session:", error);
      alert("게임 세션을 시작하는 데 실패했습니다.");
    }
  };

  const handleChargeStart = () => {
    if (ballState === 'at-child') {
      setIsCharging(true);
    }
  };

  const handleThrow = async () => {
    if (ballState !== 'at-child' || !isCharging) return;
    
    setIsCharging(false);
    const currentPower = power;
    setPower(0);
    
    const responseTimeMs = Date.now() - turnStartTime;
    
    let feedbackText = '';
    let isSuccess = false;

    if (currentPower >= PERFECT_THROW_RANGE[0] && currentPower <= PERFECT_THROW_RANGE[1]) {
      feedbackText = 'Perfect!';
      isSuccess = true;
    } else if (currentPower > 50) {
      feedbackText = 'Good!';
      isSuccess = true;
    } else {
      feedbackText = 'Too Weak...';
      isSuccess = false;
    }
    
    setThrowFeedback(feedbackText);

    const logData = {
        session_id: sessionId,
        is_successful: isSuccess,
        response_time_ms: responseTimeMs,
        interaction_data: {
            throw_power: currentPower,
            result: feedbackText,
        },
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
        alert("게임 기록 저장에 실패했습니다.");
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
      <h1><span role="img" aria-label="ball emoji">⚽</span> '공 주고받기' 놀이</h1>
      <p>
        타이밍에 맞춰 버튼을 눌렀다 떼서<br/>
        캐릭터에게 공을 던져주는 놀이입니다.<br/>
        총 5번의 기회가 주어집니다.<br/>
        <strong>상호작용적 차례 지키기</strong>를 배우는 데 도움이 됩니다.
      </p>
      <div className="game-buttons-container">
        <button onClick={handleExit} className="game-back-button">뒤로가기</button>
        <button onClick={handleStartGame} className="game-start-button">놀이 시작하기</button>
      </div>
    </div>
  );

  const renderGamePage = () => (
    <div className="third-game-container">
      <div 
        className="game-area"
        style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/assets/soccer.png)` }}
      >
        <div className="turn-counter">남은 기회: {TOTAL_TURNS - totalAttempts}</div>
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
          <div className="power-meter-fill" style={{ width: `${power}%` }}></div>
          <div className="power-meter-sweet-spot"></div>
        </div>
      </div>
      
      <button 
        className="throw-button"
        onMouseDown={handleChargeStart}
        onMouseUp={handleThrow}
        onTouchStart={handleChargeStart}
        onTouchEnd={handleThrow}
        disabled={ballState !== 'at-child'}
      >
        {isCharging ? '놓아서 던지기!' : '눌러서 파워 모으기!'}
      </button>
    </div>
  );

  const renderGameFinishedModal = () => (
    <div className="game-modal-overlay">
      <div className="game-modal-content">
        <h2>참! 잘했어요!</h2>
        <div className="stamp-container">
          {successfulThrows > 0 ? (
            Array.from({ length: successfulThrows }).map((_, index) => (
              <img 
                key={index} 
                src="/assets/goodjob.png" 
                alt="정답 스탬프" 
                className="stamp-image" 
              />
            ))
          ) : (
            <p className="no-stamp-message">다음에 스탬프를 모아봐요!</p>
          )}
        </div>
        <div className="assistance-final-container">
          <p className="assistance-title">게임 중 도움이 필요했나요?</p>
          <div className="assistance-buttons">
            <button 
              className={finalAssistanceLevel === 'NONE' ? 'selected' : ''}
              onClick={() => setFinalAssistanceLevel('NONE')}
            >도움 없음</button>
            <button 
              className={finalAssistanceLevel === 'VERBAL' ? 'selected' : ''}
              onClick={() => setFinalAssistanceLevel('VERBAL')}
            >약간 도와줌</button>
            <button 
              className={finalAssistanceLevel === 'PHYSICAL' ? 'selected' : ''}
              onClick={() => setFinalAssistanceLevel('PHYSICAL')}
            >많이 도와줌</button>
          </div>
        </div>
        <div className="game-modal-buttons">
          <button onClick={handleExit} className="game-modal-button game-exit-button" disabled={!finalAssistanceLevel}>나가기</button>
          <button onClick={handlePlayAgain} className="game-modal-button game-play-again-button" disabled={!finalAssistanceLevel}>다시하기</button>
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