import React from 'react';
import '../styles/ThirdGame.css';

function ThirdGameCard({ card, isFlipped, isMatched, onClick }) {
  const handleClick = () => {
    if (!isFlipped && !isMatched) {
      onClick(card);
    }
  };

  return (
    <div
      className={`third-game-card ${isFlipped || isMatched ? 'flipped' : ''} ${isMatched ? 'matched' : ''}`}
      onClick={handleClick}
    >
      <div className="third-game-card-inner">
        <div className="third-game-card-front">
          <img src={card.quiz_image} alt={card.correct_answer} />
        </div>
        <div className="third-game-card-back"></div>
      </div>
    </div>
  );
}

export default ThirdGameCard;