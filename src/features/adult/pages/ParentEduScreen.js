import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ParentEduScreen.css';

// 부모님용 하단 네비게이션 아이콘 정보
const navItems = [
    { id: 'homeadult', icon: '🏠', label: '홈' },
    { id: 'stats', icon: '📝', label: '행동 기록' }, // 22 -> behaviorLog
    { id: 'survey', icon: '📊', label: '설문' }, // stats -> survey, 성장 리포트 -> 설문
    { id: 'parentEdu', icon: '📚', label: '부모 교육' }, // parentEdu로 유지
  ];

// P-ESDM 교육 영상 데이터 (요청하신 영상으로 교체)
const eduVideos = [
    { id: 1, title: 'What is ESDM', videoId: 'xkRwDOFbcAo' },
    { id: 2, title: 'ESDM: 부모가 알아야 할 핵심 원칙', videoId: 'XXQBIN9mCzE' },
    { id: 3, title: '공동 주시(Joint Attention) 훈련 방법', videoId: 'i4saReasm_g' },
    { id: 4, title: '언어 발달을 돕는 일상 속 대화 기술', videoId: '6GY3pLK6MrI' },
];

const eduBlogs = [
    { id: 1, title: '우리 아이, 눈맞춤이 어려워요', source: '네이버 블로그', link: '#' },
    { id: 2, title: 'ASD 아동의 상징 놀이 발달 단계', source: '전문가 칼럼', link: '#' },
    { id: 3, title: '분리불안, 어떻게 대처해야 할까요?', source: '육아 매거진', link: '#' },
];


function ParentEduScreen() {
  const navigate = useNavigate();

  const handleNavClick = (path) => {
    if (path === 'parentEdu') return;
    navigate(`/${path}`);
  };

  return (
    <div className="adult-page-layout">
      <header className="adult-page-header">
        <h1 className="header-logo">𝒁𝒆𝒓𝒐𝑫𝒐𝒔𝒆</h1>
      </header>

      <main className="adult-page-content">
        <h2 className="content-title">부모 교육</h2>

        {/* P-ESDM 교육 영상 섹션 */}
        <section className="edu-section">
          <h3 className="section-title">P-ESDM 교육 영상</h3>
          <div className="video-grid">
            {eduVideos.map(video => (
              <div key={video.id} className="video-card">
                <div className="video-embed-wrapper">
                    <iframe
                        src={`https://www.youtube.com/embed/${video.videoId}`}
                        title={video.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
                <p className="video-title">{video.title}</p>
              </div>
            ))}
          </div>
        </section>
        
        {/* 관련 블로그/칼럼 섹션 */}
        <section className="edu-section">
          <h3 className="section-title">읽어보면 좋은 글</h3>
          <div className="blog-list">
            {eduBlogs.map(blog => (
              <a key={blog.id} href={blog.link} target="_blank" rel="noopener noreferrer" className="blog-card">
                <div className="blog-info">
                    <p className="blog-title">{blog.title}</p>
                    <span className="blog-source">{blog.source}</span>
                </div>
                <span className="arrow-icon">›</span>
              </a>
            ))}
          </div>
        </section>

      </main>

      <footer className="bottom-navigation">
        {navItems.map((item) => (
            <button 
                key={item.id} 
                className={`nav-item ${item.id === 'parentEdu' ? 'active' : ''}`}
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

export default ParentEduScreen;