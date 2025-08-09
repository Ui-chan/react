import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/StampScreen.css';

// Bottom navigation icon information
const navItems = [
    { id: 'homechild', icon: '🏠', label: 'Home' },
    { id: 'play', icon: '🎮', label: 'Play' },
    { id: 'stamp', icon: '🌟', label: 'Stamps' },
    { id: 'shop', icon: '🛒', label: 'Shop' },
];

const STAMPS_PER_PAGE = 20; // 20 stamps per page (5x4)

function StampScreen() {
    const navigate = useNavigate();
    const [stampInfo, setStampInfo] = useState({ username: 'User', stamp_count: 0 });
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);

    // --- [추가] 드래그 기능을 위한 state 및 ref ---
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [dragOffset, setDragOffset] = useState(0);
    const pagesRef = useRef(null);
    // ---------------------------------------------

    const totalPages = Math.ceil(stampInfo.stamp_count / STAMPS_PER_PAGE);

    useEffect(() => {
        const fetchStamps = async () => {
            try {
                const userId = 2;
                const response = await fetch(`/api/users/stamps/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: userId }),
                });
                if (!response.ok) throw new Error('Failed to fetch stamps');
                const data = await response.json();
                setStampInfo(data);
            } catch (error) {
                console.error("Error fetching stamps:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStamps();
    }, []);

    const handleNavClick = (path) => {
        if (path !== 'stamp') {
            navigate(`/${path}`);
        }
    };

    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 0));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages - 1));
    };

    // --- [추가] 드래그 이벤트 핸들러 함수들 ---

    const handleDragStart = (e) => {
        setIsDragging(true);
        // 터치 이벤트와 마우스 이벤트를 구분하여 시작 X좌표 저장
        const currentX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        setStartX(currentX);
        if (pagesRef.current) {
            // 드래그 중에는 transition 효과를 제거하여 부드럽게 만듬
            pagesRef.current.style.transition = 'none';
        }
    };

    const handleDragMove = (e) => {
        if (!isDragging) return;
        // 드래그 중 텍스트 선택 등 기본 동작 방지
        e.preventDefault();
        const currentX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        setDragOffset(currentX - startX);
    };

    const handleDragEnd = () => {
        if (!isDragging) return;
        setIsDragging(false);

        if (pagesRef.current) {
            // 드래그가 끝나면 transition 효과를 다시 적용
            pagesRef.current.style.transition = 'transform 0.5s ease-in-out';
            
            // 페이지 너비의 1/4 이상 드래그했을 때 페이지를 넘김
            const threshold = pagesRef.current.offsetWidth / 4;

            if (dragOffset < -threshold && currentPage < totalPages - 1) {
                handleNextPage();
            } else if (dragOffset > threshold && currentPage > 0) {
                handlePrevPage();
            }
        }
        
        // 드래그 오프셋 초기화
        setDragOffset(0);
    };
    // ---------------------------------------------


    return (
        <div className="stamp-screen-layout">
            <header className="stamp-screen-header">
                <h1 className="header-logo">𝒁𝒆𝒓𝒐𝑫𝒐𝒔𝒆</h1>
            </header>

            <main className="stamp-screen-content">
                <h2 className="content-title">Stamp Book</h2>
                
                <div className="stamp-summary-box">
                    <div className="summary-username">{stampInfo.username} has collected</div>
                    <div className="summary-count">a total of <span>{stampInfo.stamp_count}</span> stamps!</div>
                </div>

                <div className="stamp-book-container">
                    <button 
                        className="arrow-button prev-button" 
                        onClick={handlePrevPage}
                        disabled={currentPage === 0}
                    >
                        ‹
                    </button>

                    <div className="stamp-book">
                        {/* --- [수정] 드래그 이벤트 핸들러와 ref, style 적용 --- */}
                        <div 
                            className="stamp-pages"
                            ref={pagesRef}
                            style={{ transform: `translateX(calc(-${currentPage * 100}% + ${dragOffset}px))` }}
                            onMouseDown={handleDragStart}
                            onMouseMove={handleDragMove}
                            onMouseUp={handleDragEnd}
                            onMouseLeave={handleDragEnd}
                            onTouchStart={handleDragStart}
                            onTouchMove={handleDragMove}
                            onTouchEnd={handleDragEnd}
                        >
                            {loading ? (
                                <div className="stamp-page"><p>Loading stamps...</p></div>
                            ) : (
                                Array.from({ length: totalPages || 1 }).map((_, pageIndex) => (
                                    <div key={pageIndex} className="stamp-page">
                                        <div className="stamp-grid">
                                            {Array.from({ length: STAMPS_PER_PAGE }).map((_, stampIndex) => {
                                                const overallIndex = pageIndex * STAMPS_PER_PAGE + stampIndex;
                                                return (
                                                    <div key={overallIndex} className="stamp-item">
                                                        {overallIndex < stampInfo.stamp_count && (
                                                            <img src="/assets/goodjob.png" alt="Stamp" />
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <button 
                        className="arrow-button next-button" 
                        onClick={handleNextPage}
                        disabled={currentPage >= totalPages - 1}
                    >
                        ›
                    </button>
                </div>

                {totalPages > 1 && (
                    <div className="page-controls">
                        {Array.from({ length: totalPages }).map((_, index) => (
                            <div 
                                key={index}
                                className={`page-dot ${currentPage === index ? 'active' : ''}`}
                            ></div>
                        ))}
                    </div>
                )}

                {!loading && stampInfo.stamp_count === 0 && (
                    <div className="no-stamps-message">
                        <p>You haven't collected any stamps yet.</p>
                        <span>Start playing to collect your first stamp!</span>
                    </div>
                )}
            </main>

            <footer className="bottom-navigation">
                {navItems.map((item) => (
                    <button 
                        key={item.id} 
                        className={`nav-item ${item.id === 'stamp' ? 'active' : ''}`}
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

export default StampScreen;