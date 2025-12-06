import { useCallback, useEffect, useState } from 'react';
import { Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function AdsStats({ baseUrl = '', axiosInstance }) {

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

    // Ads list state
    const [filter, setFilter] = useState('ACTIVE');
    const [page, setPage] = useState(1);
    const [adsData, setAdsData] = useState(null);
    const [adsLoading, setAdsLoading] = useState(false);
    const [adsError, setAdsError] = useState('');
    const [selectedAdsId, setSelectedAdsId] = useState('');

    // Stats state
    const [year, setYear] = useState(new Date().getFullYear());
    const [month, setMonth] = useState('');
    const [day, setDay] = useState('');
    const [statsData, setStatsData] = useState(null);
    const [statsLoading, setStatsLoading] = useState(false);
    const [statsError, setStatsError] = useState('');

    // Fetch ads list (GET /ads/read)
    const fetchAds = useCallback(
        async (filterValue, pageValue) => {
            if (!ax) {
                setAdsError('Axios instance topilmadi');
                return;
            }

            setAdsLoading(true);
            setAdsError('');

            try {
                const params = {
                    filter: filterValue,
                    page: pageValue,
                    size: 20,
                };

                const res = await ax.get(`${API_BASE_URL}/ads/read`, { params });

                if (res.status !== 200) throw new Error(`API failed: HTTP ${res.status}`);

                const result = res.data;

                if (result.success && result.data) {
                    setAdsData(result.data);

                    // Auto-select first ad if available
                    if (result.data.content && result.data.content.length > 0) {
                        const firstAdId = result.data.content[0].id;
                        setSelectedAdsId(firstAdId);
                    } else {
                        setSelectedAdsId('');
                        setStatsData(null);
                    }
                } else {
                    setAdsError(result.message || 'Reklamalarni olishda xato');
                }
            } catch (error) {
                console.error('Ads fetch error:', error);
                setAdsError('Reklamalarni olishda xato: ' + (error?.message || 'Unknown error'));
            } finally {
                setAdsLoading(false);
            }
        },
        [API_BASE_URL, ax]
    );

    // Fetch stats (GET /ads/{id}/stats)
    const fetchStats = useCallback(
        async () => {
            if (!selectedAdsId) {
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
                    `${API_BASE_URL}/ads-stats/${selectedAdsId}/stats`,
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
        [API_BASE_URL, ax, selectedAdsId, year, month, day]
    );

    // Initial + filter/page changes
    useEffect(() => {
        fetchAds(filter, page);
    }, [filter, page, fetchAds]);

    // Stats when selectedAdsId changes
    useEffect(() => {
        if (selectedAdsId) {
            fetchStats();
        } else {
            setStatsData(null);
        }
    }, [selectedAdsId, fetchStats]);

    // Handle filter change
    const handleFilterChange = (e) => {
        setFilter(e.target.value);
        setPage(1);
    };

    // Handle page navigation
    const handlePrevPage = () => {
        if (adsData && !adsData.first) {
            setPage((prev) => prev - 1);
        }
    };

    const handleNextPage = () => {
        if (adsData && !adsData.last) {
            setPage((prev) => prev + 1);
        }
    };

    // Handle ads selection
    const handleAdsChange = (e) => {
        setSelectedAdsId(e.target.value);
    };

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

    return (
        <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '20px' }}>
            <h1>Reklama Statistikasi</h1>

            {/* Filter and Ads Selection */}
            <div style={{
                backgroundColor: '#f8f9fa',
                padding: '20px',
                borderRadius: '8px',
                marginBottom: '20px'
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '15px', marginBottom: '15px' }}>
                    {/* Filter */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Holat bo'yicha filter
                        </label>
                        <select
                            value={filter}
                            onChange={handleFilterChange}
                            style={{
                                width: '100%',
                                padding: '8px',
                                fontSize: '14px',
                                borderRadius: '4px',
                                border: '1px solid #ccc'
                            }}
                            disabled={adsLoading}
                        >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="INACTIVE">INACTIVE</option>
                            <option value="ALL">ALL</option>
                        </select>
                    </div>

                    {/* Ads Selection */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                            Reklamani tanlang
                        </label>
                        <select
                            value={selectedAdsId}
                            onChange={handleAdsChange}
                            style={{
                                width: '100%',
                                padding: '8px',
                                fontSize: '14px',
                                borderRadius: '4px',
                                border: '1px solid #ccc'
                            }}
                            disabled={adsLoading || !adsData || adsData.content.length === 0}
                        >
                            <option value="">Reklamani tanlang...</option>
                            {adsData && adsData.content && adsData.content.map((ad) => (
                                <option key={ad.id} value={ad.id}>
                                    {ad.destination} | {ad.createdDate.slice(0, 10)} → {ad.expiredDate.slice(0, 10)}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Ads Loading/Error */}
                {adsLoading && (
                    <div style={{ color: '#666', textAlign: 'center', padding: '10px' }}>
                        Reklamalar yuklanmoqda...
                    </div>
                )}
                {adsError && (
                    <div style={{
                        padding: '10px',
                        backgroundColor: '#f8d7da',
                        color: '#721c24',
                        borderRadius: '4px',
                        marginTop: '10px'
                    }}>
                        {adsError}
                    </div>
                )}

                {/* Pagination */}
                {adsData && (
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '15px'
                    }}>
                        <button
                            onClick={handlePrevPage}
                            disabled={!adsData || adsData.first || adsLoading}
                            style={{
                                padding: '8px 16px',
                                fontSize: '14px',
                                backgroundColor: (!adsData || adsData.first || adsLoading) ? '#6c757d' : '#007bff',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: (!adsData || adsData.first || adsLoading) ? 'not-allowed' : 'pointer'
                            }}
                        >
                            « Prev
                        </button>

                        <span style={{ color: '#666' }}>
                            Page {page} / {adsData.totalPages || 1}
                        </span>

                        <button
                            onClick={handleNextPage}
                            disabled={!adsData || adsData.last || adsLoading}
                            style={{
                                padding: '8px 16px',
                                fontSize: '14px',
                                backgroundColor: (!adsData || adsData.last || adsLoading) ? '#6c757d' : '#007bff',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: (!adsData || adsData.last || adsLoading) ? 'not-allowed' : 'pointer'
                            }}
                        >
                            Next »
                        </button>
                    </div>
                )}
            </div>

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
                    disabled={!selectedAdsId || statsLoading}
                    style={{
                        width: '100%',
                        padding: '10px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        backgroundColor: (!selectedAdsId || statsLoading) ? '#6c757d' : '#28a745',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: (!selectedAdsId || statsLoading) ? 'not-allowed' : 'pointer'
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

                {!statsLoading && !statsError && !statsData && selectedAdsId && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                        Statistikani ko'rish uchun "Filtrlash" tugmasini bosing
                    </div>
                )}

                {!statsLoading && !statsError && !selectedAdsId && (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                        Statistikani ko'rish uchun reklamani tanlang
                    </div>
                )}
            </div>
        </div>
    );
}