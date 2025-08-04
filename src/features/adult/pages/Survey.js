import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../styles/Survey.css'; // CSS 파일 경로

// 부모님용 하단 네비게이션 아이콘 정보
const navItems = [
  { id: 'homeadult', icon: '🏠', label: '홈' },
  { id: 'stats', icon: '📝', label: '행동 기록' }, // 22 -> behaviorLog
  { id: 'survey', icon: '📊', label: '설문' }, // stats -> survey, 성장 리포트 -> 설문
  { id: 'parentEdu', icon: '📚', label: '부모 교육' }, // parentEdu로 유지
];

const questions = [
    { id: 1, text: '아이와 눈을 자연스럽게 맞추나요?', isCritical: false, area: '사회적 상호작용 및 정서 공유' },
    { id: 2, text: '부모님 표정을 따라 하려고 하나요?', isCritical: false, area: '사회적 상호작용 및 정서 공유' },
    { id: 3, text: '재미있는 것을 발견했을 때, 부모님에게 보여주거나 손가락으로 가리키며 함께 보자고 하나요?', isCritical: true, area: '사회적 상호작용 및 정서 공유' },
    { id: 4, text: '까꿍 놀이, 간지럼 태우기 같은 상호작용 놀이를 즐기나요?', isCritical: false, area: '사회적 상호작용 및 정서 공유' },
    { id: 5, text: '부모님이 손가락으로 가리키는 곳을 쳐다보나요?', isCritical: true, area: '의사소통 및 공동 주시' },
    { id: 6, text: '이름을 불렀을 때 꾸준히 반응하나요?', isCritical: false, area: '의사소통 및 공동 주시' },
    { id: 7, text: '"공 줘", "안녕" 같은 간단한 지시를 이해하고 따르려고 하나요?', isCritical: false, area: '의사소통 및 공동 주시' },
    { id: 8, text: '다른 아이들에게 관심을 보이나요?', isCritical: true, area: '의사소통 및 공동 주시' },
    { id: 9, text: '장난감을 가지고 상상 놀이(역할 놀이)를 하나요?', isCritical: true, area: '놀이 및 행동 패턴' },
    { id: 10, text: '특정 물건이나 장난감의 한 부분에 비정상적으로 집착하나요?', isCritical: false, area: '놀이 및 행동 패턴' },
    { id: 11, text: '의미 없이 손이나 손가락을 흔들거나, 몸을 앞뒤로 흔드는 등 반복적인 행동을 자주 보이나요?', isCritical: true, area: '놀이 및 행동 패턴' },
    { id: 12, text: '새로운 환경이나 일상의 변화에 매우 민감하게 반응하나요?', isCritical: false, area: '놀이 및 행동 패턴' },
];

