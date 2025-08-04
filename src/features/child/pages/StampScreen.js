import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/StampScreen.css';

// 하단 네비게이션 아이콘 정보 (임시)
const navItems = [
    { id: 'homechild', icon: '🏠', label: '홈' },
    { id: 'play', icon: '🎮', label: '놀이' },
    { id: 'stamp', icon: '🌟', label: '스탬프' },
    { id: 'shop', icon: '🛒', label: '상점' },
];

const STAMPS_PER_PAGE = 20; // 한 페이지에 20개 (5x4)

function StampScreen() {
    const navigate = useNavigate();
    const [stampInfo, setStampInfo] = useState({ username: '사용자', stamp_count: 0 });
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);

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

    // --- 페이지 넘기기 버튼 핸들러 추가 ---
    const handlePrevPage = () => {
        setCurrentPage(prev => Math.max(prev - 1, 0));
    };

    const handleNextPage = () => {
        setCurrentPage(prev => Math.min(prev + 1, totalPages - 1));
    };

    return (
        <div className="stamp-screen-layout">
            <header className="stamp-screen-header">
                <h1 className="header-logo">𝒁𝒆𝒓𝒐𝑫𝒐𝒔𝒆</h1>
            </header>

            <main className="stamp-screen-content">
                <h2 className="content-title">스탬프 북</h2>
                
                <div className="stamp-summary-box">
                    <div className="summary-username">{stampInfo.username} 어린이는</div>
                    <div className="summary-count">총 <span>{stampInfo.stamp_count}</span>개의 스탬프를 모았어요!</div>
                </div>

                <div className="stamp-book-container">
                    {/* --- 왼쪽 화살표 버튼 추가 --- */}
                    <button 
                        className="arrow-button prev-button" 
                        onClick={handlePrevPage}
                        disabled={currentPage === 0}
                    >
                        ‹
                    </button>

                    <div className="stamp-book">
                        <div className="stamp-pages" style={{ transform: `translateX(-${currentPage * 100}%)` }}>
                            {loading ? (
                                <div className="stamp-page"><p>스탬프를 불러오는 중...</p></div>
                            ) : (
                                Array.from({ length: totalPages || 1 }).map((_, pageIndex) => (
                                    <div key={pageIndex} className="stamp-page">
                                        <div className="stamp-grid">
                                            {Array.from({ length: STAMPS_PER_PAGE }).map((_, stampIndex) => {
                                                const overallIndex = pageIndex * STAMPS_PER_PAGE + stampIndex;
                                                return (
                                                    <div key={overallIndex} className="stamp-item">
                                                        {overallIndex < stampInfo.stamp_count && (
                                                            <img src="/assets/goodjob.png" alt="스탬프" />
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

                    {/* --- 오른쪽 화살표 버튼 추가 --- */}
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
                        <p>아직 모은 스탬프가 없어요.</p>
                        <span>놀이를 시작해 첫 스탬프를 모아보세요!</span>
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