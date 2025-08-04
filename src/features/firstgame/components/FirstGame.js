import React from 'react';

function FirstGame({ name, image, onClick }) {
  return (
    <div className="quiz-card" onClick={() => onClick(name)}>
      <img src={image} alt={name} />
      <p>{name}</p>
    </div>
  );
}

export default FirstGame;