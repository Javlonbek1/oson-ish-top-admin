import { useCallback, useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import { Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function AdsStats({ baseUrl = '', axiosInstance }) {
    const { adsId } = useParams();

    function monthName(m) {
        switch (m) {
            case 1:
                return 'Yanvar';
            case 2:
                return 'Fevral';
            case 3:
                return 'Mart';
            case 4:
                return 'Aprel';
            case 5:
                return 'May';
            case 6:
                return 'Iyun';
            case 7:
                return 'Iyul';
            case 8:
                return 'Avgust';
            case 9:
                return 'Sentabr';
            case 10:
                return 'Oktabr';
            case 11:
                return 'Noyabr';
            case 12:
                return 'Dekabr';
        }
    }

    const API_BASE_URL = baseUrl;
    const ax = axiosInstance || (typeof window !== 'undefined' && window.axios);

    // Stats state
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState('');
    const [day, setDay] = useState('');
    const [statsData, setStatsData] = useState(null);
    const [statsLoading, setStatsLoading] = useState(false);
    const [statsError, setStatsError] = useState('');

    // Fetch stats (GET /ads/{id}/stats)
    const fetchStats = useCallback(
        async () => {
            if (!adsId) {
                setStatsError('Iltimos, reklamani tanlang');
                return;
            }

            if (!ax) {
                setStatsError('Axios instance topilmadi');
                return;
            }

            setStatsLoading(true);
            setStatsError('');

            try {
                // params bilan qulayroq
                const params = {
                    year: year,
                };

                if (month) {
                    params.month = month;
                    if (day) params.day = day;
                }

                const res = await ax.get(
                    `${API_BASE_URL}/ads-stats/${adsId}/stats`,
                    { params }
                );

                const result = res.data;

                if (res.status === 200) setStatsData(result);
                else setStatsError('Statistikani olishda xato');
            } catch (error) {
                console.error('Stats fetch error:', error);
                setStatsError('Statistikani olishda xato: ' + (error?.message || 'Unknown error'));
            } finally {
                setStatsLoading(false);
            }
        },
        [API_BASE_URL, ax, adsId, year, month, day]
    );

    // Prepare chart data
    const getChartData = () => {
        if (!statsData || !statsData.items) return [];
        return Object.entries(statsData.items).map(([key, value]) => ({
            label: key,
            views: value.view || 0,
            clicks: value.click || 0,
        }));
    };

    // Get stats mode title
    const getStatsTitle = () => {
        if (!month) return `${year} yil bo'yicha oylar kesimida`;
        else if (!day) return `${year}-${String(month).padStart(2, '0')} oy bo'yicha kunlar`;
        else return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')} kun bo'yicha soatlar`;
    };

    useEffect(() => {
        fetchStats();
    }, [adsId, year, month, day, fetchStats]);

    return (
        <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '20px' }}>
            {/* Date Filter for Stats */}
            <div style={{
                backgroundColor: '#f8f9fa',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px'
            }}>
                <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Vaqt filtri</h3>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginBottom: '15px' }}>
                    {/* Year */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Yil
                        </label>
                        <input
                            type="number"
                            value={year}
                            onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
                            style={{
                                width: '100%',
                                padding: '8px',
                                fontSize: '14px',
                                borderRadius: '4px',
                                border: '1px solid #ccc'
                            }}
                        />
                    </div>

                    {/* Month */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Oy (optional)
                        </label>
                        <select
                            value={month}
                            onChange={(e) => {
                                setMonth(e.target.value);
                                if (!e.target.value) setDay('');
                            }}
                            style={{
                                width: '100%',
                                padding: '8px',
                                fontSize: '14px',
                                borderRadius: '4px',
                                border: '1px solid #ccc'
                            }}
                        >
                            <option value="">Tanlanmagan</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => (
                                <option key={m} value={m}>{monthName(m)}</option>
                            ))}
                        </select>
                    </div>

                    {/* Day */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Kun (optional)
                        </label>

                        <input
                            type="number"
                            min="1"
                            max="31"
                            value={day}
                            onChange={(e) => setDay(e.target.value)}
                            disabled={!month}
                            placeholder="1 - 31"
                            style={{
                                width: '100%',
                                padding: '8px',
                                fontSize: '14px',
                                borderRadius: '4px',
                                border: '1px solid #ccc'
                            }}
                        />
                    </div>

                </div>

                <button
                    onClick={fetchStats}
                    disabled={!adsId || statsLoading}
                    style={{
                        width: '100%',
                        padding: '10px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        backgroundColor: (!adsId || statsLoading) ? '#6c757d' : '#28a745',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: (!adsId || statsLoading) ? 'not-allowed' : 'pointer'
                    }}
                >
                    {statsLoading ? 'Yuklanmoqda...' : 'Filtrlash'}
                </button>
            </div>

            {/* Stats Chart */}
            <div style={{
                backgroundColor: '#fff',
                padding: '20px',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{ marginTop: 0 }}>Reklama statistikasi</h2>

                {statsLoading && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
                        Statistika yuklanmoqda...
                    </div>
                )}

                {statsError && (
                    <div style={{
                        padding: '12px',
                        backgroundColor: '#f8d7da',
                        color: '#721c24',
                        borderRadius: '4px',
                        marginBottom: '20px'
                    }}>
                        {statsError}
                    </div>
                )}

                {!statsLoading && !statsError && statsData && (
                    <>
                        {/* ---- UMUMIY STATISTIKA ---- */}
                        {statsData.total && (
                            <div
                                style={{
                                    marginTop: '10px',
                                    display: 'flex',
                                    gap: '20px',
                                    marginBottom: '20px',
                                    padding: '16px',
                                    borderRadius: '10px',
                                    background: '#f7f7f7',
                                    boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                                }}
                            >
                                <div style={{ flex: 1, textAlign: 'center' }}>
                                    <h3 style={{ margin: 0, color: '#555' }}>Umumiy ko‘rishlar</h3>
                                    <p
                                        style={{
                                            margin: '8px 0 0 0',
                                            fontSize: '28px',
                                            fontWeight: 'bold',
                                            color: '#8884d8'
                                        }}
                                    >
                                        {statsData.total.view ?? 0}
                                    </p>
                                </div>

                                <div style={{ flex: 1, textAlign: 'center' }}>
                                    <h3 style={{ margin: 0, color: '#555' }}>Umumiy bosishlar</h3>
                                    <p
                                        style={{
                                            margin: '8px 0 0 0',
                                            fontSize: '28px',
                                            fontWeight: 'bold',
                                            color: '#82ca9d'
                                        }}
                                    >
                                        {statsData.total.click ?? 0}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* ---- TITLE ---- */}
                        <p style={{ color: '#666', marginBottom: '20px' }}>
                            {getStatsTitle()}
                        </p>

                        {/* ---- CHART ---- */}
                        <ResponsiveContainer width="100%" height={400}>
                            <LineChart data={getChartData()}>
                                <XAxis dataKey="label" />
                                <YAxis />
                                <Tooltip />
                                <Legend />

                                <Line
                                    type="monotone"
                                    dataKey="views"
                                    stroke="#8884d8"
                                    strokeWidth={3}
                                    dot={true}
                                    name="Ko'rishlar"
                                />

                                <Line
                                    type="monotone"
                                    dataKey="clicks"
                                    stroke="#82ca9d"
                                    strokeWidth={3}
                                    dot={true}
                                    name="Bosishlar"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </>
                )}

                {!statsLoading && !statsError && !statsData && adsId && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                        Statistikani ko'rish uchun "Filtrlash" tugmasini bosing
                    </div>
                )}

                {!statsLoading && !statsError && !adsId && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                        Statistikani ko'rish uchun reklamani tanlang
                    </div>
                )}
            </div>
        </div>
    );
}