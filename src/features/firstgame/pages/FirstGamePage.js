import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QuizCard from '../components/FirstGame';
import '../styles/FirstGame.css';

const gameData = [
  {
    prompt: "🍎 빨간 사과는 어디 있지?",
    correctAnswer: "사과",
    items: [
      { name: "사과", image: "/assets/apple.png" },
      { name: "자동차", image: "/assets/car.png" },
      { name: "오리", image: "/assets/duck.png" },
    ],
  },
  {
    prompt: "🍌 노란 바나나는 어디 있지?",
    correctAnswer: "바나나",
    items: [
      { name: "공", image: "/assets/ball.png" },
      { name: "바나나", image: "/assets/banana.png" },
      { name: "집", image: "/assets/house.png"   },
    ],
  },
  {
    prompt: "🌃 밤 그림은 어디 있지?",
    correctAnswer: "밤",
    items: [
      { name: "낮", image: "/assets/day.png" },
      { name: "밤", image: "/assets/night.png" },
      { name: "자동차", image: "/assets/car.png" },
    ],
  },
];

function FirstGamePage() {
  const [gameStarted, setGameStarted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isGameFinished, setIsGameFinished] = useState(false);
  const navigate = useNavigate();

  const [sessionId, setSessionId] = useState(null);
  const [questionStartTime, setQuestionStartTime] = useState(null);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [finalAssistanceLevel, setFinalAssistanceLevel] = useState(null);

  const currentQuestion = gameData[currentQuestionIndex];

  const handleStartGame = async () => {
    try {
      const response = await fetch('/api/games/session/start/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 2, game_id: 1 }),
      });
      if (!response.ok) throw new Error('Failed to start session');
      
      const data = await response.json();
      setSessionId(data.session_id);
      setGameStarted(true);
      setIsGameFinished(false);
      setCurrentQuestionIndex(0);
      setCorrectAnswers(0);
      setFinalAssistanceLevel(null);
    } catch (error) {
      console.error("Error starting game session:", error);
      alert("게임 세션을 시작하는 데 실패했습니다.");
    }
  };

  useEffect(() => {
    if (gameStarted && !isGameFinished) {
      setQuestionStartTime(Date.now());
    }
  }, [gameStarted, currentQuestionIndex, isGameFinished]);

  const handleAnswerClick = async (itemName) => {
    if (feedback) return;

    const isSuccessful = itemName === currentQuestion.correctAnswer;
    if (isSuccessful) {
      setCorrectAnswers(prevCount => prevCount + 1);
    }
    
    const logData = {
      session_id: sessionId,
      is_successful: isSuccessful,
      response_time_ms: Date.now() - questionStartTime,
      interaction_data: {
        prompt_text: currentQuestion.prompt,
        target_item: currentQuestion.correctAnswer,
        selected_item: itemName,
        all_items: currentQuestion.items.map(i => i.name),
      }
    };

    try {
      const response = await fetch('/api/games/interaction/log/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(logData),
      });
      if (!response.ok) throw new Error('Failed to log interaction');

      if (isSuccessful) {
        setFeedback('correct');
      }

      setTimeout(() => {
        setFeedback('');
        if (currentQuestionIndex < gameData.length - 1) {
          setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
          setIsGameFinished(true);
        }
      }, isSuccessful ? 1500 : 500);

    } catch (error) {
      console.error("Error logging interaction:", error);
      alert("게임 기록 저장에 실패했습니다.");
    }
  };

  const endCurrentSession = async () => {
    if (!sessionId) return;
    try {
      await fetch('/api/games/first-game/session/end/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          session_id: sessionId, 
          correct_answers: correctAnswers,
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
    setIsGameFinished(false);
    setGameStarted(false);
  };
  
  const renderExplanationPage = () => (
    <div className="explanation-container">
      <h1><span className="icon" role="img" aria-label="magnifying glass">🔎</span> '저기 봐!' 놀이</h1>
      <p>
        이 놀이는 아이와 함께 화면의 사물을 보며 <br />
        '저기 있네!' 하는 즐거움을 배우는 시간이에요. <br />
        아이가 사물에 시선을 맞추면 부모님이 칭찬과 함께 탭해주세요. <br />
        <strong>공동 주시(Joint Attention)</strong> 능력을 키우는 데 도움이 됩니다.
      </p>
      <div className="explanation-buttons">
        <button onClick={() => navigate('/play/')} className="back-button">뒤로가기</button>
        <button onClick={handleStartGame} className="start-button">놀이 시작하기</button>
      </div>
    </div>
  );

  const renderGamePage = () => (
    <div className="game-container">
      {feedback === 'correct' && <div className="feedback-correct"><h1>딩동댕! 🎉</h1></div>}
      <h2 className="game-prompt">{currentQuestion.prompt}</h2>
      <div className="cards-container">
        {currentQuestion.items.map((item) => (
          <QuizCard key={item.name} name={item.name} image={item.image} onClick={handleAnswerClick} />
        ))}
      </div>
      <div className="parent-guide">부모님 가이드: 아이가 정답을 바라보면 대신 카드를 눌러주세요!</div>
    </div>
  );

  const renderGameFinishedModal = () => (
    <div className="game-modal-overlay">
      <div className="game-modal-content">
        <h2>참! 잘했어요!</h2>
        <div className="stamp-container">
          {correctAnswers > 0 ? (
            Array.from({ length: correctAnswers }).map((_, index) => (
              <img key={index} src="/assets/goodjob.png" alt="정답 스탬프" className="stamp-image" />
            ))
          ) : ( <p className="no-stamp-message">아쉽지만, 다음 기회에 스탬프를 모아봐요!</p> )}
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
    <div className="first-game-page">
      {!gameStarted ? renderExplanationPage() : renderGamePage()}
      {isGameFinished && renderGameFinishedModal()}
    </div>
  );
}

export default FirstGamePage;