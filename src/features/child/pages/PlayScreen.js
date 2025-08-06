import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/PlayScreen.css';

// Information for each game
const gameCards = [
  {
    path: '/firstgame',
    title: 'Look Over There!',
    description: 'Develop joint attention skills by finding objects with a parent.',
    icon: '🔎',
  },
  {
    path: '/secondgame',
    title: 'Copy the Face',
    description: 'Learn social imitation by copying expressions in the camera.',
    icon: '😊',
  },
  {
    path: '/thirdgame',
    title: 'Ball Toss',
    description: 'Experience turn-taking and interaction by passing a ball.',
    icon: '⚽',
  },
  {
    path: '/fourthgame',
    title: 'I Want This!',
    description: 'Learn functional communication by choosing what you like.',
    icon: '👆',
  },
];

// Bottom navigation icon information
const navItems = [
    { id: 'homechild', icon: '🏠', label: 'Home' },
    { id: 'play', icon: '🎮', label: 'Play' },
    { id: 'stamp', icon: '🌟', label: 'Stamps' },
    { id: 'shop', icon: '🛒', label: 'Shop' },
];


function PlayScreen() {
  const navigate = useNavigate();

  const handleCardClick = (path) => {
    navigate(path);
  };

  const handleNavClick = (path) => {
    navigate(`/${path}`);
  };

  return (
    <div className="play-screen-layout">
      {/* Top Header */}
      <header className="play-screen-header">
        <h1 className="header-logo">𝒁𝒆𝒓𝒐𝑫𝒐𝒔𝒆</h1>
      </header>

      {/* Main Content (Scrollable Area) */}
      <main className="play-screen-content">
        <h2 className="content-title">Select a Game</h2>
        <p className="content-subtitle">Choose a game you want to play!</p>
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

      {/* Bottom Navigation Bar */}
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