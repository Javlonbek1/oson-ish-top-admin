import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Download, RefreshCw, X } from 'lucide-react';

// Mock data for demo
const MOCK_DATA = {
    periods: [
        { period: "jan", summary: { in: 100, grossOut: 50, netOut: 50, payMe: 10, click: 20, paynet: 10, cash: 60, bonus: 0, returned: 0, refundRatePercent: 0 } },
        { period: "feb", summary: { in: 200, grossOut: 150, netOut: 50, payMe: 40, click: 60, paynet: 20, cash: 80, bonus: 0, returned: 100, refundRatePercent: 66.6 } },
        { period: "mar", summary: { in: 130, grossOut: 80, netOut: 50, payMe: 70, click: 20, paynet: 10, cash: 30, bonus: 0, returned: 30, refundRatePercent: 37.5 } },
        { period: "apr", summary: { in: 180, grossOut: 120, netOut: 60, payMe: 30, click: 50, paynet: 15, cash: 85, bonus: 0, returned: 50, refundRatePercent: 41.7 } },
        { period: "may", summary: { in: 220, grossOut: 170, netOut: 50, payMe: 50, click: 70, paynet: 25, cash: 75, bonus: 0, returned: 80, refundRatePercent: 47.1 } },
        { period: "jun", summary: { in: 150, grossOut: 90, netOut: 60, payMe: 25, click: 40, paynet: 12, cash: 73, bonus: 0, returned: 40, refundRatePercent: 44.4 } }
    ],
    total: { in: 980, grossOut: 660, netOut: 320, payMe: 225, click: 260, paynet: 92, cash: 403, bonus: 0, returned: 300, refundRatePercent: 45.5 }
};

const months = [
    "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
    "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"
];

