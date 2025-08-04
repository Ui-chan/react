import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SignupPage.css';

function SignupPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [age, setAge] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/users/signup/', { // 회원가입 API 경로
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, age: parseInt(age) }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Django validation 에러 메시지를 표시
        const errorMessages = Object.values(data).flat().join('\n');
        throw new Error(errorMessages || '회원가입에 실패했습니다.');
      }
      
      alert('회원가입 성공! 로그인 페이지로 이동합니다.');
      navigate('/login');

    } catch (err) {
      setError(err.message);
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page-container">
      <div className="signup-form-wrapper">
        <img
          src="/assets/zerodose_logo.svg"
          alt="ZeroDose Logo"
          className="signup-logo"
        />
        <h1 className="signup-title">회원가입</h1>
        <p className="signup-subtitle">ZeroDose와 함께 아이의 성장을 응원해 주세요.</p>
        
        <form onSubmit={handleSignup} className="signup-form">
          <div className="input-group">
            <label htmlFor="username">사용자 이름</label>
            <input 
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="사용할 이름을 입력하세요"
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
          <div className="input-group">
            <label htmlFor="age">자녀 나이 (만)</label>
            <input
              id="age" 
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)} 
              placeholder="숫자만 입력하세요"
              required
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="signup-button" disabled={loading}>
            {loading ? '가입하는 중...' : '가입하기'}
          </button>
        </form>

        <div className="login-link-container">
          <span>이미 계정이 있으신가요?</span>
          <button onClick={() => navigate('/login')} className="login-link-button">
            로그인
          </button>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;