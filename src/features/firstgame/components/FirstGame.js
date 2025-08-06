import React from 'react';
import '../styles/FirstGame.css'; // FirstGamePage와 동일한 CSS 사용

// 각 퀴즈 카드를 렌더링하는 컴포넌트
function FirstGame({ name, image, onClick }) {
  return (
    // --- 이미지 아래 이름(name)을 표시하는 부분을 삭제했습니다 ---
    <div className="quiz-card" onClick={() => onClick(name)}>
      <div className="quiz-card-image-container">
        <img src={image} alt={name} className="quiz-card-image" />
      </div>
    </div>
  );
}

export default FirstGame;