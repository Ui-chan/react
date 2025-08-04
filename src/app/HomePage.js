 // HomePage.js
 import React from 'react';
 import '../styles/HomePage.css'; // 기존 스타일 유지
 // import zerodose_img from '../features/assets/zerodose_logo.svg'; // 이 라인을 삭제합니다.
 
 export default function HomePage({ onNavClick, currentScreen }) {
   return (
     <div className="home-screen-container">
       {/* 헤더 */}
       <header className="stats-header">
         <h1 className="logo">𝒁𝒆𝒓𝒐𝑫𝒐𝒔𝒆</h1>
       </header>
 
       {/* 메인 콘텐츠 */}
       <main className="home-content">
         {/* 프로필 카드: 추가 구성 */}
         <section className="profile-card">
           <div className="profile-image-wrapper">
             <img
             src="/assets/zerodose_logo.svg" // 경로를 public 폴더 기준으로 수정
             alt="ZeroDose Logo"
             className="profile-character"
             />
           </div>
           <h2 className="profile-name">은우우공룡</h2>
           <div className="level-info">
             <span className="level-text">LV.3</span>
             <div className="progress-bar-container">
               <div className="progress-bar-fill" style={{ width: '85%' }}></div>
             </div>
             <span className="level-description">정서 표현 마스터사우루스</span>
           </div>
         </section>
 
         {/* 훈련 섹션 */}
         <section className="training-section card">
           <div className="card-header">
             <h3>훈련</h3>
             <span className="last-updated-text">최근 게임 2일 전 &gt;</span>
           </div>
           <div className="training-summary">
             <div className="donut-chart-container">
               <div className="chart-center"></div>
               <div className="chart-segment segment-1"></div>
               <div className="chart-segment segment-2"></div>
               <div className="chart-segment segment-3"></div>
               <div className="chart-legend">
                 <div className="legend-item"><span className="legend-dot dot-1"></span>자기 이해</div>
                 <div className="legend-item"><span className="legend-dot dot-2"></span>정서 표현</div>
                 <div className="legend-item"><span className="legend-dot dot-3"></span>타인 이해</div>
               </div>
             </div>
             <div className="score-info">
               <p>최근 학습 횟수</p>
               <p className="score">12회</p>
               <p className="expected-score">예상 점수 +6점</p>
             </div>
           </div>
         </section>
 
         {/* 부모 교육 & 행동 기록 */}
         <section className="two-column-sections">
           {/* 부모 교육 */}
           <div className="parent-education-section card">
             <div className="card-header">
               <h3>부모 교육</h3>
               <span className="last-updated-text">최근 10시간 전 &gt;</span>
             </div>
             <div className="education-categories">
               <div className="category-item">
                 <span>자폐증</span>
                 <div className="category-progress-bar-container">
                   <div className="category-progress-bar-fill" style={{ width: '70%' }}></div>
                 </div>
               </div>
               <div className="category-item">
                 <span>상호작용</span>
                 <div className="category-progress-bar-container">
                   <div className="category-progress-bar-fill" style={{ width: '50%' }}></div>
                 </div>
               </div>
               <div className="category-item">
                 <span>발달지연</span>
                 <div className="category-progress-bar-container">
                   <div className="category-progress-bar-fill" style={{ width: '80%' }}></div>
                 </div>
               </div>
               <div className="category-item">
                 <span>중증장애</span>
                 <div className="category-progress-bar-container">
                   <div className="category-progress-bar-fill" style={{ width: '40%' }}></div>
                 </div>
               </div>
             </div>
           </div>
 
           {/* 행동 기록 */}
           <div className="behavior-log-section card">
             <div className="card-header">
               <h3>행동 기록</h3>
               <span className="last-updated-text">최근 24시간 전 &gt;</span>
             </div>
             <div className="behavior-buttons-grid">
               <button className="behavior-circle-button">
                 <span>무응답</span>
                 <span className="count">5회</span>
               </button>
               <button className="behavior-circle-button">
                 <span>반응성</span>
                 <span className="count">3회</span>
               </button>
             </div>
           </div>
         </section>
       </main>
 
     </div>
   );
 }
 