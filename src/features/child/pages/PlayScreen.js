import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/PlayScreen.css';

// 각 게임에 대한 정보
const gameCards = [
  {
    path: '/firstgame',
    title: '저기 봐!',
    description: '부모님과 함께 사물을 찾으며 공동 주시 능력을 길러요.',
    icon: '🔎',
  },
  {
    path: '/secondgame',
    title: '표정 짓기',
    description: '카메라를 보며 표정을 따라하며 사회적 모방을 배워요.',
    icon: '😊',
  },
  {
    path: '/thirdgame',
    title: '공 주고받기',
    description: '공을 주고받으며 차례 지키기와 상호작용을 경험해요.',
    icon: '⚽',
  },
  {
    path: '/fourthgame',
    title: '나 이거 원해!',
    description: '좋아하는 것을 선택하며 기능적 의사소통을 배워요.',
    icon: '👆',
  },
];

// 하단 네비게이션 아이콘 정보
const navItems = [
    { id: 'homechild', icon: '🏠', label: '홈' },
    { id: 'play', icon: '🎮', label: '놀이' },
    // '앨범' -> '스탬프', id를 'stamps'로 변경
    { id: 'stamp', icon: '🌟', label: '스탬프' },
    { id: 'shop', icon: '🛒', label: '상점' },
];


function PlayScreen() {
  const navigate = useNavigate();

  const handleCardClick = (path) => {
    navigate(path);
  };

  // navigate 로직을 활성화하여 페이지 이동이 되도록 수정
  const handleNavClick = (path) => {
    navigate(`/${path}`);
  };

  return (
    <div className="play-screen-layout">
      {/* 상단 헤더 */}
      <header className="play-screen-header">
        <h1 className="header-logo">𝒁𝒆𝒓𝒐𝑫𝒐𝒔𝒆</h1>
      </header>

      {/* 메인 콘텐츠 (스크롤 가능 영역) */}
      <main className="play-screen-content">
        <h2 className="content-title">놀이 선택</h2>
        <p className="content-subtitle">하고 싶은 놀이를 골라보세요!</p>
        <div className="game-card-container">
          {gameCards.map((card) => (
            <div 
              key={card.path} 
              className="game-card" 
              onClick={() => handleCardClick(card.path)}
            >
              <div className="game-card-icon">{card.icon}</div>
              <h3 className="game-card-title">{card.title}</h3>
              <p className="game-card-description">{card.description}</p>
            </div>
          ))}
        </div>
      </main>

      {/* 하단 네비게이션 바 */}
      <footer className="bottom-navigation">
        {navItems.map((item) => (
            <button 
                key={item.id} 
                className={`nav-item ${item.id === 'play' ? 'active' : ''}`}
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

export default PlayScreen;