import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/ParentEduScreen.css';

// Navigation items for parents
const navItems = [
    { id: 'homeadult', icon: '🏠', label: 'Home' },
    { id: 'stats', icon: '📊', label: 'Behavior Log' },
    { id: 'survey', icon: '📝', label: 'Survey' },
    { id: 'parentEdu', icon: '📚', label: 'Parent Ed.' },
  ];

// P-ESDM educational video data
const eduVideos = [
    { id: 1, title: 'Autism and the Early Start Denver Model (ESDM)', videoId: '_AUF8U1xMt8' },
    { id: 2, title: 'What you should know about raising an autistic child', videoId: 'LawBw9gbv_w' },
    { id: 3, title: 'How Every Child Can Thrive by Five | Molly Wright | TED', videoId: 'aISXCw0Pi94' },
    { id: 4, title: 'Using the Early Start Denver Model (ESDM) - Getting The Hook - Soar Autism Center', videoId: 'wMziSiFdmf0' },
];

// Related blog/column data
const eduBlogs = [
    { id: 1, title: 'No, you are not anxious, depressed, ASD, or ADHD. You are addicted.', source: 'medium.com', link: 'https://medium.com/@thewanderingengineer/no-you-are-not-anxious-depressed-asd-or-adhd-you-are-addicted-c66648352679' },
    { id: 2, title: 'Preparing for a Second Pregnancy: Reducing the Risk of Autism Spectrum Disorder (ASD)', source: 'dr-tomato.com', link: 'https://dr-tomato.com/blog/autism-spectrum-disorder/' },
    { id: 3, title: 'The DSM ASD “Levels”', source: 'medium.com', link: 'https://medium.com/@attleehall/the-dsm-asd-levels-81124c94687a' },
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