const FinanceStats = ({
    baseUrl = '/api/v1/finance',
    initialYear = new Date().getFullYear(),
    initialMonth = null,
    initialDay = null,
    onPeriodClick,
    axiosInstance
}) => {
    const ax = axiosInstance || (typeof window !== "undefined" && window.axios);
    const [filters, setFilters] = useState({
        year: initialYear,
        month: initialMonth,
        day: initialDay
    });

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [chartType, setChartType] = useState('line');
    const [sortColumn, setSortColumn] = useState('period');
    const [sortDirection, setSortDirection] = useState('asc');
    const [selectedPeriod, setSelectedPeriod] = useState(null);
    const [hoveredPeriod, setHoveredPeriod] = useState(null);
    const [cache, setCache] = useState(new Map());

    const cacheKey = useMemo(() =>
        `${filters.year}-${filters.month || 'null'}-${filters.day || 'null'}`,
        [filters]
    );

    const fetchData = useCallback(async () => {
        if (!ax) {
            setError('Axios instance topilmadi');
            return;
        }

        if (cache.has(cacheKey)) {
            setData(cache.get(cacheKey));
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const params = {};
            if (filters.year) params.year = filters.year;
            if (filters.month) params.month = filters.month;
            if (filters.day) params.day = filters.day;

            const res = await ax.get(`${baseUrl}/summary/periodic`, { params });

            if (res.status !== 200) {
                throw new Error(`API failed: HTTP ${res.status}`);
            }

            const result = res.data;
            setData(result);
            setCache(new Map(cache).set(cacheKey, result));
        } catch (err) {
            console.error('Finance API error:', err);
            setError('Failed to load financial data. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [cacheKey, cache, baseUrl, filters, ax]);


    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleApply = () => {
        fetchData();
    };

    const handleReset = () => {
        setFilters({ year: new Date().getFullYear(), month: null, day: null });
    };

    const sortedPeriods = useMemo(() => {
        if (!data) return [];

        const sorted = [...data.periods].sort((a, b) => {
            if (sortColumn === 'period') {
                return sortDirection === 'asc'
                    ? a.period.localeCompare(b.period)
                    : b.period.localeCompare(a.period);
            }

            const aVal = a.summary[sortColumn];
            const bVal = b.summary[sortColumn];
            return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
        });

        return sorted;
    }, [data, sortColumn, sortDirection]);

    const chartData = useMemo(() => {
        if (!data) return [];

        return data.periods.map(p => ({
            period: p.period,
            In: p.summary.in,
            'Gross Out': p.summary.grossOut,
            'Net Out': p.summary.netOut,
            Returned: p.summary.returned
        }));
    }, [data]);

    const exportCSV = () => {
        if (!data) return;

        const headers = ['Period', 'In', 'Gross Out', 'Net Out', 'Pay Me', 'Click', 'Paynet', 'Cash', 'Bonus', 'Returned', 'Refund Rate %'];
        const rows = data.periods.map(p => [
            p.period,
            p.summary.in,
            p.summary.grossOut,
            p.summary.netOut,
            p.summary.payMe,
            p.summary.click,
            p.summary.paynet,
            p.summary.cash,
            p.summary.bonus,
            p.summary.returned,
            p.summary.refundRatePercent
        ]);

        const csv = [headers, ...rows, ['TOTAL', data.total.in, data.total.grossOut, data.total.netOut, data.total.payMe, data.total.click, data.total.paynet, data.total.cash, data.total.bonus, data.total.returned, data.total.refundRatePercent]]
            .map(row => row.join(','))
            .join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `finance-stats-${cacheKey}.csv`;
        a.click();
    };

    const handleSort = (column) => {
        if (sortColumn === column) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortColumn(column);
            setSortDirection('asc');
        }
    };

    const handlePeriodClick = (period) => {
        setSelectedPeriod(period);
        if (onPeriodClick) {
            onPeriodClick(period.period, period.summary);
        }
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(value);
    };

    if (error) {
        return (
            <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 mb-4">{error}</p>
                <button onClick={fetchData} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 flex items-center gap-2">
                    <RefreshCw size={16} /> Retry
                </button>
            </div>
        );
    }

    return (
        <div className="w-full p-6 bg-gray-50 min-h-screen">
            {/* Filters */}
            <div className="bg-white p-6 rounded-lg shadow mb-6">
                <h2 className="text-2xl font-bold mb-4">Finance Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Year</label>
                        <input
                            type="number"
                            value={filters.year}
                            onChange={(e) => setFilters({ ...filters, year: parseInt(e.target.value) || new Date().getFullYear() })}
                            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                            aria-label="Year filter"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Month (optional)</label>
                        <select
                            value={filters.month || ''}
                            onChange={(e) => setFilters({ ...filters, month: e.target.value ? parseInt(e.target.value) : null, day: null })}
                            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500"
                            aria-label="Month filter"
                        >
                            <option value="">All</option>
                            {months.map((month, i) => (
                                <option key={i + 1} value={i + 1}>
                                    {month}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">Day (optional)</label>
                        <input
                            type="number"
                            value={filters.day || ''}
                            onChange={(e) =>
                                setFilters({
                                    ...filters,
                                    day: e.target.value ? parseInt(e.target.value, 10) : null
                                })
                            }
                            disabled={!filters.month}
                            min={1}
                            max={31}
                            placeholder="Day"
                            className="w-full px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                            aria-label="Day filter"
                        />
                    </div>

                    <div className="flex items-end gap-2">
                        <button onClick={handleApply} className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                            Apply
                        </button>
                        <button onClick={handleReset} className="px-6 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition">
                            Reset
                        </button>
                    </div>

                    <div className="flex items-end">
                        <button onClick={exportCSV} disabled={!data} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition flex items-center gap-2 disabled:bg-gray-300">
                            <Download size={16} /> Export CSV
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="bg-white p-12 rounded-lg shadow text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading financial data...</p>
                </div>
            ) : data ? (
                <>
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        {/* <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">Total In</span>
                                <TrendingUp className="text-green-600" size={20} />
                            </div>
                            <div className="text-2xl font-bold text-green-600">{formatCurrency(data.total.in)}</div>
                        </div> */}

                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">Total In</span>
                                <TrendingUp className="text-green-600" size={20} />
                            </div>
                            <div className="
                                text-2xl font-bold text-green-600 
                                overflow-hidden text-ellipsis whitespace-nowrap
                            ">
                                {formatCurrency(data.total.in)}
                            </div>
                        </div>


                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">Gross Out</span>
                                <DollarSign className="text-blue-600" size={20} />
                            </div>
                            <div className="text-2xl font-bold text-blue-600">{formatCurrency(data.total.grossOut)}</div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">Net Out</span>
                                <TrendingDown className={data.total.netOut < 0 ? 'text-red-600' : 'text-green-600'} size={20} />
                            </div>
                            <div className={`text-2xl font-bold ${data.total.netOut < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                {formatCurrency(data.total.netOut)}
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-600">Refund Rate</span>
                            </div>
                            <div className="text-2xl font-bold text-gray-800">{data.total.refundRatePercent.toFixed(1)}%</div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Chart */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">Trend Analysis</h3>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setChartType('line')}
                                        className={`px-3 py-1 rounded ${chartType === 'line' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                                    >
                                        Line
                                    </button>
                                    <button
                                        onClick={() => setChartType('bar')}
                                        className={`px-3 py-1 rounded ${chartType === 'bar' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                                    >
                                        Bar
                                    </button>
                                </div>
                            </div>

                            <ResponsiveContainer width="100%" height={300}>
                                {chartType === 'line' ? (
                                    <LineChart data={chartData} onMouseMove={(e) => e.activeLabel && setHoveredPeriod(e.activeLabel)} onMouseLeave={() => setHoveredPeriod(null)}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="period" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="In" stroke="#10b981" strokeWidth={2} />
                                        <Line type="monotone" dataKey="Gross Out" stroke="#3b82f6" strokeWidth={2} />
                                        <Line type="monotone" dataKey="Net Out" stroke="#ef4444" strokeWidth={2} />
                                        <Line type="monotone" dataKey="Returned" stroke="#6b7280" strokeWidth={2} />
                                    </LineChart>
                                ) : (
                                    <BarChart data={chartData} onMouseMove={(e) => e.activeLabel && setHoveredPeriod(e.activeLabel)} onMouseLeave={() => setHoveredPeriod(null)}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="period" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="In" fill="#10b981" />
                                        <Bar dataKey="Gross Out" fill="#3b82f6" />
                                        <Bar dataKey="Net Out" fill="#ef4444" />
                                        <Bar dataKey="Returned" fill="#6b7280" />
                                    </BarChart>
                                )}
                            </ResponsiveContainer>
                        </div>

                        {/* Period Table */}
                        <div className="bg-white p-6 rounded-lg shadow overflow-auto" style={{ maxHeight: '400px' }}>
                            <h3 className="text-lg font-semibold mb-4">Period Breakdown</h3>
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100 sticky top-0">
                                    <tr>
                                        <th className="p-2 text-left cursor-pointer hover:bg-gray-200" onClick={() => handleSort('period')}>
                                            Period {sortColumn === 'period' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="p-2 text-right cursor-pointer hover:bg-gray-200" onClick={() => handleSort('in')}>
                                            In {sortColumn === 'in' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="p-2 text-right cursor-pointer hover:bg-gray-200" onClick={() => handleSort('netOut')}>
                                            Net {sortColumn === 'netOut' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                        <th className="p-2 text-right cursor-pointer hover:bg-gray-200" onClick={() => handleSort('refundRatePercent')}>
                                            Refund% {sortColumn === 'refundRatePercent' && (sortDirection === 'asc' ? '↑' : '↓')}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedPeriods.map((p) => (
                                        <tr
                                            key={p.period}
                                            onClick={() => handlePeriodClick(p)}
                                            className={`border-b hover:bg-blue-50 cursor-pointer transition ${hoveredPeriod === p.period ? 'bg-blue-100' : ''}`}
                                        >
                                            <td className="p-2 font-medium">{p.period}</td>
                                            <td className="p-2 text-right text-green-600">{formatCurrency(p.summary.in)}</td>
                                            <td className={`p-2 text-right ${p.summary.netOut < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                                {formatCurrency(p.summary.netOut)}
                                            </td>
                                            <td className="p-2 text-right">{p.summary.refundRatePercent.toFixed(1)}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : null}

            {/* Modal */}
            {selectedPeriod && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedPeriod(null)}>
                    <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-96 overflow-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Period: {selectedPeriod.period}</h3>
                            <button onClick={() => setSelectedPeriod(null)} className="text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><strong>In:</strong> {formatCurrency(selectedPeriod.summary.in)}</div>
                            <div><strong>Gross Out:</strong> {formatCurrency(selectedPeriod.summary.grossOut)}</div>
                            <div><strong>Net Out:</strong> {formatCurrency(selectedPeriod.summary.netOut)}</div>
                            <div><strong>Pay Me:</strong> {formatCurrency(selectedPeriod.summary.payMe)}</div>
                            <div><strong>Click:</strong> {formatCurrency(selectedPeriod.summary.click)}</div>
                            <div><strong>Paynet:</strong> {formatCurrency(selectedPeriod.summary.paynet)}</div>
                            <div><strong>Cash:</strong> {formatCurrency(selectedPeriod.summary.cash)}</div>
                            <div><strong>Bonus:</strong> {formatCurrency(selectedPeriod.summary.bonus)}</div>
                            <div><strong>Returned:</strong> {formatCurrency(selectedPeriod.summary.returned)}</div>
                            <div><strong>Refund Rate:</strong> {selectedPeriod.summary.refundRatePercent.toFixed(1)}%</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FinanceStats;