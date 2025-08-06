import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SecondGame.css';

const emotionData = [
    { name: 'angry', emoji: '😡', modelName: 'angry' },
    { name: 'happy', emoji: '😄', modelName: 'happy' },
    { name: 'sad', emoji: '😐', modelName: 'sad' },
    { name: 'surprised', emoji: '😖', modelName: 'surprised' },
];


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
  
  // State to store the start time for the current emotion
  const [emotionStartTime, setEmotionStartTime] = useState(null);

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
    // Record the start time when the game begins
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
            body: JSON.stringify({ user_id: 2, game_id: 2 }),
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

  // --- 핵심 수정: 게임 상태, 세션 ID, 문제 번호가 변경될 때마다 감지 로직을 제어 ---
  useEffect(() => {
    // 게임 중이고, 피드백이 표시되지 않으며, 세션 ID가 발급된 상태일 때만 감지를 시작합니다.
    if (gameState === 'playing' && !feedback && sessionId) {
        startDetectionInterval();
    } else {
        // 조건이 맞지 않으면 인터벌을 확실히 제거합니다.
        clearInterval(intervalRef.current);
    }
    // 이 useEffect는 게임 상태, 문제 번호, 피드백, 세션 ID가 변경될 때마다 재실행됩니다.
  }, [gameState, currentEmotionIndex, feedback, sessionId]);


  const captureAndSendFrame = async () => {
    // Ensure the video is ready and the start time has been set
    if (!videoRef.current || videoRef.current.readyState < 3 || !emotionStartTime) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageBase64 = canvas.toDataURL('image/jpeg');

    // Calculate the time elapsed since the emotion was shown
    const response_time_ms = Date.now() - emotionStartTime;

    try {
        const response = await fetch('/api/data/detect-emotion/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                image: imageBase64,
                target_emotion: currentEmotion.modelName,
                response_time_ms: response_time_ms // Send the elapsed time
            }),
        });
        if (!response.ok) return;

        const result = await response.json();

        if (result.is_match) {
            handleSuccess(response_time_ms);  // 전달
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
                // Reset the timer for the next emotion
                setEmotionStartTime(Date.now());
            } else {
                setGameState('finished');
                stopCameraAndDetection();
            }
        }, 2000);

    } catch (error) {
        console.error("Error logging interaction:", error);
        // 에러 발생 시에도 다음 시도를 위해 인터벌을 다시 시작할 수 있도록 합니다.
        if (gameState === 'playing') {
            startDetectionInterval();
        }
    }
  };
  
  const endCurrentSession = async () => {
    if (!sessionId) return;
    try {
      await fetch('/api/games/second-game/session/end/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          session_id: sessionId, 
          completed_count: completedCount,
          assistance_level: finalAssistanceLevel
        }),
      });
      setSessionId(null);
    } catch (error) {
      console.error("Error ending session:", error);
    }
  };

  const handleExit = async () => {
    stopCameraAndDetection();
    await endCurrentSession();
    navigate('/play/');
  };

  const handlePlayAgain = async () => {
    stopCameraAndDetection();
    await endCurrentSession();
    setGameState('explanation');
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
      {feedback === 'great' && <div className="game-feedback-correct"><h1>Awesome! 👍</h1></div>}
      <div className="emotion-display">
        <div className="emotion-emoji">{currentEmotion.emoji}</div>
        <div className="emotion-prompt">Let's make a {currentEmotion.name} face!</div>
      </div>
      <div className="camera-container">
        {/* onCanPlay 이벤트 핸들러를 제거하고 useEffect로 로직을 통합합니다. */}
        <video ref={videoRef} autoPlay playsInline muted></video>
        {showSparkles && <div className="sparkle-effect"></div>}
        <div className="camera-status-overlay">
            <p>Analyzing your expression...</p>
        </div>
      </div>
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
    <div className="second-game-page">
      {gameState === 'explanation' && renderExplanationPage()}
      {gameState === 'playing' && renderGamePage()}
      {gameState === 'finished' && renderGameFinishedModal()}
    </div>
  );
}

export default SecondGamePage;
