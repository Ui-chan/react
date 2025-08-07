import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HomeAdult.css';

// Navigation items for the parent's view
const navItems = [
    { id: 'homeadult', icon: '🏠', label: 'Home' },
    { id: 'stats', icon: '📊', label: 'Behavior Log' },
    { id: 'survey', icon: '📝', label: 'Survey' },
    { id: 'parentEdu', icon: '📚', label: 'Parent Ed.' },
];

function HomeAdult() {
    const navigate = useNavigate();
    const [userInfo, setUserInfo] = useState(null);
    const [stats, setStats] = useState(null);
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // In a real application, API call logic would go here.
        const fetchData = async () => {
            setLoading(true);
            try {
                // Example data translated to English
                const exampleUserInfo = { username: 'Hajun Kim', point: 1250, child_name: 'Hajun', base_character_img: ["/assets/character_idle.png"] };
                const exampleStats = { total_play_time_minutes: 128, completed_sessions: 15, joint_attention_rate: 76 };
                const exampleAiAnalysis = {
                    summary: "Over the past week, Joint Attention skills have improved by 15%, with high concentration shown particularly in the 'Look Over There!' game.",
                    positive_feedback: "It's very encouraging to see a steady increase in positive interactions. The frequency of responding to praise with a smile has notably increased.",
                    recommendation: "We recommend increasing emotion imitation activities through the 'Make a Face' game. About 5 minutes a day is appropriate."
                };
                setUserInfo(exampleUserInfo);
                setStats(exampleStats);
                setAiAnalysis(exampleAiAnalysis);
            } catch (err) {
                console.error("Failed to fetch data:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleNavClick = (path) => {
        // Do nothing if the current page's button is clicked
        if (path === 'homeadult') return;
        navigate(`/${path}`);
    };
    
    // Loading screen
    if (loading) {
        return <div className="home-adult__status-text">Loading dashboard...</div>;
    }
    
    return (
        <div className="home-adult__layout">
            {/* [수정] 헤더에 버튼 추가 */}
            <header className="home-adult__header">
                <h1 className="home-adult__header-logo">𝒁𝒆𝒓𝒐𝑫𝒐𝒔𝒆</h1>
                <button className="home-adult__view-change-btn" onClick={() => navigate('/homechild')}>
                    Child's View
                </button>
            </header>

            <main className="home-adult__content">
                {/* "Today's Start" Card */}
                <section className="home-adult__greeting-card">
                    <h4>Today's Start 🌱</h4>
                    <p>Shall we start another day of fun interaction with {userInfo?.child_name}?</p>
                </section>

                {/* AI Analysis Box */}
                {aiAnalysis && (
                    <section className="home-adult__ai-analysis-box">
                        <h3 className="home-adult__ai-section-title">💡 AI Weekly Analysis Report</h3>
                        <div className="home-adult__ai-section">
                            <h5>Overall Summary</h5>
                            <p>{aiAnalysis.summary}</p>
                        </div>
                        <div className="home-adult__ai-section">
                            <h5>Positive Changes</h5>
                            <p>{aiAnalysis.positive_feedback}</p>
                        </div>
                        <div className="home-adult__ai-section">
                            <h5>Recommended Activities</h5>
                            <p>{aiAnalysis.recommendation}</p>
                        </div>
                    </section>
                )}
                
                {/* Dashboard Grid */}
                <div className="home-adult__dashboard-grid">
                    <button className="home-adult__dashboard-card clickable" onClick={() => navigate('/stats')}>
                        <h3>📊 Training Stats</h3>
                        <p>Check your child's growth process with detailed data.</p>
                        <div className="home-adult__stat-summary">
                            <div className="home-adult__stat-item">
                                <span>Total Training Time</span>
                                <strong>{stats?.total_play_time_minutes} min</strong>
                            </div>
                            <div className="home-adult__stat-item">
                                <span>Joint Attention Success Rate</span>
                                <strong>{stats?.joint_attention_rate}%</strong>
                            </div>
                        </div>
                        <span className="home-adult__card-link">View Details &gt;</span>
                    </button>

                    <div className="home-adult__dashboard-card profile-card">
                        <h3>⭐️ {userInfo?.child_name}'s Profile</h3>
                        <div className="home-adult__profile-content">
                            <img src={userInfo?.base_character_img[0]} alt={`${userInfo?.child_name}'s Character`}/>
                            <div className="home-adult__profile-info">
                                <span>Points Earned</span>
                                <strong>{userInfo?.point.toLocaleString()} P</strong>
                            </div>
                        </div>
                    </div>
                    
                    <button className="home-adult__dashboard-card clickable" onClick={() => navigate('/survey')}>
                        <h3>📝 Developmental Survey</h3>
                        <p>Check and manage your child's developmental stage with regular surveys.</p>
                        <span className="home-adult__card-link">Start Survey &gt;</span>
                    </button>

                    <button className="home-adult__dashboard-card clickable" onClick={() => navigate('/parentEdu')}>
                        <h3>📚 Parent Education</h3>
                        <p>Find useful tips and educational videos to increase interaction with your child.</p>
                        <span className="home-adult__card-link">Learn More &gt;</span>
                    </button>
                </div>
            </main>

            <footer className="home-adult__bottom-navigation">
                {navItems.map((item) => (
                    <button 
                        key={item.id} 
                        className={`home-adult__nav-item ${item.id === 'homeadult' ? 'active' : ''}`}
                        onClick={() => handleNavClick(item.id)}>
                        <div className="home-adult__nav-icon">{item.icon}</div>
                        {item.label}
                    </button>
                ))}
            </footer>
        </div>
    );
}

export default HomeAdult;
