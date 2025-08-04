// src/features/auth/pages/LoginPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import LoginForm from '../components/LoginForm'; 
import '../../../styles/LoginPage.css'; 
// import zerodose_img from '../../assets/zerodose_logo.svg'; // 이 라인을 삭제합니다.


function LoginPage() {
  const navigate = useNavigate();

  const handleIconClick = () => {
    navigate('/entry');
  };

  const handleLoginSuccess = () => {
    console.log('로그인 성공! 홈페이지로 이동합니다.');
    navigate('/homechild');
  };

  return (
    <div className="login-container"> 
      <img
        src="/assets/zerodose_logo.svg" // 경로를 public 폴더 기준으로 수정
        alt="ZeroDose Logo"
        className="top-left-icon"
        onClick={handleIconClick}
      />
      <div className="login-box">
        <h1>ZeroDose Login</h1>
        <div className="cute-illustration">🦄</div>
        <p className="login-desc">우리 놀이터에 오신 걸 환영해요!</p>
        <LoginForm onLoginSuccess={handleLoginSuccess} />
      </div>
    </div>
  );
}

export default LoginPage;
