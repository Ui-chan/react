import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ShopPage.css';

// 하단 네비게이션 아이콘 정보
const navItems = [
    { id: 'homechild', icon: '🏠', label: '홈' },
    { id: 'play', icon: '🎮', label: '놀이' },
    { id: 'stamp', icon: '🌟', label: '스탬프' },
    { id: 'shop', icon: '🛒', label: '상점' },
];

function ShopPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  // 사용자 정보와 아이템 정보를 불러오는 통합 함수
  const fetchData = async () => {
    try {
      const userId = 2;
      const [itemsResponse, userResponse] = await Promise.all([
        fetch('/api/item/all'),
        fetch('/api/users/detail/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: userId }),
        })
      ]);

      if (!itemsResponse.ok) throw new Error('아이템 목록을 불러오는 데 실패했습니다.');
      if (!userResponse.ok) throw new Error('사용자 정보를 불러오는 데 실패했습니다.');

      const itemsData = await itemsResponse.json();
      const userData = await userResponse.json();
      
      setItems(itemsData);
      setUserInfo(userData);

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
    if (path === 'shop') return;
    navigate(`/${path}`);
  };

  const handleItemClick = (item) => {
    setSelectedItem(item);
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
  };

  const handlePurchase = async () => {
    if (!selectedItem || !userInfo) return;
    
    if ((userInfo.point || 0) < selectedItem.price) {
      alert("포인트가 부족합니다!");
      return;
    }

    try {
      const response = await fetch('/api/item/buy/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: userInfo.user_id, 
          item_id: selectedItem.item_id 
        }),
      });

      const resData = await response.json();
      if (!response.ok) {
        const errorMessage = Object.values(resData).join('\n');
        throw new Error(errorMessage);
      }

      alert(`${selectedItem.item_name} 아이템을 구매했습니다!`);
      setLoading(true);
      await fetchData(); // 유저 정보와 아이템 상태를 새로고침
      handleCloseModal();

    } catch (err) {
      console.error("Purchase error:", err);
      alert(err.message);
    }
  };

  const characterItems = items.filter(item => item.item_type === 1);
  const backgroundItems = items.filter(item => item.item_type === 2);

  const renderItemDetailModal = () => {
    if (!selectedItem) return null;

    const isOwned = (selectedItem.item_type === 1 
      ? userInfo?.store_character?.includes(selectedItem.item_name)
      : userInfo?.store_background?.includes(selectedItem.item_name));

    return (
      <div className="shop-modal-overlay" onClick={handleCloseModal}>
        <div className="shop-modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-image-container">
            <img src={selectedItem.item_img} alt={selectedItem.item_name} className="modal-image" />
          </div>
          <h2 className="modal-item-name">{selectedItem.item_name}</h2>
          <div className="modal-actions">
            <button onClick={handleCloseModal} className="modal-button close-button">뒤로가기</button>
            <button 
              onClick={handlePurchase} 
              className="modal-button purchase-button"
              disabled={isOwned}
            >
              {isOwned ? '보유중' : (
                <>
                  <span role="img" aria-label="point icon">🌟</span> {selectedItem.price} P로 구매하기
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="stamp-screen-layout"> 
      <header className="stamp-screen-header">
        <h1 className="header-logo">𝒁𝒆𝒓𝒐𝑫𝒐𝒔𝒆</h1>
      </header>

      <main className="stamp-screen-content">
        <h2 className="content-title">상점</h2>
        
        {userInfo && (
          <div className="stamp-summary-box">
            <div className="summary-username">{userInfo.username} 어린이는</div>
            <div className="summary-count">총 <span>{(userInfo.point || 0).toLocaleString()}</span> P를 가지고 있어요!</div>
          </div>
        )}

        {loading ? (
            <p className="status-text">아이템을 불러오는 중...</p>
        ) : error ? (
            <p className="status-text error">{error}</p>
        ) : (
            <div className="item-sections-container">
                <section className="item-section">
                    <h3 className="section-title">캐릭터</h3>
                    <div className="item-grid">
                        {characterItems.map(item => {
                          const isOwned = userInfo?.store_character?.includes(item.item_name);
                          return (
                            <div key={item.item_id} className={`item-card ${isOwned ? 'owned' : ''}`} onClick={() => handleItemClick(item)}>
                                <div className="item-image-container">
                                    <img src={item.item_img} alt={item.item_name} />
                                </div>
                                <span className="item-name">{item.item_name}</span>
                                <div className="buy-button">
                                  {isOwned ? '보유중' : (
                                    <>
                                      <span role="img" aria-label="point icon">🌟</span> {item.price}
                                    </>
                                  )}
                                </div>
                            </div>
                          );
                        })}
                    </div>
                </section>

                <section className="item-section">
                    <h3 className="section-title">배경</h3>
                    <div className="item-grid">
                        {backgroundItems.map(item => {
                           const isOwned = userInfo?.store_background?.includes(item.item_name);
                           return(
                            <div key={item.item_id} className={`item-card ${isOwned ? 'owned' : ''}`} onClick={() => handleItemClick(item)}>
                                <div className="item-image-container">
                                    <img src={item.item_img} alt={item.item_name} />
                                </div>
                                <span className="item-name">{item.item_name}</span>
                                <div className="buy-button">
                                  {isOwned ? '보유중' : (
                                    <>
                                      <span role="img" aria-label="point icon">🌟</span> {item.price}
                                    </>
                                  )}
                                </div>
                            </div>
                           );
                        })}
                    </div>
                </section>
            </div>
        )}
      </main>
      
      <footer className="bottom-navigation">
        {navItems.map((item) => (
            <button 
                key={item.id} 
                className={`nav-item ${item.id === 'shop' ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
            >
                <div className="nav-icon">{item.icon}</div>
                <span className="nav-label">{item.label}</span>
            </button>
        ))}
      </footer>
      
      {renderItemDetailModal()}
    </div>
  );
}

export default ShopPage;