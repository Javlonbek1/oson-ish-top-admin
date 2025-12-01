import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const AdsStatsDashboard = ({ adsId = "21614c8a-6e3f-46ef-86da-1f6af1e4a56c", axiosInstance }) => {
    const ax = axiosInstance || (typeof window !== "undefined" && window.axios);

    const currentYear = new Date().getFullYear();

    const [year, setYear] = useState(currentYear);
    const [month, setMonth] = useState('');
    const [day, setDay] = useState('');
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const months = [
        { value: 1, label: 'Yanvar' },
        { value: 2, label: 'Fevral' },
        { value: 3, label: 'Mart' },
        { value: 4, label: 'Aprel' },
        { value: 5, label: 'May' },
        { value: 6, label: 'Iyun' },
        { value: 7, label: 'Iyul' },
        { value: 8, label: 'Avgust' },
        { value: 9, label: 'Sentabr' },
        { value: 10, label: 'Oktabr' },
        { value: 11, label: 'Noyabr' },
        { value: 12, label: 'Dekabr' }
    ];

    const getDaysInMonth = (year, month) => {
        if (!month) return [];
        return Array.from({ length: new Date(year, month, 0).getDate() }, (_, i) => i + 1);
    };

    useEffect(() => {
        if (!adsId) {
            setData(null);
            return;
        }

        const fetchStats = async () => {
            if (!ax) {
                setError('Axios instance topilmadi');
                return;
            }

            setLoading(true);
            setError(null);

            try {
                const params = {};

                if (year) params.year = year;
                if (month) params.month = month;
                if (day) params.day = day;

                const res = await ax.get(`/api/ads-stats/${adsId}/stats`, { params });

                if (res.status !== 200) throw new Error('Ma\'lumotlarni yuklashda xatolik');

                setData(res.data);
            } catch (err) {
                console.error('Stats fetch error:', err);
                setError(err?.message || 'Xatolik yuz berdi');
                setData(null);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [adsId, year, month, day]);

    useEffect(() => {
        setDay('');
    }, [month]);

    useEffect(() => {
        setMonth('');
        setDay('');
    }, [year]);

    if (!adsId) {
        return (
            <div className="flex items-center justify-center p-8 bg-gray-50 rounded-lg">
                <p className="text-gray-600 text-lg">Reklama tanlanmagan</p>
            </div>
        );
    }

    const chartData = data?.items
        ? Object.entries(data.items).map(([key, values]) => ({
            key,
            view: values.view,
            click: values.click
        }))
        : [];

    const ctr = data?.total?.view > 0
        ? ((data.total.click / data.total.view) * 100).toFixed(2)
        : 0;

    return (
        <div className="w-full max-w-7xl mx-auto p-6 space-y-6">
            {/* Filterlar */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Statistika filtrlari</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Year */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Yil
                        </label>
                        <input
                            type="number"
                            value={year}
                            onChange={(e) => setYear(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            min="2020"
                            max="2030"
                        />
                    </div>

                    {/* Month */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Oy (ixtiyoriy)
                        </label>
                        <select
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Tanlang...</option>
                            {months.map((m) => (
                                <option key={m.value} value={m.value}>
                                    {m.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Day */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Kun (ixtiyoriy)
                        </label>
                        <select
                            value={day}
                            onChange={(e) => setDay(e.target.value)}
                            disabled={!month}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                            <option value="">Tanlang...</option>
                            {getDaysInMonth(year, month).map((d) => (
                                <option key={d} value={d}>
                                    {d}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center p-8 bg-white rounded-lg shadow-md">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    <p className="ml-4 text-gray-600">Yuklanmoqda...</p>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                    <p className="text-red-700 font-medium">{error}</p>
                </div>
            )}

            {/* Ma'lumotlar */}
            {!loading && !error && data && (
                <>
                    {/* Umumiy statistika */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 rounded-lg shadow-lg text-white">
                            <h3 className="text-sm font-medium opacity-90 mb-2">Umumiy ko'rishlar</h3>
                            <p className="text-3xl font-bold">{data.total.view.toLocaleString()}</p>
                        </div>

                        <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 rounded-lg shadow-lg text-white">
                            <h3 className="text-sm font-medium opacity-90 mb-2">Umumiy bosishlar</h3>
                            <p className="text-3xl font-bold">{data.total.click.toLocaleString()}</p>
                        </div>

                        <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 rounded-lg shadow-lg text-white">
                            <h3 className="text-sm font-medium opacity-90 mb-2">CTR (Click-Through Rate)</h3>
                            <p className="text-3xl font-bold">{ctr}%</p>
                        </div>
                    </div>

                    {/* Grafik */}
                    <div className="bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-bold mb-4 text-gray-800">Grafik</h3>
                        <ResponsiveContainer width="100%" height={400}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="key" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="view" fill="#3b82f6" name="Ko'rishlar" />
                                <Bar dataKey="click" fill="#10b981" name="Bosishlar" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Jadval */}
                    <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
                        <h3 className="text-xl font-bold mb-4 text-gray-800">Batafsil jadval</h3>
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b-2 border-gray-200">
                                    <th className="py-3 px-4 font-semibold text-gray-700">Davr</th>
                                    <th className="py-3 px-4 font-semibold text-gray-700">Ko'rishlar</th>
                                    <th className="py-3 px-4 font-semibold text-gray-700">Bosishlar</th>
                                    <th className="py-3 px-4 font-semibold text-gray-700">CTR</th>
                                </tr>
                            </thead>
                            <tbody>
                                {chartData.map((row, index) => {
                                    const rowCtr = row.view > 0
                                        ? ((row.click / row.view) * 100).toFixed(2)
                                        : 0;
                                    return (
                                        <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                                            <td className="py-3 px-4 font-medium text-gray-800">{row.key}</td>
                                            <td className="py-3 px-4 text-gray-600">{row.view.toLocaleString()}</td>
                                            <td className="py-3 px-4 text-gray-600">{row.click.toLocaleString()}</td>
                                            <td className="py-3 px-4 text-gray-600">{rowCtr}%</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
};

export default AdsStatsDashboard;