import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ParentEduScreen.css';

// Navigation items for parents
const navItems = [
    { id: 'homeadult', icon: '🏠', label: 'Home' },
    { id: 'stats', icon: '📝', label: 'Behavior Log' },
    { id: 'survey', icon: '📊', label: 'Survey' },
    { id: 'parentEdu', icon: '📚', label: 'Parent Ed.' },
];

// P-ESDM educational video data
const eduVideos = [
    { id: 1, title: 'What is ESDM', videoId: 'xkRwDOFbcAo' },
    { id: 2, title: 'ESDM: Core Principles for Parents', videoId: 'XXQBIN9mCzE' },
    { id: 3, title: 'How to Train Joint Attention', videoId: 'i4saReasm_g' },
    { id: 4, title: 'Everyday Conversation Skills for Language Development', videoId: '6GY3pLK6MrI' },
];

// Related blog/column data
const eduBlogs = [
    { id: 1, title: 'My Child Has Trouble with Eye Contact', source: 'Naver Blog', link: '#' },
    { id: 2, title: 'Symbolic Play Development Stages in Children with ASD', source: 'Expert Column', link: '#' },
    { id: 3, title: 'Separation Anxiety: How to Cope', source: 'Parenting Magazine', link: '#' },
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
        <h2 className="content-title">Parent Education</h2>

        {/* P-ESDM Educational Videos Section */}
        <section className="edu-section">
          <h3 className="section-title">P-ESDM Training Videos</h3>
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
        
        {/* Related Blogs/Columns Section */}
        <section className="edu-section">
          <h3 className="section-title">Recommended Reading</h3>
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