function Survey() { // 컴포넌트 이름 변경
  const navigate = useNavigate();
  const [userAnswers, setUserAnswers] = useState({});
  const [riskLevel, setRiskLevel] = useState('');
  const [recommendation, setRecommendation] = useState('');
  const [unansweredQuestions, setUnansweredQuestions] = useState([]);
  const [currentView, setCurrentView] = useState('start');
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedResult, setSelectedResult] = useState(null);

  const isSameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const fetchHistory = async () => {
    try {
        const userId = 2;
        const response = await fetch('/api/data/checklist/history/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: userId }),
        });
        if (!response.ok) throw new Error('Failed to fetch history');
        const data = await response.json();
        setHistory(data);
    } catch (error) {
        console.error("Error fetching history:", error);
    } finally {
        setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    const resultForSelectedDate = history.find(record => 
        isSameDay(new Date(record.created_at), selectedDate)
    );
    setSelectedResult(resultForSelectedDate || null);
  }, [selectedDate, history]);

  const handleAnswerChange = (questionId, answer) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    const missing = questions.filter(q => !userAnswers[q.id]);
    if (missing.length > 0) {
      setUnansweredQuestions(missing.map(q => q.id));
      return;
    }
    setUnansweredQuestions([]);

    let totalScore = 0;
    let criticalItemScore = 0;
    questions.forEach(q => {
      const answer = userAnswers[q.id];
      if (answer === 'yes') totalScore += 3;
      else if (answer === 'sometimes') totalScore += 2;
      else if (answer === 'rarely') totalScore += 1;
      if (q.isCritical && (answer === 'no' || answer === 'rarely')) {
        criticalItemScore += 1;
      }
    });

    let risk = '';
    let recommendationText = '';
    if (criticalItemScore >= 3 || totalScore <= 12) {
        risk = '높은 우려';
        recommendationText = '자폐 스펙트럼 장애의 핵심적인 특징들이 여러 개 나타날 가능성을 보입니다. 정확한 평가와 필요한 조기 개입을 위해 반드시 소아정신과 의사 또는 발달 전문가의 종합적인 평가를 받아보시는 것을 강력히 권고합니다.';
    } else if (criticalItemScore >= 1 || totalScore <= 24) {
        risk = '중간 우려';
        recommendationText = '몇 가지 영역에서 발달적 지원이 필요할 수 있음을 시사합니다. 아이의 놀이와 상호작용을 더 주의 깊게 관찰해 보세요. 우려가 지속된다면 전문가 상담을 고려해 보시는 것이 좋습니다.';
    } else {
        risk = '낮은 우려';
        recommendationText = '현재 아이의 사회적 의사소통 발달은 연령에 맞게 잘 이루어지고 있을 가능성이 높습니다. 앞으로도 아이의 발달에 꾸준한 관심을 가져주세요.';
    }

    setRiskLevel(risk);
    setRecommendation(recommendationText);
    
    const resultData = { user_id: 2, total_score: totalScore, critical_item_score: criticalItemScore, risk_level: risk, recommendation: recommendationText, answers: userAnswers };

    try {
        await fetch('/api/data/checklist/save/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(resultData),
        });
        await fetchHistory();
    } catch (error) {
        console.error("Error saving result:", error);
        alert("결과 저장에 실패했습니다.");
    }
    setCurrentView('result');
  };

  const startQuiz = () => {
    setUserAnswers({});
    setUnansweredQuestions([]);
    setCurrentView('quiz');
  };

  const resetToStartView = () => {
    setCurrentView('start');
  };

  const handleNavClick = (path) => {
    if (path === 'survey') return;
    navigate(`/${path}`);
  };

  const toggleInfoModal = () => {
    setShowInfoModal(!showInfoModal);
  };
  
  const tileClassName = ({ date, view }) => {
    if (view === 'month' && history.some(record => isSameDay(new Date(record.created_at), date))) {
        return 'record-day';
    }
    return null;
  };

  const renderInfoModal = () => (
    <div className="info-modal-overlay" onClick={toggleInfoModal}>
      <div className="info-modal-content" onClick={(e) => e.stopPropagation()}>
        <button onClick={toggleInfoModal} className="close-modal-button top-right">×</button>
        <h4>체크리스트 정보</h4>
        <h5>주요 문항 구성 근거</h5>
        <ul>
          <li><strong>관심 공유 (3번 문항):</strong> 타인과 관심의 대상을 공유하려는 의도로, 자폐 스펙트럼 장애(ASD)의 가장 핵심적인 초기 결함 중 하나입니다.</li>
          <li><strong>상상 놀이 (9번 문항):</strong> 고차원적 사고 능력으로, ASD 아동은 상징 놀이 발달이 지연되는 경향이 있습니다.</li>
          <li><strong>반복 행동 (11번 문항):</strong> 사회성 결함만큼이나 중요한 ASD의 조기 지표로 강조됩니다.</li>
        </ul>
        <h5>주요 용어 설명</h5>
        <ul>
          <li><strong>M-CHAT-R/F:</strong> 전 세계적으로 널리 사용하는 영유아 자폐 스펙트럼 장애 선별 검사입니다. 진단이 아닌, 전문가의 평가가 필요한 아이를 조기에 발견하기 위한 도구입니다.</li>
          <li><strong>ESDM:</strong> ASD로 진단받았거나 고위험군인 영유아를 위한 조기 개입(치료) 프로그램입니다.</li>
          <li><strong>DSM-5:</strong> 미국 정신의학회에서 발행하는 정신질환 진단 및 통계 편람으로, 전문가들이 ASD를 공식적으로 진단할 때 사용하는 표준 기준입니다.</li>
        </ul>
        <h5>평가 기준의 근거</h5>
        <p>
          본 체크리스트의 위험도 평가 모델은 세계적으로 검증된 M-CHAT-R/F의 알고리즘을 직접적으로 적용한 것입니다.
        </p>
        <button onClick={toggleInfoModal} className="primary-button">닫기</button>
      </div>
    </div>
  );

  return (
    <div className="adult-page-layout">
      <header className="adult-page-header">
        <h1 className="header-logo">𝒁𝒆𝒓𝒐𝑫𝒐𝒔𝒆</h1>
        <button className="info-button" onClick={toggleInfoModal}>?</button>
      </header>

      <main className="adult-page-content">
        {currentView === 'start' && (
          <>
            <h2 className="content-title">발달 체크리스트</h2>
            <section className="info-card">
              <h3>우리아이 발달 체크리스트 (만 16~36개월용)</h3>
              <p className="disclaimer">
                <strong>필수 고지 사항:</strong> 본 체크리스트는 참고용 선별 도구이며, 의학적 진단을 대체할 수 없습니다. 우려되는 점이 있다면 반드시 전문가와 상담하시기 바랍니다.
              </p>
              <button className="primary-button" onClick={startQuiz}>
                설문 시작하기
              </button>
            </section>
            <section className="info-card">
              <h3>성장 리포트</h3>
              <p className="card-subtitle">달력에서 기록을 보고 싶은 날짜를 선택하세요.</p>
              <div className="calendar-container">
                <Calendar
                  onChange={setSelectedDate}
                  value={selectedDate}
                  tileClassName={tileClassName}
                  formatDay={(locale, date) => date.getDate()}
                  calendarType="gregory"
                />
              </div>
              <div className="result-display-area">
                {selectedResult ? (
                    <>
                        <h4>{new Date(selectedResult.created_at).toLocaleDateString()} 기록</h4>
                        <div className={`risk-level risk-${selectedResult.risk_level}`}>
                            <strong>{selectedResult.risk_level}</strong>
                        </div>
                        <p className="recommendation-text">{selectedResult.recommendation}</p>
                    </>
                ) : (
                    <p className="no-record-text">
                        {loadingHistory ? '기록을 불러오는 중...' : '선택한 날짜에 기록이 없습니다.'}
                    </p>
                )}
              </div>
            </section>
          </>
        )}

        {currentView === 'quiz' && (
          <div className="quiz-view-container">
            <h2 className="content-title">발달 체크리스트</h2>
            {questions.map(q => (
              <section key={q.id} className="question-card">
                <p className="question-text">{q.id}. {q.text}</p>
                <div className="options-container">
                  {['예', '가끔', '거의 안함', '아니오'].map(option => {
                    const valueMap = {'예': 'yes', '가끔': 'sometimes', '거의 안함': 'rarely', '아니오': 'no'};
                    const value = valueMap[option];
                    return (
                      <label key={value} className="option-label">
                        <input type="radio" name={`question-${q.id}`} value={value} checked={userAnswers[q.id] === value} onChange={() => handleAnswerChange(q.id, value)} />
                        <span>{option}</span>
                      </label>
                    );
                  })}
                </div>
              </section>
            ))}
            {unansweredQuestions.length > 0 && (
              <p className="error-message">
                답변하지 않은 문항이 있습니다: {unansweredQuestions.join(', ')}번
              </p>
            )}
            <div className="quiz-actions">
                <button className="secondary-button" onClick={resetToStartView}>처음으로 돌아가기</button>
                <button className="primary-button" onClick={handleSubmit}>결과 보기</button>
            </div>
          </div>
        )}

        {currentView === 'result' && (
          <section className="info-card result-card">
            <h3>체크리스트 결과</h3>
            <div className={`risk-level risk-${riskLevel}`}>
              <strong>{riskLevel}</strong>
            </div>
            <p className="recommendation-text">{recommendation}</p>
            <button className="secondary-button" onClick={resetToStartView}>
              다시 하기
            </button>
          </section>
        )}
      </main>

      <footer className="bottom-navigation">
        {navItems.map((item) => (
            <button key={item.id} className={`nav-item ${item.id === 'survey' ? 'active' : ''}`} onClick={() => handleNavClick(item.id)}>
                <div className="nav-icon">{item.icon}</div>
                <span className="nav-label">{item.label}</span>
            </button>
        ))}
      </footer>

      {showInfoModal && renderInfoModal()}
    </div>
  );
}

export default Survey; // export 이름 변경