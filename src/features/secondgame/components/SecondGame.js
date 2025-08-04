@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css');

/* 전체 페이지 */
.second-game-page {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  min-height: 100vh;
  padding: 20px;
  box-sizing: border-box;
  font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f0f4f8;
}

/* 설명 페이지 */
.game-explanation-container {
  background-color: white;
  padding: 35px 40px;
  border-radius: 24px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  width: 100%;
  max-width: 500px;
  box-sizing: border-box;
  text-align: center;
}

.game-explanation-container h1 {
  font-size: 2rem;
  font-weight: 700;
  color: #212529;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.game-explanation-container p {
  font-size: 1.05rem;
  line-height: 1.7;
  color: #495057;
  margin: 20px 0 30px 0;
}

.game-buttons-container {
  display: flex;
  gap: 12px;
}

.game-start-button, .game-back-button {
  flex-grow: 1;
  font-size: 1.2rem;
  font-weight: 600;
  padding: 16px 20px;
  border-radius: 16px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}

.game-start-button {
  background-color: #20c997;
  color: white;
}

.game-back-button {
  background-color: #f1f3f5;
  color: #495057;
  border: 1px solid #dee2e6;
}

/* 게임 진행 페이지 */
.second-game-container {
  width: 100%;
  max-width: 500px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.emotion-display {
  background-color: #ffffff;
  border-radius: 24px;
  padding: 40px;
  margin-bottom: 30px;
  width: 100%;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
}

.emotion-emoji {
  font-size: 8rem;
  line-height: 1;
  margin-bottom: 20px;
}

.emotion-prompt {
  font-size: 2rem;
  font-weight: 700;
  color: #343a40;
}

.confirm-button {
  width: 100%;
  font-size: 1.5rem;
  font-weight: 700;
  padding: 20px;
  border-radius: 20px;
  border: none;
  background-color: #12b886;
  color: white;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 15px rgba(18, 184, 134, 0.3);
}

.confirm-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(18, 184, 134, 0.4);
}

.game-parent-guide {
  margin-top: 20px;
  font-size: 0.9rem;
  color: #868e96;
}


/* 공통 피드백/모달 스타일 */
.game-feedback-correct {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 4rem;
  color: #fcc419;
  z-index: 10;
}

.game-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.55);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.game-modal-content {
  background: white;
  padding: 32px;
  border-radius: 24px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
  width: 85%;
  max-width: 340px;
}

.game-modal-content h2 {
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 8px;
  color: #212529;
}

.stamp-container {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
  border-radius: 16px;
  padding: 20px;
  margin: 24px 0 32px 0;
  min-height: 100px;
}

.stamp-image {
  width: 80px;
  height: 80px;
  margin: 5px;
}

.no-stamp-message {
  font-size: 1rem;
  color: #868e96;
  font-weight: 500;
}

.game-modal-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.game-modal-button {
  padding: 12px 28px;
  border-radius: 14px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid transparent;
  white-space: nowrap;
}

.game-exit-button {
  background-color: #f1f3f5;
  color: #495057;
  border-color: #dee2e6;
}

.game-play-again-button {
  background-color: #20c997;
  color: white;
}