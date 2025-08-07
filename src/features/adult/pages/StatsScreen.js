import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar, Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import '../styles/StatsScreen.css';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, ArcElement
);

const navItems = [
  { id: 'homeadult', icon: '🏠', label: 'Home' },
  { id: 'stats', icon: '📊', label: 'Behavior Log' },
  { id: 'survey', icon: '📝', label: 'Survey' },
  { id: 'parentEdu', icon: '📚', label: 'Parent Ed.' },
];

const formatNumber = (num, places = 1) => (typeof num !== 'number' ? 0 : Number(num.toFixed(places)));

function StatsScreen() {
    const navigate = useNavigate();
    const [statsData, setStatsData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedGame, setSelectedGame] = useState('game1');
    const [visibleChart, setVisibleChart] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const userId = 2; // Example user ID
                const response = await fetch('/api/data/user-stats/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: userId }),
                });
                if (!response.ok) throw new Error('Failed to load statistics.');
                const data = await response.json();
                setStatsData(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const handleNavClick = (path) => {
        if (path === 'stats') return;
        navigate(`/${path}`);
    };

    const handleGameSelect = (game) => {
        setSelectedGame(game);
        setVisibleChart(null);
    };
    
    const handleMetricClick = (chartName) => {
        setVisibleChart(prev => (prev === chartName ? null : chartName));
    };

    const renderLineChart = (data, label, unit = '') => {
        if (!data || data.length === 0) return <p className="no-data-text">No data to display.</p>;
        const chartData = {
            labels: data.map(item => new Date(item.date).toLocaleDateString()),
            datasets: [{
                label: label,
                data: data.map(item => formatNumber(item.value)),
                borderColor: '#20c997',
                backgroundColor: 'rgba(32, 201, 151, 0.1)',
                fill: true,
                tension: 0.3,
            }],
        };
        const options = { scales: { y: { ticks: { callback: value => value + unit } } } };
        return <Line data={chartData} options={options} />;
    };

    const renderBarChart = (data, labelText) => {
        if (!data || Object.keys(data).length === 0 || Object.values(data).every(v => v === 0)) return <p className="no-data-text">No data to display.</p>;
        const chartData = {
            labels: Object.keys(data).map(l => l === 'NONE' ? 'No Help' : (l === 'VERBAL' ? 'Verbal' : 'Physical')),
            datasets: [{
                label: labelText,
                data: Object.values(data).map(item => formatNumber(item)),
                backgroundColor: ['#a7d7f9', '#f7a7a3', '#f3d49b'],
            }],
        };
        return <Bar data={chartData} />;
    };
    
    const renderPieChart = (data, labelText) => {
        const chartLabels = Object.keys(data).map(l => l === 'NONE' ? 'No Help' : (l === 'VERBAL' ? 'Verbal' : 'Physical'));
        const chartValues = Object.values(data);
        if (!chartValues || chartValues.every(d => d === 0)) return <p className="no-data-text">No data to display.</p>;
        const chartData = {
            labels: chartLabels,
            datasets: [{
                label: labelText,
                data: chartValues.map(v => formatNumber(v)),
                backgroundColor: ['#a7d7f9', '#f7a7a3', '#f3d49b'],
            }],
        };
        return <Pie data={chartData} />;
    };

    const renderAiAnalysis = (analysisData) => {
        if (!analysisData || !analysisData.notable_points) return null;
        return (
            <div className="ai-analysis-box">
                <h4 className="ai-section-title">💡 AI Analysis</h4>
                <div className="ai-section">
                    <h5>Key Observations</h5>
                    <p>{analysisData.notable_points}</p>
                </div>
            </div>
        );
    };
    
    const stats = statsData ? statsData.statistics : null;
    const game1Analysis = statsData ? statsData.game1_analysis : null;
    const game2Analysis = statsData ? statsData.game2_analysis : null;
    const game3Analysis = statsData ? statsData.game3_analysis : null;

    return (
        <div className="adult-page-layout">
            <header className="adult-page-header">
                <h1 className="header-logo">𝒁𝒆𝒓𝒐𝑫𝒐𝒔𝒆</h1>
            </header>

            <div className="game-select-tabs">
                <button className={`tab-button ${selectedGame === 'game1' ? 'active' : ''}`} onClick={() => handleGameSelect('game1')}>Look Over There!</button>
                <button className={`tab-button ${selectedGame === 'game2' ? 'active' : ''}`} onClick={() => handleGameSelect('game2')}>Copy the Face</button>
                <button className={`tab-button ${selectedGame === 'game3' ? 'active' : ''}`} onClick={() => handleGameSelect('game3')}>Ball Toss</button>
            </div>

            <main className="adult-page-content">
                <h2 className="content-title">Growth Report</h2>
                {loading ? ( <p className="status-text">Generating report...</p> ) : 
                 error ? ( <p className="status-text error">{error}</p> ) : 
                 stats ? (
                    <div className="stats-container">
                        {selectedGame === 'game1' && (
                             <section className="stats-card">
                                <h3>🔎 'Look Over There!' Game Report</h3>
                                {renderAiAnalysis(game1Analysis)}
                                <div className="summary-grid">
                                    <div className="summary-item"><span className="summary-label">Today's Attempts</span><span className="summary-value">{stats.game1.today_attempts}</span></div>
                                    <div className="summary-item"><span className="summary-label">Today's Success Rate</span><span className="summary-value">{formatNumber(stats.game1.today_success_rate)}%</span></div>
                                    <div className="summary-item"><span className="summary-label">Today's Playtime</span><span className="summary-value">{formatNumber(stats.game1.today_play_duration_seconds / 60)}min</span></div>
                                    <div className={`summary-item clickable ${visibleChart === 'g1_avg_response' ? 'active' : ''}`} onClick={() => handleMetricClick('g1_avg_response')}><span className="summary-label">Avg. Response Time ▾</span><span className="summary-value">{formatNumber(stats.game1.overall_avg_response_time / 1000)}s</span></div>
                                    <div className={`summary-item clickable ${visibleChart === 'g1_avg_success' ? 'active' : ''}`} onClick={() => handleMetricClick('g1_avg_success')}><span className="summary-label">Overall Success Rate ▾</span><span className="summary-value">{formatNumber(stats.game1.overall_avg_success_rate)}%</span></div>
                                    <div className={`summary-item clickable ${visibleChart === 'g1_assist_success' ? 'active' : ''}`} onClick={() => handleMetricClick('g1_assist_success')}><span className="summary-label">Success by Assistance ▾</span><span className="summary-value">View Graph</span></div>
                                </div>
                                <div className="chart-display-area">
                                    {visibleChart === 'g1_avg_response' && <div className="chart-container"><h4>Response Time by Date</h4>{renderLineChart(stats.game1?.daily_response_time_trend?.map(d => ({...d, value: d.value / 1000})), 'Response Time', 's')}</div>}
                                    {visibleChart === 'g1_avg_success' && <div className="chart-container"><h4>Success Rate by Date</h4>{renderLineChart(stats.game1?.daily_success_rate_trend, 'Success Rate', '%')}</div>}
                                    {visibleChart === 'g1_assist_success' && <div className="chart-container"><h4>Success Rate by Assistance</h4>{renderBarChart(stats.game1?.success_rate_by_assistance, 'Success Rate')}</div>}
                                </div>
                            </section>
                        )}
                        {selectedGame === 'game2' && (
                             <section className="stats-card">
                                <h3>😊 'Copy the Face' Game Report</h3>
                                {renderAiAnalysis(game2Analysis)}
                                <div className="summary-grid">
                                    <div className="summary-item"><span className="summary-label">Today's Sessions</span><span className="summary-value">{stats.game2.today_play_count}</span></div>
                                    <div className="summary-item"><span className="summary-label">Today's Playtime</span><span className="summary-value">{formatNumber(stats.game2.today_play_duration_seconds)}s</span></div>
                                    <div className="summary-item"><span className="summary-label">Today's Avg. Response</span><span className="summary-value">{formatNumber(stats.game2.today_avg_response_time / 1000)}s</span></div>
                                    
                                    {/* [수정] 이 항목은 클릭 불가능한 일반 정보입니다. */}
                                    <div className="summary-item">
                                        <span className="summary-label">Overall Avg. Response</span>
                                        <span className="summary-value">{formatNumber(stats.game2.overall_avg_response_time / 1000)}s</span>
                                    </div>
                                    
                                    {/* [수정] 이 항목을 클릭하면 그래프가 표시됩니다. */}
                                    <div className={`summary-item clickable ${visibleChart === 'g2_avg_playtime_trend' ? 'active' : ''}`} onClick={() => handleMetricClick('g2_avg_playtime_trend')}>
                                        <span className="summary-label">Avg. Daily Playtime ▾</span>
                                        <span className="summary-value">{formatNumber(stats.game2.avg_daily_play_time_seconds / 60)}min</span>
                                    </div>
                                    
                                    <div className={`summary-item clickable ${visibleChart === 'g2_assist_playtime' ? 'active' : ''}`} onClick={() => handleMetricClick('g2_assist_playtime')}><span className="summary-label">Playtime by Assistance ▾</span><span className="summary-value">View Graph</span></div>
                                </div>
                                <div className="chart-display-area">
                                    {/* [수정] "Avg. Daily Playtime" 클릭 시, "daily_response_time_trend" 데이터를 사용해 그래프를 그립니다. */}
                                    {visibleChart === 'g2_avg_playtime_trend' && 
                                        <div className="chart-container">
                                            <h4>Response Time Trend by Date</h4>
                                            {renderLineChart(stats.game2?.daily_response_time_trend?.map(d => ({...d, value: d.value / 1000})), 'Response Time', 's')}
                                        </div>
                                    }
                                    
                                    {visibleChart === 'g2_assist_playtime' && 
                                        <div className="chart-container pie-chart">
                                            <h4>Playtime by Assistance</h4>
                                            {renderPieChart(stats.game2?.play_time_by_assistance, 'Playtime (sec)')}
                                        </div>
                                    }
                                </div>
                            </section>
                        )}
                        {selectedGame === 'game3' && (
                            <section className="stats-card">
                                <h3>⚽ 'Ball Toss' Game Report</h3>
                                {renderAiAnalysis(game3Analysis)}
                                <div className="summary-grid">
                                    <div className="summary-item"><span className="summary-label">Today's Attempts</span><span className="summary-value">{stats.game3.today_attempts}</span></div>
                                    <div className="summary-item"><span className="summary-label">Today's Success Rate</span><span className="summary-value">{formatNumber(stats.game3.today_success_rate)}%</span></div>
                                    <div className="summary-item"><span className="summary-label">Today's Playtime</span><span className="summary-value">{formatNumber(stats.game3.today_play_duration_seconds / 60)}min</span></div>
                                    <div className={`summary-item clickable ${visibleChart === 'g3_avg_success' ? 'active' : ''}`} onClick={() => handleMetricClick('g3_avg_success')}><span className="summary-label">Overall Success Rate ▾</span><span className="summary-value">{formatNumber(stats.game3.overall_avg_success_rate)}%</span></div>
                                    <div className={`summary-item clickable ${visibleChart === 'g3_avg_power' ? 'active' : ''}`} onClick={() => handleMetricClick('g3_avg_power')}>
                                        <span className="summary-label">Overall Avg. Throw Power ▾</span><span className="summary-value">{formatNumber(Object.values(stats.game3?.avg_power_by_assistance || {}).reduce((a, b) => a + b, 0) / Object.values(stats.game3?.avg_power_by_assistance || {}).length || 0)}</span><span className="metric-note">Target: 60-70</span>
                                    </div>
                                    <div className={`summary-item clickable ${visibleChart === 'g3_assist_success' ? 'active' : ''}`} onClick={() => handleMetricClick('g3_assist_success')}><span className="summary-label">Success Rate by Assistance ▾</span><span className="summary-value">View Graph</span></div>
                                </div>
                                 <div className="chart-display-area">
                                    {visibleChart === 'g3_avg_success' && <div className="chart-container"><h4>Success Rate by Date</h4>{renderLineChart(stats.game3?.daily_success_rate_trend, 'Success Rate', '%')}</div>}
                                    {visibleChart === 'g3_avg_power' && <div className="chart-container"><h4>Avg. Throw Power by Date</h4>{renderLineChart(stats.game3?.daily_avg_power_trend, 'Average Power')}</div>}
                                    {visibleChart === 'g3_assist_success' && <div className="chart-container"><h4>Success Rate by Assistance</h4>{renderBarChart(stats.game3?.success_rate_by_assistance, 'Success Rate')}</div>}
                                </div>
                            </section>
                        )}
                    </div>
                 ) : ( <p className="status-text">No data to display.</p> )
                }
            </main>

            <footer className="bottom-navigation">
                {navItems.map((item) => (
                    <button key={item.id} className={`nav-item ${item.id === 'stats' ? 'active' : ''}`} onClick={() => handleNavClick(item.id)}>
                        <div className="nav-icon">{item.icon}</div>
                        <span className="nav-label">{item.label}</span>
                    </button>
                ))}
            </footer>
        </div>
    );
}

export default StatsScreen;