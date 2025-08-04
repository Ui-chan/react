import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HomeAdult.css'; // CSS 파일 경로 수정

// 부모님용 하단 네비게이션 아이콘 정보
const navItems = [
    { id: 'homeadult', icon: '🏠', label: '홈' },
    { id: 'stats', icon: '📝', label: '행동 기록' }, // 22 -> behaviorLog
    { id: 'survey', icon: '📊', label: '설문' }, // stats -> survey, 성장 리포트 -> 설문
    { id: 'parentEdu', icon: '📚', label: '부모 교육' }, // parentEdu로 유지
  ];

function HomeAdult() { // 컴포넌트 이름 변경
    const navigate = useNavigate();
    // TODO: 실제 로그인된 부모/아이 정보를 API로 불러와야 합니다.
    const [userInfo, setUserInfo] = useState({
        username: 'an2',
        level: 3,
        expPercent: 85,
        levelTitle: '정서 표현 마스터사우루스',
        lastGameDays: 2,
        recentSessionCount: 12,
        expectedPointGain: 6,
    });

    const handleNavClick = (path) => {
        if (path === 'homepage') return;
        navigate(`/${path}`);
    };

    return (
        <div className="adult-page-layout">
            <header className="adult-page-header">
                <h1 className="header-logo">𝒁𝒆𝒓𝒐𝑫𝒐𝒔𝒆</h1>
            </header>

            <main className="adult-page-content">
                {/* 프로필 카드 */}
                <section className="profile-card">
                    <div className="profile-image-wrapper">
                        {/* TODO: 사용자의 대표 캐릭터 이미지로 교체 */}
                        <img src="/assets/character_idle.png" alt="대표 캐릭터" className="profile-character" />
                    </div>
                    <h2 className="profile-name">{userInfo.username}</h2>
                    <div className="level-info">
                        <span className="level-text">LV.{userInfo.level}</span>
                        <div className="progress-bar-container">
                            <div className="progress-bar-fill" style={{ width: `${userInfo.expPercent}%` }}></div>
                        </div>
                    </div>
                    <span className="level-description">{userInfo.levelTitle}</span>
                </section>

                {/* 훈련 섹션 */}
                <section className="info-card">
                    <div className="card-header">
                        <h3>훈련</h3>
                        <span className="update-text">최근 게임 {userInfo.lastGameDays}일 전 &gt;</span>
                    </div>
                    <div className="training-summary">
                        {/* 도넛 차트와 범례 */}
                        <div className="donut-chart-container">
                            {/* 실제 차트 라이브러리로 대체될 수 있는 CSS 기반 차트 */}
                        </div>
                        <div className="score-info">
                            <p>최근 학습 횟수</p>
                            <p className="score">{userInfo.recentSessionCount}회</p>
                            <p className="expected-score">예상 점수 +{userInfo.expectedPointGain}점</p>
                        </div>
                    </div>
                </section>
                
                <div className="grid-container">
                    {/* 부모 교육 섹션 */}
                    <section className="info-card">
                        <div className="card-header">
                            <h3>부모 교육</h3>
                            <span className="update-text">최근 10시간 전 &gt;</span>
                        </div>
                        <div className="education-summary">
                            {/* 교육 콘텐츠 요약 */}
                            <p>아이의 상호작용을 늘리는 꿀팁!</p>
                        </div>
                    </section>

                    {/* 행동 기록 섹션 */}
                    <section className="info-card">
                        <div className="card-header">
                            <h3>행동 기록</h3>
                            <span className="update-text">오늘 3회 기록 &gt;</span>
                        </div>
                         <div className="behavior-summary">
                            {/* 행동 기록 요약 */}
                            <p>긍정적 행동이 늘고 있어요!</p>
                        </div>
                    </section>
                </div>
            </main>

            <footer className="bottom-navigation">
                {navItems.map((item) => (
                    <button 
                        key={item.id} 
                        className={`nav-item ${item.id === 'homeadult' ? 'active' : ''}`}
                        onClick={() => handleNavClick(item.id)}
                    >
                        <div className="nav-icon">{item.icon}</div>
                        <span className="nav-label">{item.label}</span>
                    </button>
                ))}
            </footer>
        </div>
    );
}

export default HomeAdult; // 컴포넌트 이름 변경