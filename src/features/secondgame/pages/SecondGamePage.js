import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SecondGame.css';

const emotionData = [
    { name: 'angry', emoji: '😡', modelName: 'angry' },
    { name: 'happy', emoji: '😄', modelName: 'happy' },
    { name: 'sad', emoji: '😐', modelName: 'sad' },
    { name: 'surprised', emoji: '🫢', modelName: 'surprised' },
];

const userId = 2; // API 호출에 사용할 사용자 ID

function SecondGamePage() {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState('explanation');
  const [currentEmotionIndex, setCurrentEmotionIndex] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  const [feedback, setFeedback] = useState('');
  const [showSparkles, setShowSparkles] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [finalAssistanceLevel, setFinalAssistanceLevel] = useState(null);
  const [emotionStartTime, setEmotionStartTime] = useState(null);

  const [showExitModal, setShowExitModal] = useState(false);

  const currentEmotion = emotionData[currentEmotionIndex];

  const stopCameraAndDetection = () => {
    clearInterval(intervalRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    return () => stopCameraAndDetection();
  }, []);

  const handleStartGame = async () => {
    setGameState('playing');
    setCompletedCount(0);
    setCurrentEmotionIndex(0);
    setFinalAssistanceLevel(null);
    setEmotionStartTime(Date.now());

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera start error:", err);
    }

    try {
        const response = await fetch('/api/games/session/start/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId, game_id: 2 }),
        });
        if (!response.ok) throw new Error('Failed to start session');
        const data = await response.json();
        setSessionId(data.session_id);
    } catch (error) {
        console.error("Session start error:", error);
    }
  };

  const startDetectionInterval = () => {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
        captureAndSendFrame();
    }, 2000);
  };

  useEffect(() => {
    if (gameState === 'playing' && !feedback && sessionId) {
        startDetectionInterval();
    } else {
        clearInterval(intervalRef.current);
    }
  }, [gameState, currentEmotionIndex, feedback, sessionId]);


  const captureAndSendFrame = async () => {
    if (!videoRef.current || videoRef.current.readyState < 3 || !emotionStartTime) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageBase64 = canvas.toDataURL('image/jpeg');
    const response_time_ms = Date.now() - emotionStartTime;

    try {
        const response = await fetch('/api/data/detect-emotion/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                image: imageBase64,
                target_emotion: currentEmotion.modelName,
                response_time_ms: response_time_ms
            }),
        });
        if (!response.ok) return;

        const result = await response.json();

        if (result.is_match) {
            handleSuccess(response_time_ms);
        }
    } catch (error) {
        console.error("Emotion detection API error:", error);
    }
  };

  const handleSuccess = async (response_time_ms) => {
    if (feedback) return;
    clearInterval(intervalRef.current);

    const logData = {
        session_id: sessionId,
        is_successful: true,
        response_time_ms: response_time_ms,
        interaction_data: {
            emotion_name: currentEmotion.name,
            emotion_emoji: currentEmotion.emoji
        }
    };

    try {
        await fetch('/api/games/interaction/log/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(logData),
        });

        setShowSparkles(true);
        setTimeout(() => setShowSparkles(false), 1000);
        setCompletedCount(prev => prev + 1);
        setFeedback('great');

        setTimeout(() => {
            setFeedback('');
            if (currentEmotionIndex < emotionData.length - 1) {
                setCurrentEmotionIndex(prev => prev + 1);
                setEmotionStartTime(Date.now());
            } else {
                setGameState('finished');
                stopCameraAndDetection();
            }
        }, 2000);

    } catch (error) {
        console.error("Error logging interaction:", error);
        if (gameState === 'playing') {
            startDetectionInterval();
        }
    }
  };

  // --- [수정] "확인하였습니다" 버튼 클릭 시 수동으로 성공 처리 ---
  const handleManualSuccess = () => {
    // response_time_ms를 어떻게 처리할지 결정해야 합니다. 
    // 여기서는 emotionStartTime을 기준으로 계산하지만, '수동 확인'의 경우 다른 값을 사용할 수도 있습니다.
    const response_time_ms = emotionStartTime ? Date.now() - emotionStartTime : 0;
    handleSuccess(response_time_ms);
  };
  
  // --- [수정] 세션 종료와 AI 분석 로직을 명확히 분리 ---

  const logSessionEnd = () => {
    if (!sessionId) return Promise.resolve();
    return fetch('/api/games/second-game/session/end/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        session_id: sessionId,
        completed_count: completedCount,
        assistance_level: finalAssistanceLevel
      }),
    });
  };

  const triggerAiAnalysis = () => {
    if (!sessionId) return Promise.resolve();
    return fetch('/api/data/ai-analysis/game2/', {
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
      console.log("Session ended and AI analysis for Game 2 triggered successfully.");
    } catch (error) {
      console.error("Error during game end process:", error);
    } finally {
      setSessionId(null);
    }
  };

  // '게임 완료' 모달의 '나가기' 버튼
  const handleFinishAndExit = async () => {
    stopCameraAndDetection();
    await handleGameEnd();
    navigate('/play/');
  };

  // '다시하기' 버튼
  const handlePlayAgain = async () => {
    stopCameraAndDetection();
    await handleGameEnd();
    setGameState('explanation');
  };

  // '뒤로가기' 모달의 '확인' 버튼 (분석X)
  const handleConfirmExit = async () => {
    stopCameraAndDetection();
    try {
      await logSessionEnd(); // AI 분석 없이 세션 기록만 함
      console.log("Session ended without AI analysis.");
    } catch (error) {
      console.error("Error ending session early:", error);
    } finally {
      setSessionId(null);
      navigate('/play/');
    }
  };

  const handleBackButtonClick = () => {
    setShowExitModal(true);
  };

  const renderExplanationPage = () => (
    <div className="game-explanation-container">
      <h1><span role="img" aria-label="face emoji">😊</span> 'Copy the Face' Game</h1>
      <p>
        First, the parent can copy the expression on the screen, <br/>
        and then encourage the child to imitate the expression. <br/>
        This game requires permission to use the front camera.
      </p>
      <div className="game-buttons-container">
        <button onClick={() => navigate('/play/')} className="game-back-button">Go Back</button>
        <button onClick={handleStartGame} className="game-start-button">Start Game</button>
      </div>
    </div>
  );

  const renderGamePage = () => (
    <div className="second-game-container">
      <button onClick={handleBackButtonClick} className="game-play-back-button">‹</button>

      {feedback === 'great' && <div className="game-feedback-correct"><h1>Awesome! 👍</h1></div>}
      <div className="emotion-display">
        <div className="emotion-emoji">{currentEmotion.emoji}</div>
        <div className="emotion-prompt">Let's make a {currentEmotion.name} face!</div>
      </div>
      <div className="camera-container">
        <video ref={videoRef} autoPlay playsInline muted></video>
        {showSparkles && <div className="sparkle-effect"></div>}

      </div>
      {/* --- [수정] "확인하였습니다" 버튼 추가 --- */}
      <button onClick={handleManualSuccess} className="manual-confirm-button" disabled={!!feedback}>
        I've confirmed it
      </button>
      <div className="game-parent-guide">
        It automatically detects when you make the face in the camera!
      </div>
    </div>
  );

  const renderGameFinishedModal = () => (
    <div className="game-modal-overlay">
      <div className="game-modal-content">
        <h2>Great Job!</h2>
        <div className="stamp-container">
          {completedCount > 0 ? (
            Array.from({ length: completedCount }).map((_, index) => (
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
            <p className="exit-confirm-text">Are you sure you want to quit the game? Your progress will not be saved.</p>
            <div className="game-modal-buttons">
                <button onClick={() => setShowExitModal(false)} className="game-modal-button game-exit-button">Cancel</button>
                <button onClick={handleConfirmExit} className="game-modal-button game-play-again-button">Confirm</button>
            </div>
        </div>
    </div>
  );

  return (
    <div className="second-game-page">
      {gameState === 'explanation' && renderExplanationPage()}
      {gameState === 'playing' && renderGamePage()}
      {gameState === 'finished' && renderGameFinishedModal()}
      {showExitModal && renderExitModal()}
    </div>
  );
}

export default SecondGamePage;