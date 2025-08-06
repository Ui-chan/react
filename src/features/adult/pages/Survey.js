import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import '../styles/Survey.css';

// Navigation items for parents
const navItems = [
  { id: 'homeadult', icon: '🏠', label: 'Home' },
  { id: 'stats', icon: '📝', label: 'Behavior Log' },
  { id: 'survey', icon: '📊', label: 'Survey' },
  { id: 'parentEdu', icon: '📚', label: 'Parent Ed.' },
];

const questions = [
    { id: 1, text: 'Does your child make eye contact with you naturally?', isCritical: false, area: 'Social Interaction and Emotional Sharing' },
    { id: 2, text: 'Does your child try to imitate your facial expressions?', isCritical: false, area: 'Social Interaction and Emotional Sharing' },
    { id: 3, text: 'When your child finds something interesting, do they show it to you or point at it to share the moment?', isCritical: true, area: 'Social Interaction and Emotional Sharing' },
    { id: 4, text: 'Does your child enjoy interactive games like peek-a-boo or being tickled?', isCritical: false, area: 'Social Interaction and Emotional Sharing' },
    { id: 5, text: 'Does your child look where you are pointing?', isCritical: true, area: 'Communication and Joint Attention' },
    { id: 6, text: 'Does your child consistently respond when their name is called?', isCritical: false, area: 'Communication and Joint Attention' },
    { id: 7, text: 'Does your child try to understand and follow simple instructions like "Give me the ball" or "Wave bye-bye"?', isCritical: false, area: 'Communication and Joint Attention' },
    { id: 8, text: 'Does your child show interest in other children?', isCritical: true, area: 'Communication and Joint Attention' },
    { id: 9, text: 'Does your child engage in pretend play (role-playing) with toys?', isCritical: true, area: 'Play and Behavioral Patterns' },
    { id: 10, text: 'Is your child unusually attached to a specific object or part of a toy?', isCritical: false, area: 'Play and Behavioral Patterns' },
    { id: 11, text: 'Does your child frequently show repetitive behaviors, like flapping hands/fingers or rocking their body back and forth, without a clear purpose?', isCritical: true, area: 'Play and Behavioral Patterns' },
    { id: 12, text: 'Does your child react very sensitively to new environments or changes in daily routines?', isCritical: false, area: 'Play and Behavioral Patterns' },
];

function Survey() {
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
        risk = 'High Risk';
        recommendationText = 'This suggests a potential for several core features of Autism Spectrum Disorder. For an accurate assessment and necessary early intervention, we strongly recommend a comprehensive evaluation by a pediatric psychiatrist or developmental specialist.';
    } else if (criticalItemScore >= 1 || totalScore <= 24) {
        risk = 'Moderate Risk';
        recommendationText = 'This suggests that developmental support may be needed in some areas. Observe your child\'s play and interactions more closely. If concerns persist, consider consulting a specialist.';
    } else {
        risk = 'Low Risk';
        recommendationText = 'Your child\'s social and communication development appears to be on track for their age. Continue to show consistent interest in their development.';
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
        alert("Failed to save the result.");
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
        <h4>Checklist Information</h4>
        <h5>Basis for Key Questions</h5>
        <ul>
          <li><strong>Sharing Interests (Q3):</strong> The intention to share objects of interest with others is a core early deficit in Autism Spectrum Disorder (ASD).</li>
          <li><strong>Pretend Play (Q9):</strong> A higher-order thinking skill that forms the basis of 'Theory of Mind'. Children with ASD tend to show delays in symbolic play development.</li>
          <li><strong>Repetitive Behaviors (Q11):</strong> Emphasized as a key early indicator, as significant as social deficits in recent research.</li>
        </ul>
        <h5>Key Terminology</h5>
        <ul>
          <li><strong>M-CHAT-R/F:</strong> A widely used screening tool for toddlers to assess risk for Autism Spectrum Disorder. It is not a diagnostic tool but helps identify children who may need further evaluation.</li>
          <li><strong>ESDM:</strong> The Early Start Denver Model is an early intervention program for young children with or at risk for ASD.</li>
          <li><strong>DSM-5:</strong> The Diagnostic and Statistical Manual of Mental Disorders, used by clinicians to diagnose various mental health conditions, including ASD.</li>
        </ul>
        <h5>Basis for Scoring Criteria</h5>
        <p>
          The risk assessment model in this checklist is directly adapted from the globally validated M-CHAT-R/F algorithm.
        </p>
        <button onClick={toggleInfoModal} className="primary-button">Close</button>
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
            <h2 className="content-title">Development Checklist</h2>
            <section className="info-card">
              <h3>Child Development Checklist (16-36 months)</h3>
              <p className="disclaimer">
                <strong>Disclaimer:</strong> This checklist is a screening tool to help parents understand their child's development. It is not a medical diagnosis and cannot replace a professional evaluation. If you have any concerns, please consult a pediatrician or developmental specialist.
              </p>
              <button className="primary-button" onClick={startQuiz}>
                Start Survey
              </button>
            </section>
            <section className="info-card">
              <h3>Growth Report</h3>
              <p className="card-subtitle">Select a date on the calendar to view the record.</p>
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
                        <h4>{new Date(selectedResult.created_at).toLocaleDateString()} Record</h4>
                        <div className={`risk-level risk-${selectedResult.risk_level}`}>
                            <strong>{selectedResult.risk_level}</strong>
                        </div>
                        <p className="recommendation-text">{selectedResult.recommendation}</p>
                    </>
                ) : (
                    <p className="no-record-text">
                        {loadingHistory ? 'Loading records...' : 'No record for the selected date.'}
                    </p>
                )}
              </div>
            </section>
          </>
        )}

        {currentView === 'quiz' && (
          <div className="quiz-view-container">
            <h2 className="content-title">Development Checklist</h2>
            {questions.map(q => (
              <section key={q.id} className="question-card">
                <p className="question-text">{q.id}. {q.text}</p>
                <div className="options-container">
                  {['Yes', 'Sometimes', 'Rarely', 'No'].map(option => {
                    const valueMap = {'Yes': 'yes', 'Sometimes': 'sometimes', 'Rarely': 'rarely', 'No': 'no'};
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
                There are unanswered questions: #{unansweredQuestions.join(', ')}
              </p>
            )}
            <div className="quiz-actions">
                <button className="secondary-button" onClick={resetToStartView}>Back to Start</button>
                <button className="primary-button" onClick={handleSubmit}>View Results</button>
            </div>
          </div>
        )}

        {currentView === 'result' && (
          <section className="info-card result-card">
            <h3>Checklist Results</h3>
            <div className={`risk-level risk-${riskLevel}`}>
              <strong>{riskLevel}</strong>
            </div>
            <p className="recommendation-text">{recommendation}</p>
            <button className="secondary-button" onClick={resetToStartView}>
              Try Again
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

export default Survey;