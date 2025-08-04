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

// 부모님용 하단 네비게이션 아이콘 정보
const navItems = [
  { id: 'homeadult', icon: '🏠', label: '홈' },
  { id: 'stats', icon: '📝', label: '행동 기록' }, // 22 -> behaviorLog
  { id: 'survey', icon: '📊', label: '설문' }, // stats -> survey, 성장 리포트 -> 설문
  { id: 'parentEdu', icon: '📚', label: '부모 교육' }, // parentEdu로 유지
];

const formatNumber = (num, places = 1) => (typeof num !== 'number' ? 0 : Number(num.toFixed(places)));

function StatsScreen() {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedGame, setSelectedGame] = useState('game1');

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const userId = 2;
                const response = await fetch('/api/data/user-stats/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ user_id: userId }),
                });
                if (!response.ok) {
                    throw new Error('통계 데이터를 불러오는 데 실패했습니다.');
                }
                const data = await response.json();
                setStats(data);
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
    };

    const renderLineChart = (data, label, unit = '') => {
        if (!data || data.length === 0) return <p className="no-data-text">표시할 데이터가 없습니다.</p>;
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
        const options = {
            scales: { y: { ticks: { callback: value => value + unit } } }
        };
        return <Line data={chartData} options={options} />;
    };

    const renderBarChart = (data, labelText) => {
        if (!data || Object.keys(data).length === 0) return <p className="no-data-text">표시할 데이터가 없습니다.</p>;
        const chartData = {
            labels: Object.keys(data).map(l => l === 'NONE' ? '도움 없음' : (l === 'VERBAL' ? '말로만' : '손으로')),
            datasets: [{
                label: labelText,
                data: Object.values(data).map(item => formatNumber(item)),
                backgroundColor: ['#a7d7f9', '#f7a7a3', '#f3d49b'],
            }],
        };
        return <Bar data={chartData} />;
    };
    
    const renderPieChart = (data, labelText) => {
        const chartLabels = Object.keys(data).map(l => l === 'NONE' ? '도움 없음' : (l === 'VERBAL' ? '말로만' : '손으로'));
        const chartValues = Object.values(data);
        if (chartValues.every(d => d === 0)) return <p className="no-data-text">표시할 데이터가 없습니다.</p>;
        const chartData = {
            labels: chartLabels,
            datasets: [{
                label: labelText,
                data: chartValues,
                backgroundColor: ['#a7d7f9', '#f7a7a3', '#f3d49b'],
            }],
        };
        return <Pie data={chartData} />;
    };
    
    return (
        <div className="adult-page-layout">
            <header className="adult-page-header">
                <h1 className="header-logo">ZeroDose</h1>
            </header>

            <div className="game-select-tabs">
                <button className={`tab-button ${selectedGame === 'game1' ? 'active' : ''}`} onClick={() => handleGameSelect('game1')}>저기 봐!</button>
                <button className={`tab-button ${selectedGame === 'game2' ? 'active' : ''}`} onClick={() => handleGameSelect('game2')}>표정 짓기</button>
                <button className={`tab-button ${selectedGame === 'game3' ? 'active' : ''}`} onClick={() => handleGameSelect('game3')}>공 주고받기</button>
            </div>

            <main className="adult-page-content">
                <h2 className="content-title">성장 리포트</h2>
                {loading ? ( <p className="status-text">리포트를 생성하는 중...</p> ) : 
                 error ? ( <p className="status-text error">{error}</p> ) : 
                 stats ? (
                    <div className="stats-container">
                        {selectedGame === 'game1' && (
                             <section className="info-card">
                                <h3>🔎 '저기 봐!' 놀이 리포트</h3>
                                <div className="summary-grid">
                                    <div className="summary-item">
                                        <span className="summary-label">오늘 시도 횟수</span>
                                        <span className="summary-value">{stats.game1.today_attempts}회</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-label">오늘 정답률</span>
                                        <span className="summary-value">{formatNumber(stats.game1.today_success_rate)}%</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-label">오늘 플레이 시간</span>
                                        <span className="summary-value">{formatNumber(stats.game1.today_play_duration_seconds / 60)}분</span>
                                    </div>
                                     <div className="summary-item">
                                        <span className="summary-label">전체 평균 반응 시간</span>
                                        <span className="summary-value">{formatNumber(stats.game1.overall_avg_response_time / 1000)}초</span>
                                    </div>
                                </div>
                                <div className="chart-container">
                                    <h4>날짜별 정답률 (%)</h4>
                                    {renderLineChart(stats.game1.daily_success_rate_trend, '정답률', '%')}
                                </div>
                                <div className="chart-container">
                                    <h4>날짜별 평균 반응 시간 (초)</h4>
                                    {renderLineChart(stats.game1.daily_response_time_trend.map(d => ({...d, value: d.value / 1000})), '반응 시간', '초')}
                                </div>
                                <div className="chart-container">
                                    <h4>도움 수준별 평균 정답률 (%)</h4>
                                    {renderBarChart(stats.game1.success_rate_by_assistance, '정답률')}
                                </div>
                            </section>
                        )}
                        {selectedGame === 'game2' && (
                             <section className="info-card">
                                <h3>😊 '표정 짓기' 놀이 리포트</h3>
                                <div className="summary-grid">
                                    <div className="summary-item">
                                        <span className="summary-label">오늘 진행 횟수</span>
                                        <span className="summary-value">{stats.game2.today_play_count}회</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-label">오늘 플레이 시간</span>
                                        <span className="summary-value">{formatNumber(stats.game2.today_play_duration_seconds)}초</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-label">하루 평균 플레이 시간</span>
                                        <span className="summary-value">{formatNumber(stats.game2.avg_daily_play_time_seconds / 60)}분</span>
                                    </div>
                                     <div className="summary-item">
                                        <span className="summary-label">전체 평균 반응 시간</span>
                                        <span className="summary-value">{formatNumber(stats.game2.overall_avg_response_time / 1000)}초</span>
                                    </div>
                                </div>
                                <div className="chart-container">
                                    <h4>날짜별 평균 반응 시간 (초)</h4>
                                    {renderLineChart(stats.game2.daily_response_time_trend.map(d => ({...d, value: d.value / 1000})), '반응 시간', '초')}
                                </div>
                                <div className="chart-container pie-chart">
                                    <h4>도움 수준별 플레이 시간 (초)</h4>
                                    {renderPieChart(stats.game2.play_time_by_assistance, '플레이 시간')}
                                </div>
                            </section>
                        )}
                        {selectedGame === 'game3' && (
                            <section className="info-card">
                                <h3>⚽ '공 주고받기' 놀이 리포트</h3>
                                <div className="summary-grid">
                                     <div className="summary-item">
                                        <span className="summary-label">오늘 시도 횟수</span>
                                        <span className="summary-value">{stats.game3.today_attempts}회</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-label">오늘 성공률</span>
                                        <span className="summary-value">{formatNumber(stats.game3.today_success_rate)}%</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-label">오늘 플레이 시간</span>
                                        <span className="summary-value">{formatNumber(stats.game3.today_play_duration_seconds / 60)}분</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-label">전체 평균 성공률</span>
                                        <span className="summary-value">{formatNumber(stats.game3.overall_avg_success_rate)}%</span>
                                    </div>
                                </div>
                                <div className="chart-container">
                                    <h4>날짜별 성공률 (%)</h4>
                                    {renderLineChart(stats.game3.daily_success_rate_trend, '성공률', '%')}
                                </div>
                                <div className="chart-container">
                                    <h4>날짜별 평균 던지기 파워</h4>
                                    {renderLineChart(stats.game3.daily_avg_power_trend, '평균 파워')}
                                </div>
                                <div className="chart-container">
                                    <h4>도움 수준별 평균 성공률 (%)</h4>
                                    {renderBarChart(stats.game3.success_rate_by_assistance, '성공률')}
                                </div>
                            </section>
                        )}
                    </div>
                 ) : ( <p className="status-text">표시할 데이터가 없습니다.</p> )
                }
            </main>

            <footer className="bottom-navigation">
                {navItems.map((item) => (
                    <button 
                        key={item.id} 
                        className={`nav-item ${item.id === 'stats' ? 'active' : ''}`}
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

export default StatsScreen;