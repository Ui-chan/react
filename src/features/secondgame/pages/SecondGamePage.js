import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SecondGame.css';

const emotionData = [
  { name: '행복', emoji: '😄' },
  { name: '슬픔', emoji: '😢' },
  { name: '놀람', emoji: '😮' },
  { name: '화남', emoji: '😠' },
];

function SecondGamePage() {
  const [gameState, setGameState] = useState('explanation');
  const navigate = useNavigate();
  
  const [currentEmotionIndex, setCurrentEmotionIndex] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [showSparkles, setShowSparkles] = useState(false);
  const [feedback, setFeedback] = useState('');
  
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [emotionStartTime, setEmotionStartTime] = useState(null);
  const [finalAssistanceLevel, setFinalAssistanceLevel] = useState(null);

  const currentEmotion = emotionData[currentEmotionIndex];

  // --- 안정성을 위해 재구성된 로직 ---

  // 1. 카메라를 켜고 끄는 함수
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      console.log("Camera stopped.");
    }
  };

  const startCamera = async () => {
    stopCamera();
    setCameraError(null);
    setIsCameraReady(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCameraReady(true); // 카메라가 성공적으로 켜졌음을 상태에 저장
      }
    } catch (err) {
      console.error("카메라 접근 에러:", err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('카메라 권한이 거부되었어요. 브라우저 설정에서 이 사이트의 카메라 권한을 허용해주세요.');
      } else {
        setCameraError('카메라를 시작할 수 없어요. 다른 앱에서 카메라를 사용 중인지 확인해주세요.');
      }
    }
  };

  // 2. 카메라가 준비되면(isCameraReady=true) 세션 시작 API 호출
  useEffect(() => {
    if (isCameraReady && gameState === 'playing' && !sessionId) {
      const startSession = async () => {
        try {
          const response = await fetch('/api/games/session/start/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: 2, game_id: 2 }),
          });
          if (!response.ok) throw new Error('Failed to start session');
          const data = await response.json();
          setSessionId(data.session_id);
          console.log("Game session started with ID:", data.session_id);
        } catch (err) {
          console.error("세션 시작 에러:", err);
          setCameraError('게임 세션을 시작할 수 없습니다.');
        }
      };
      startSession();
    }
  }, [isCameraReady, gameState, sessionId]);

  // 3. 세션이 시작되거나 문제가 바뀔 때 타이머 시작
  useEffect(() => {
    // sessionId가 있어야만 (즉, API 호출이 성공해야만) 타이머를 시작
    if (sessionId && gameState === 'playing') {
      setEmotionStartTime(Date.now());
    }
  }, [sessionId, currentEmotionIndex, gameState]);

  // 컴포넌트가 사라질 때 무조건 카메라 정리
  useEffect(() => {
    return () => stopCamera();
  }, []);

  // '놀이 시작하기' 버튼은 이제 게임 상태 변경과 카메라 켜기만 담당
  const handleStartGame = () => {
    setGameState('playing');
    setCompletedCount(0);
    setCurrentEmotionIndex(0);
    setFinalAssistanceLevel(null);
    startCamera(); // 카메라 켜기 시작
  };

  // '확인' 버튼 클릭 시 로그 API 호출
  const handleConfirmation = async () => {
    if (feedback) return;
    const responseTimeMs = Date.now() - emotionStartTime;

    const logData = {
        session_id: sessionId,
        is_successful: true,
        response_time_ms: responseTimeMs, // 이제 정상적으로 계산됨
        interaction_data: {
            emotion_name: currentEmotion.name,
            emotion_emoji: currentEmotion.emoji
        }
    };
    try {
        const response = await fetch('/api/games/interaction/log/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(logData),
        });
        if (!response.ok) throw new Error('Failed to log interaction');
        
        setShowSparkles(true);
        setTimeout(() => setShowSparkles(false), 1000);
        setCompletedCount(prev => prev + 1);
        setFeedback('great');

        setTimeout(() => {
            setFeedback('');
            if (currentEmotionIndex < emotionData.length - 1) {
                setCurrentEmotionIndex(prev => prev + 1);
            } else {
                setGameState('finished');
            }
        }, 1500);
    } catch (error) {
        console.error("Error logging interaction:", error);
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
    stopCamera();
    await endCurrentSession();
    navigate('/play/');
  };

  const handlePlayAgain = async () => {
    stopCamera();
    await endCurrentSession();
    setGameState('explanation');
    setIsCameraReady(false);
  };
  
  const renderExplanationPage = () => (
    <div className="game-explanation-container">
      <h1><span role="img" aria-label="face emoji">😊</span> '표정 짓기' 놀이</h1>
      <p>
        화면에 나타난 표정을 부모님이 먼저 따라하고, <br/>
        아이가 그 표정을 모방하도록 유도해주세요. <br/>
        이 게임은 전면 카메라 사용 권한이 필요합니다.
      </p>
      <div className="game-buttons-container">
        <button onClick={() => navigate('/play/')} className="game-back-button">뒤로가기</button>
        <button onClick={handleStartGame} className="game-start-button">놀이 시작하기</button>
      </div>
    </div>
  );

  const renderGamePage = () => (
    <div className="second-game-container">
      {feedback === 'great' && <div className="game-feedback-correct"><h1>최고야! 👍</h1></div>}
      <div className="emotion-display">
        <div className="emotion-emoji">{currentEmotion.emoji}</div>
        <div className="emotion-prompt">{currentEmotion.name} 표정을 따라 해봐요!</div>
      </div>
      <div className="camera-container">
        {cameraError ? (
          <div className="camera-permission-overlay"><p className="camera-error-message">{cameraError}</p></div>
        ) : (
          <>
            <video ref={videoRef} autoPlay playsInline muted className="camera-feed"></video>
            {showSparkles && <div className="sparkle-effect"></div>}
            {!isCameraReady && 
              <div className="camera-permission-overlay"><p>카메라를 시작하는 중...</p></div>
            }
          </>
        )}
      </div>
      <button className="confirm-button" onClick={handleConfirmation} disabled={!isCameraReady || !sessionId}>
        확인했어요!
      </button>
      <div className="game-parent-guide">부모님 가이드: 아이와 함께 표정을 따라한 후 버튼을 눌러주세요.</div>
    </div>
  );

  const renderGameFinishedModal = () => (
    <div className="game-modal-overlay">
      <div className="game-modal-content">
        <h2>참! 잘했어요!</h2>
        <div className="stamp-container">
          {completedCount > 0 ? (
            Array.from({ length: completedCount }).map((_, index) => (
              <img key={index} src="/assets/goodjob.png" alt="정답 스탬프" className="stamp-image" />
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
    <div className="second-game-page">
      {gameState === 'explanation' && renderExplanationPage()}
      {gameState === 'playing' && renderGamePage()}
      {gameState === 'finished' && renderGameFinishedModal()}
    </div>
  );
}

export default SecondGamePage;