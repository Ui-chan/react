import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HomeChild.css';

// 하단 네비게이션 아이콘 정보
const navItems = [
    { id: 'homechild', icon: '🏠', label: '홈' },
    { id: 'play', icon: '🎮', label: '놀이' },
    { id: 'stamp', icon: '🌟', label: '스탬프' },
    { id: 'shop', icon: '🛒', label: '상점' },
];

function HomeChild() {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState(null);
    const [allItems, setAllItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    // 각 캐릭터의 위치를 객체로 관리 (값은 숫자)
    const [charPositions, setCharPositions] = useState({});
    
    // 드래그 중인 캐릭터의 인덱스와 정보를 ref에 저장
    const dragInfo = useRef({ isDragging: false, charIndex: null, startX: 0, startY: 0, startLeft: 0, startTop: 0 });
    const playroomRef = useRef(null);

    // 데이터 불러오기 함수
    const fetchData = async () => {
        // setLoading(true); // 재호출 시 깜빡임 방지
        try {
            const userId = 2;
            const [userResponse, itemsResponse] = await Promise.all([
                fetch('/api/users/detail/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: userId }),
                }),
                fetch('/api/item/all')
            ]);
            if (!userResponse.ok || !itemsResponse.ok) throw new Error('데이터를 불러오지 못했습니다.');
            const userData = await userResponse.json();
            const itemsData = await itemsResponse.json();
            setUserInfo(userData);
            setAllItems(itemsData);

            // 불러온 캐릭터 수에 맞게 초기 위치 설정
            // TODO: 추후 DB에서 각 캐릭터의 저장된 위치를 불러와야 합니다.
            if (Array.isArray(userData.base_character_img)) {
                // 기존 위치 정보가 없거나 캐릭터 수가 변경된 경우에만 초기 위치 설정
                const currentPositions = charPositions;
                let positionsChanged = Object.keys(currentPositions).length !== userData.base_character_img.length;

                if (positionsChanged) {
                    const initialPositions = {};
                    userData.base_character_img.forEach((_, index) => {
                        initialPositions[index] = { x: 50 + index * 50, y: 50 + index * 50 };
                    });
                    setCharPositions(initialPositions);
                }
            }

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleNavClick = (path) => {
        if (path === 'homechild') return;
        navigate(`/${path}`);
    };

    // 아이템 적용(Equip) API 호출
    const handleItemSelect = async (item) => {
        const payload = { user_id: userInfo.user_id };
        if (item.item_type === 1) {
            const currentChars = Array.isArray(userInfo.base_character_name) ? userInfo.base_character_name : [];
            const newSelectedChars = currentChars.includes(item.item_name)
                ? currentChars.filter(name => name !== item.item_name)
                : [...currentChars, item.item_name];
            payload.character_names = newSelectedChars;
        }
        if (item.item_type === 2) {
            payload.background_name = item.item_name;
        }
        try {
            const response = await fetch('/api/users/update-equipped/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!response.ok) throw new Error('아이템 변경에 실패했습니다.');
            await fetchData();
        } catch (err) {
            alert(err.message);
        }
    };

    // 드래그 로직
    const getCoords = (e) => ({ x: e.touches ? e.touches[0].clientX : e.clientX, y: e.touches ? e.touches[0].clientY : e.clientY });

    const handleDragStart = (e, index) => {
        e.preventDefault();
        const initialPosition = charPositions[index] || {x: e.currentTarget.offsetLeft, y: e.currentTarget.offsetTop};
        dragInfo.current = {
            isDragging: true,
            charIndex: index,
            startX: getCoords(e).x,
            startY: getCoords(e).y,
            startLeft: initialPosition.x,
            startTop: initialPosition.y,
        };
        window.addEventListener('mousemove', handleDragMove);
        window.addEventListener('touchmove', handleDragMove);
        window.addEventListener('mouseup', handleDragEnd);
        window.addEventListener('touchend', handleDragEnd);
    };

    const handleDragMove = (e) => {
        if (!dragInfo.current.isDragging || !playroomRef.current) return;
        
        const deltaX = getCoords(e).x - dragInfo.current.startX;
        const deltaY = getCoords(e).y - dragInfo.current.startY;
        
        const newLeft = dragInfo.current.startLeft + deltaX;
        const newTop = dragInfo.current.startTop + deltaY;

        const parentRect = playroomRef.current.getBoundingClientRect();
        const charWidth = 120;
        const charHeight = 120;
        const padding = 5;

        const clampedX = Math.max(padding, Math.min(newLeft, parentRect.width - charWidth - padding));
        const clampedY = Math.max(padding, Math.min(newTop, parentRect.height - charHeight - padding));
        
        setCharPositions(prev => ({
            ...prev,
            [dragInfo.current.charIndex]: { x: clampedX, y: clampedY }
        }));
    };

    const handleDragEnd = () => {
        dragInfo.current.isDragging = false;
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('touchmove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
        window.removeEventListener('touchend', handleDragEnd);
        // TODO: 변경된 charPositions 객체를 DB에 저장하는 API 호출
    };

    if (loading) return <div className="status-text">로딩 중...</div>;
    if (error) return <div className="status-text error">{error}</div>;
    if (!userInfo) return <div className="status-text">사용자 정보를 찾을 수 없습니다.</div>;

    const ownedCharacters = allItems.filter(item => item.item_type === 1 && userInfo.store_character?.includes(item.item_name));
    const ownedBackgrounds = allItems.filter(item => item.item_type === 2 && userInfo.store_background?.includes(item.item_name));
    
    return (
        <div className="home-child-layout">
            <header className="home-child-header">
                <h1 className="header-logo">𝒁𝒆𝒓𝒐𝑫𝒐𝒔𝒆</h1>
            </header>

            <main className="home-child-content">
                <div 
                    ref={playroomRef}
                    className="playroom" 
                    style={{ backgroundImage: `url(${userInfo.base_background_img})` }}
                >
                    {Array.isArray(userInfo.base_character_img) && userInfo.base_character_img.map((imgSrc, index) => (
                        <div 
                            key={index}
                            className="draggable-character"
                            style={{ 
                                left: `${charPositions[index]?.x}px` || '50%', 
                                top: `${charPositions[index]?.y}px` || '50%',
                                backgroundImage: `url(${imgSrc})`
                            }}
                            onMouseDown={(e) => handleDragStart(e, index)}
                            onTouchStart={(e) => handleDragStart(e, index)}
                        ></div>
                    ))}
                </div>
                
                <button className="custom-button" onClick={() => setIsPanelOpen(true)}>
                    <span role="img" aria-label="decorate">🎨</span> 꾸미기
                </button>
            </main>
            
            <footer className="bottom-navigation">
                {navItems.map((item) => (
                    <button 
                        key={item.id} 
                        className={`nav-item ${item.id === 'homechild' ? 'active' : ''}`}
                        onClick={() => handleNavClick(item.id)}
                    >
                        <div className="nav-icon">{item.icon}</div>
                        <span className="nav-label">{item.label}</span>
                    </button>
                ))}
            </footer>

            {isPanelOpen && (
                <div className="custom-panel-overlay" onClick={() => setIsPanelOpen(false)}>
                    <div className="custom-panel" onClick={(e) => e.stopPropagation()}>
                        <div className="panel-header">
                            <h2>놀이방 꾸미기</h2>
                            <button onClick={() => setIsPanelOpen(false)} className="close-panel-button">×</button>
                        </div>
                        <div className="panel-content">
                            <section className="panel-item-section">
                                <h3>캐릭터 선택 (여러 개 선택 가능)</h3>
                                <div className="panel-item-grid">
                                    {ownedCharacters.map(item => (
                                        <div 
                                            key={item.item_id} 
                                            className={`panel-item-card ${userInfo.base_character_name?.includes(item.item_name) ? 'selected' : ''}`}
                                            onClick={() => handleItemSelect(item)}
                                        >
                                            <img src={item.item_img} alt={item.item_name} />
                                            <span>{item.item_name}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                            <section className="panel-item-section">
                                <h3>배경 선택</h3>
                                <div className="panel-item-grid">
                                    {ownedBackgrounds.map(item => (
                                        <div 
                                            key={item.item_id} 
                                            className={`panel-item-card ${userInfo.base_background_name === item.item_name ? 'selected' : ''}`}
                                            onClick={() => handleItemSelect(item)}
                                        >
                                            <img src={item.item_img} alt={item.item_name} />
                                            <span>{item.item_name}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default HomeChild;