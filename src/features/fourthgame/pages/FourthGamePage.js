import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/FourthGame.css';

const allChoices = [
  { id: 1, name: 'Tayo the Little Car', thumbnail: '/assets/tayo.png', videoId: 'tVU53nGuPGw' },
  { id: 2, name: 'Pororo', thumbnail: '/assets/pororo.png', videoId: 'E0W5sJZ2d64' },
  { id: 3, name: 'Pinkfong Shark Family', thumbnail: '/assets/pinkfong.png', videoId: '761ae_KDg_Q' },
  { id: 4, name: 'Catch! Tiny Ping!', thumbnail: '/assets/teenieping.png', videoId: '8t7UQwX8Cr4' },
  { id: 5, name: 'Bread Barbershop', thumbnail: '/assets/bread.png', videoId: 'Q8J4sujhwq4' },
  { id: 6, name: 'Super Wings', thumbnail: '/assets/superwings.png', videoId: '5slE1nbCbl8' },
];

const shuffleArray = (array) => {
  return array.sort(() => Math.random() - 0.5);
};

const TOTAL_CHOICES = 3;

function FourthGamePage() {
  const [gameState, setGameState] = useState('explanation');
  const [choicesMade, setChoicesMade] = useState(0);
  const [selectedReward, setSelectedReward] = useState(null);
  const [activeChoiceId, setActiveChoiceId] = useState(null);
  const navigate = useNavigate();

  const [currentChoices, setCurrentChoices] = useState([]);
  
  // --- API 연동 상태 ---
  const [sessionId, setSessionId] = useState(null);
  const [choiceStartTime, setChoiceStartTime] = useState(null);
  const [finalAssistanceLevel, setFinalAssistanceLevel] = useState(null);

  const getNewChoices = () => {
    const shuffled = shuffleArray([...allChoices]);
    setCurrentChoices(shuffled.slice(0, 2));
  };

  useEffect(() => {
    if (gameState === 'choosing') {
      getNewChoices();
      setChoiceStartTime(Date.now()); // 새로운 선택지가 보일 때 시간 기록
    }
  }, [gameState, choicesMade]); // choicesMade가 바뀔 때도 새 선택지를 가져옴


  const playSound = () => {
    try {
      const sound = new Audio('/assets/select_sound.mp3');
      sound.play();
    } catch (error) {
      console.error("효과음 재생 에러:", error);
    }
  };

  const handleChoiceClick = async (choice) => {
    if (activeChoiceId) return;
    
    playSound();
    setActiveChoiceId(choice.id);

    const responseTimeMs = Date.now() - choiceStartTime;
    const logData = {
      session_id: sessionId,
      is_successful: true, // 선택은 항상 성공
      response_time_ms: responseTimeMs,
      interaction_data: {
        selected_item_name: choice.name,
        selected_item_videoId: choice.videoId,
        presented_choices: currentChoices.map(c => c.name)
      }
    };

    try {
      // 공용 로그 API 호출
      await fetch('/api/games/interaction/log/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData),
      });

      // 로그 저장 성공 후 보상 화면으로 전환
      setTimeout(() => {
        setSelectedReward(choice);
        setGameState('reward');
      }, 800);

    } catch (error) {
      console.error("Error logging interaction:", error);
      alert("게임 기록 저장에 실패했습니다.");
      setActiveChoiceId(null); // 에러 시 애니메이션 초기화
    }
  };

  const handleReturnToChoice = () => {
    const newChoicesMade = choicesMade + 1;
    setChoicesMade(newChoicesMade);
    setSelectedReward(null);
    setActiveChoiceId(null);

    if (newChoicesMade >= TOTAL_CHOICES) {
      setGameState('finished');
    } else {
      setGameState('choosing');
    }
  };

  const handleStartGame = async () => {
    try {
      // 공용 세션 시작 API 호출
      const response = await fetch('/api/games/session/start/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 2, game_id: 4 }), // user_id: 2, game_id: 4
      });
      if (!response.ok) throw new Error('Failed to start session');
      
      const data = await response.json();
      setSessionId(data.session_id);
      setGameState('choosing');
      setChoicesMade(0);
      setSelectedReward(null);
      setActiveChoiceId(null);
      setFinalAssistanceLevel(null);
    } catch (error) {
      console.error("Error starting game session:", error);
      alert("게임 세션을 시작하는 데 실패했습니다.");
    }
  };

  const endCurrentSession = async () => {
    if (!sessionId) return;
    try {
      await fetch('/api/games/fourth-game/session/end/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          session_id: sessionId, 
          choices_made: choicesMade,
          assistance_level: finalAssistanceLevel
        }),
      });
      setSessionId(null);
    } catch (error) {
      console.error("Error ending session:", error);
    }
  };
  
  const handlePlayAgain = async () => {
    await endCurrentSession();
    setGameState('explanation');
  };

  const handleExit = async () => {
    await endCurrentSession();
    navigate('/play/');
  };

  const renderExplanationPage = () => (
    <div className="game-explanation-container">
      <h1><span role="img" aria-label="hand pointing emoji">👆</span> "I Want This!" Game</h1>
      <p>
        This game shows two videos the child likes and lets them choose what they want to watch. <br/>
        Help the child verbally express their choice, like "I want to watch Tayo!" <br/>
        <strong>This helps develop functional communication skills.</strong>
      </p>
      <div className="game-buttons-container">
        <button onClick={handleExit} className="game-back-button">Go Back</button>
        <button onClick={handleStartGame} className="game-start-button">Start Game</button>
      </div>
    </div>
  );
  

  const renderChoosingPage = () => (
    <div className="fourth-game-container">
      <h2 className="choice-prompt">What do you want to watch? Choose one!</h2>
      <div className="choices-container">
        {currentChoices.map(choice => (
          <div 
            key={choice.id} 
            className={`choice-card ${activeChoiceId === choice.id ? 'selected' : ''}`} 
            onClick={() => handleChoiceClick(choice)}
          >
            <img src={choice.thumbnail} alt={choice.name} className="choice-thumbnail" />
            <p className="choice-name">{choice.name}</p>
          </div>
        ))}
      </div>
      <div className="turn-counter">Remaining Choices: {TOTAL_CHOICES - choicesMade}</div>
    </div>
  );
  
  const renderRewardPage = () => (
    <div className="reward-container">
      <div className="video-wrapper">
        <iframe
          src={`https://www.youtube.com/embed/${selectedReward.videoId}?autoplay=1`}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
      <button onClick={handleReturnToChoice} className="return-button">
        Finished Watching!
      </button>
    </div>
  );

  const renderGameFinishedModal = () => (
    <div className="game-modal-overlay">
      <div className="game-modal-content">
        <h2>Great Job!</h2>
        <div className="stamp-container">
          <p className="finish-message">You've completed the choice game!</p>
        </div>
        <div className="assistance-final-container">
          <p className="assistance-title">Did the child need help during the game?</p>
          <div className="assistance-buttons">
            <button 
              className={finalAssistanceLevel === 'NONE' ? 'selected' : ''}
              onClick={() => setFinalAssistanceLevel('NONE')}
            >No Help</button>
            <button 
              className={finalAssistanceLevel === 'VERBAL' ? 'selected' : ''}
              onClick={() => setFinalAssistanceLevel('VERBAL')}
            >Some Help</button>
            <button 
              className={finalAssistanceLevel === 'PHYSICAL' ? 'selected' : ''}
              onClick={() => setFinalAssistanceLevel('PHYSICAL')}
            >A Lot of Help</button>
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
    <div className="fourth-game-page">
      {gameState === 'explanation' && renderExplanationPage()}
      {gameState === 'choosing' && renderChoosingPage()}
      {gameState === 'reward' && renderRewardPage()}
      {gameState === 'finished' && renderGameFinishedModal()}
    </div>
  );
}

export default FourthGamePage;