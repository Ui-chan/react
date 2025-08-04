import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

// Corrected Paths
import LoginPage from '../features/auth/pages/LoginPage';
import SignupPage from '../features/auth/pages/SignupPage';
import HomePage from './HomePage';
import App from './App';

import Survey from '../features/adult/pages/Survey';
import ParentEduScreen from '../features/adult/pages/ParentEduScreen';

// --- 1. PlayScreen import 경로를 child 폴더로 변경 ---
import PlayScreen from '../features/child/pages/PlayScreen'; 
import StampScreen from '../features/child/pages/StampScreen'; 
import ShopPage from '../features/child/pages/ShopPage'; 
import HomeChild from '../features/child/pages/HomeChild'; 

import HomeAdult from '../features/adult/pages/HomeAdult'; 
import StatsScreen from '../features/adult/pages/StatsScreen';


import BottomNavigation from '../components/BottomNavigation';
import FirstGamePage from '../features/firstgame/pages/FirstGamePage';
import SecondGamePage from '../features/secondgame/pages/SecondGamePage';
import ThirdGamePage from '../features/thirdgame/pages/ThirdGamePage';
import FourthGamePage from '../features/fourthgame/pages/FourthGamePage';

function AppRouter() {
  return (
    <Router>
      <MainRoutes />
    </Router>
  );
}

function MainRoutes() {
  const navigate = useNavigate();

  const handleNavClick = (screen) => {
    navigate(`/${screen}`);
  };

  const withBottomNav = (Component, screenName) => (
    <>
      <Component onNavClick={handleNavClick} currentScreen={screenName} />
      <BottomNavigation onNavClick={handleNavClick} currentScreen={screenName} />
    </>
  );

  return (
    <Routes>
      {/* 루트 접속 시 /login으로 리다이렉트 */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* 로그인 */}
      <Route path="/login" element={<LoginPage />} />

      {/* 회원가입 */}
      <Route path="/signup" element={<SignupPage />} />

      {/* 홈 (하단바 포함) */}
      <Route
        path="/homepage"
        element={withBottomNav(HomePage, 'home')}
      />


      {/* 게임 페이지들 (하단바 없음) */}
      <Route path="/firstgame" element={<FirstGamePage />} />
      <Route path="/secondgame" element={<SecondGamePage />} />
      <Route path="/thirdgame" element={<ThirdGamePage />} />
      <Route path="/fourthgame" element={<FourthGamePage />} />

      {/* 부모 교육 (하단바 포함) */}
      <Route path="/survey" element={<Survey />} />

      <Route path="/parentedu" element={<ParentEduScreen />} />

      {/* 플레이 화면 */}
      <Route path="/play" element={<PlayScreen />} />

      <Route path="/stamp" element={<StampScreen />} />

      <Route path="/shop" element={<ShopPage />} />

      <Route path="/homechild" element={<HomeChild />} />

      <Route path="/homeadult" element={<HomeAdult />} />
      
      <Route path="/stats" element={<StatsScreen />} />
      
      
    </Routes>
  );
}

export default AppRouter;
