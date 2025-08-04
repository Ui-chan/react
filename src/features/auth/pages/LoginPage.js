import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/LoginPage.css';

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault(); // Form의 기본 제출 동작 방지
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/users/login/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '로그인에 실패했습니다.');
      }
      
      console.log('로그인 성공! 홈페이지로 이동합니다.', data.user);
      // TODO: 로그인 성공 시 받은 사용자 정보(data.user)를 앱 전체 상태에 저장해야 합니다.
      
      window.location.href = '/homechild';

    } catch (err) {
      setError(err.message);
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-form-wrapper">
        <img
          src="/assets/zerodose_logo.svg"
          alt="ZeroDose Logo"
          className="login-logo"
        />
        <h1 className="login-title">환영합니다!</h1>
        <p className="login-subtitle">아이와 함께 즐거운 놀이 시간을 시작해 보세요.</p>
        
        <form onSubmit={handleLogin} className="login-form">
          <div className="input-group">
            <label htmlFor="username">사용자 이름 또는 이메일</label>
            <input 
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="사용자 이름을 입력하세요"
              required
            />
          </div>
          <div className="input-group">
            <label htmlFor="password">비밀번호</label>
            <input
              id="password" 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="비밀번호를 입력하세요"
              required
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? '로그인 중...' : '로그인'}
          </button>
        </form>

        <div className="signup-link-container">
          <span>계정이 없으신가요?</span>
          <button onClick={() => navigate('/signup')} className="signup-link-button">
            회원가입
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;