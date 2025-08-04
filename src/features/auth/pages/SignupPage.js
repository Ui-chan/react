// src/features/auth/pages/SignupPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import SignupForm from '../components/SignupForm';
import '../../../styles/LoginPage.css'; 
// import zerodose_img from '../../assets/zerodose_logo.svg'; // 이 라인을 삭제합니다.

function SignupPage() {
  const navigate = useNavigate();

  const handleIconClick = () => {
    navigate('/entry');
  };

  const handleSignupSuccess = () => {
    console.log('회원가입 성공! 로그인 페이지로 이동합니다.');
    navigate('/login');
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
        <h1>ZeroDose 회원가입</h1>
        <SignupForm onSignupSuccess={handleSignupSuccess} />
      </div>
    </div>
  );
}

export default SignupPage;
