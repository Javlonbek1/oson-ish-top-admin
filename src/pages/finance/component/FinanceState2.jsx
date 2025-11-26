// src/components/FinanceStats.jsx

import {
    Alert,
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TableSortLabel,
    Typography,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    Title,
    Tooltip,
} from 'chart.js';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Helper function to get days in month
const getDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
};

// Helper to format period label
const formatPeriodLabel = (period, viewMode) => {
    if (viewMode === 'monthly') return period.toUpperCase();
    if (viewMode === 'daily') return `Day ${period}`;
    if (viewMode === 'hourly') return period;
    return period;
};

// Helper to create CSV
const downloadCSV = (data, filename) => {
    const csv = Papa.unparse(data); // Assuming PapaParse is included, or implement manual CSV
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
};

// Note: For CSV, we'll use a simple function instead of library for self-contained
const toCSV = (periods, total) => {
    const headers = ['Period', 'In', 'Gross Out', 'Net Out', 'Pay Me', 'Click', 'Paynet', 'Cash', 'Bonus', 'Returned', 'Refund Rate (%)'];
    let csv = headers.join(',') + '\n';
    periods.forEach(p => {
        const row = [
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
            p.summary.refundRatePercent,
        ];
        csv += row.join(',') + '\n';
    });
    csv += ['Total', total.in, total.grossOut, total.netOut, total.payMe, total.click, total.paynet, total.cash, total.bonus, total.returned, total.refundRatePercent].join(',') + '\n';
    return csv;
};

const FinanceStats = ({
    baseUrl = '/api/v1/finance',
    initialYear = new Date().getFullYear(),
    initialMonth = null,
    initialDay = null,
    onPeriodClick = () => { },
    axiosInstance
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const ax = axiosInstance || (typeof window !== "undefined" && window.axios);

    const [year, setYear] = useState(initialYear);
    const [month, setMonth] = useState(initialMonth);
    const [day, setDay] = useState(initialDay);
    const [viewMode, setViewMode] = useState('monthly'); // monthly, daily, hourly
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [cache, setCache] = useState({}); // key: JSON.stringify(filters)
    const [sortBy, setSortBy] = useState('period');
    const [sortDir, setSortDir] = useState('asc');
    const [hoveredPeriod, setHoveredPeriod] = useState(null);
    const [openModal, setOpenModal] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState(null);
    const [chartType, setChartType] = useState('stacked'); // stacked or separate
    const chartRef = useRef(null);

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 10 }, (_, i) => currentYear - i + 1);

    const months = Array.from({ length: 12 }, (_, i) => i + 1);

    const days = useMemo(() => {
        if (!month) return [];
        return Array.from({ length: getDaysInMonth(year, month) }, (_, i) => i + 1);
    }, [year, month]);

    const getCacheKey = useCallback(() => JSON.stringify({ year, month, day }), [year, month, day]);

    const fetchData = useCallback(async () => {
        if (!ax) return;

        const key = getCacheKey();
        if (cache[key]) {
            setData(cache[key]);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            let url = `${baseUrl}/summary/periodic`;
            const params = {};
            if (year) params.year = year;
            if (month) params.month = month;
            if (day) params.day = day;

            const res = await ax.get(url, { params });

            if (res.status !== 200) {
                throw new Error(`Fetch failed: HTTP ${res.status}`);
            }

            const json = res.data;
            setData(json);
            setCache(prev => ({ ...prev, [key]: json }));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [ax, baseUrl, year, month, day, cache, getCacheKey]);

    useEffect(() => {
        setViewMode(day ? 'hourly' : month ? 'daily' : 'monthly');
        // Reset day/month if invalid
        if (month && day > getDaysInMonth(year, month)) setDay(null);
    }, [year, month, day]);

    useEffect(() => {
        fetchData();
    }, []); // Initial fetch

    const handleApply = () => {
        fetchData();
    };

    const handleReset = () => {
        setYear(currentYear);
        setMonth(null);
        setDay(null);
        setViewMode('monthly');
        fetchData();
    };

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortDir('asc');
        }
    };

    const sortedPeriods = useMemo(() => {
        if (!data || !data.periods) return [];
        const periods = [...data.periods];
        if (sortBy === 'period') {
            // Default order
            return periods; // Assume API returns in order
        }
        periods.sort((a, b) => {
            let valA = a.summary[sortBy];
            let valB = b.summary[sortBy];
            if (sortBy === 'refundRatePercent') {
                valA = a.summary.refundRatePercent;
                valB = b.summary.refundRatePercent;
            }
            const dir = sortDir === 'asc' ? 1 : -1;
            return valA > valB ? dir : valA < valB ? -dir : 0;
        });
        return periods;
    }, [data, sortBy, sortDir]);

    const chartData = useMemo(() => {
        if (!data || !data.periods) return null;
        const labels = data.periods.map(p => formatPeriodLabel(p.period, viewMode));
        const datasets = [
            {
                label: 'In',
                data: data.periods.map(p => p.summary.in),
                backgroundColor: 'green',
                stack: chartType === 'stacked' ? 'stack' : undefined,
            },
            {
                label: 'Gross Out',
                data: data.periods.map(p => p.summary.grossOut),
                backgroundColor: 'blue',
                stack: chartType === 'stacked' ? 'stack' : undefined,
            },
            {
                label: 'Net Out',
                data: data.periods.map(p => p.summary.netOut),
                backgroundColor: p => p < 0 ? 'red' : 'blue', // But Chart.js doesn't support per-bar, so average
                backgroundColor: 'red',
                stack: chartType === 'stacked' ? 'stack' : undefined,
            },
            {
                label: 'Returned',
                data: data.periods.map(p => p.summary.returned),
                backgroundColor: 'gray',
                stack: chartType === 'stacked' ? 'stack' : undefined,
            },
        ];
        return { labels, datasets };
    }, [data, viewMode, chartType]);

    const chartOptions = {
        responsive: true,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        scales: {
            x: { stacked: chartType === 'stacked' },
            y: { stacked: chartType === 'stacked' },
        },
        plugins: {
            tooltip: {
                callbacks: {
                    label: (context) => {
                        const period = data.periods[context.dataIndex];
                        return JSON.stringify(period.summary, null, 2);
                    },
                },
            },
        },
        onHover: (event, elements) => {
            if (elements.length > 0) {
                const index = elements[0].index;
                setHoveredPeriod(data.periods[index].period);
            } else {
                setHoveredPeriod(null);
            }
        },
    };

    const handleRowClick = (period) => {
        setSelectedPeriod(period);
        setOpenModal(true);
        onPeriodClick(period.period, period.summary);
    };

    const handleExport = () => {
        if (!data) return;
        const csv = toCSV(data.periods, data.total);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'finance_stats.csv';
        a.click();
    };

    const renderKPI = (label, value, color) => (
        <Paper sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="h6" color={color}>{value}</Typography>
            <Typography>{label}</Typography>
        </Paper>
    );

    if (loading) {
        return <Skeleton variant="rectangular" height={500} />;
    }

    if (error) {
        return (
            <Alert severity="error">
                {error} <Button onClick={fetchData}>Retry</Button>
            </Alert>
        );
    }

    const total = data?.total || {};

    return (
        <Box>
            {/* Filters */}
            <Paper sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Year</InputLabel>
                            <Select value={year} onChange={e => setYear(e.target.value)}>
                                {years.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                            <InputLabel>Month</InputLabel>
                            <Select value={month || ''} onChange={e => setMonth(e.target.value || null)}>
                                <MenuItem value="">None</MenuItem>
                                {months.map(m => <MenuItem key={m} value={m}>{m}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth disabled={!month}>
                            <InputLabel>Day</InputLabel>
                            <Select value={day || ''} onChange={e => setDay(e.target.value || null)}>
                                <MenuItem value="">None</MenuItem>
                                {days.map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                            </Select>
                        </FormControl>
                    </Grid>
                    <Grid item xs={12} md={3}>
                        <Button variant="contained" onClick={handleApply}>Apply</Button>
                        <Button onClick={handleReset}>Reset</Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* KPIs */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6} md={3}>{renderKPI('In', total.in, 'green')}</Grid>
                <Grid item xs={6} md={3}>{renderKPI('Gross Out', total.grossOut, 'blue')}</Grid>
                <Grid item xs={6} md={3}>{renderKPI('Net Out', total.netOut, total.netOut < 0 ? 'red' : 'blue')}</Grid>
                <Grid item xs={6} md={3}>{renderKPI('Refund Rate', `${total.refundRatePercent}%`, 'gray')}</Grid>
            </Grid>

            {/* Main Area */}
            <Grid container spacing={2} direction={isMobile ? 'column' : 'row'}>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6">Chart</Typography>
                        <FormControl>
                            <Select value={chartType} onChange={e => setChartType(e.target.value)}>
                                <MenuItem value="stacked">Stacked</MenuItem>
                                <MenuItem value="separate">Separate</MenuItem>
                            </Select>
                        </FormControl>
                        {chartData && <Bar ref={chartRef} data={chartData} options={chartOptions} />}
                    </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                        <Typography variant="h6">Periods</Typography>
                        <TableContainer>
                            <Table aria-label="finance table">
                                <TableHead>
                                    <TableRow>
                                        <TableCell>
                                            <TableSortLabel active={sortBy === 'period'} direction={sortDir} onClick={() => handleSort('period')}>
                                                Period
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell align="right">
                                            <TableSortLabel active={sortBy === 'in'} direction={sortDir} onClick={() => handleSort('in')}>
                                                In
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell align="right">
                                            <TableSortLabel active={sortBy === 'grossOut'} direction={sortDir} onClick={() => handleSort('grossOut')}>
                                                Gross Out
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell align="right">
                                            <TableSortLabel active={sortBy === 'netOut'} direction={sortDir} onClick={() => handleSort('netOut')}>
                                                Net Out
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell align="right">Pay Me</TableCell>
                                        <TableCell align="right">Click</TableCell>
                                        <TableCell align="right">Paynet</TableCell>
                                        <TableCell align="right">Cash</TableCell>
                                        <TableCell align="right">Bonus</TableCell>
                                        <TableCell align="right">
                                            <TableSortLabel active={sortBy === 'returned'} direction={sortDir} onClick={() => handleSort('returned')}>
                                                Returned
                                            </TableSortLabel>
                                        </TableCell>
                                        <TableCell align="right">
                                            <TableSortLabel active={sortBy === 'refundRatePercent'} direction={sortDir} onClick={() => handleSort('refundRatePercent')}>
                                                Refund (%)
                                            </TableSortLabel>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {sortedPeriods.map(p => (
                                        <TableRow
                                            key={p.period}
                                            onClick={() => handleRowClick(p)}
                                            onMouseEnter={() => setHoveredPeriod(p.period)}
                                            onMouseLeave={() => setHoveredPeriod(null)}
                                            sx={{ backgroundColor: hoveredPeriod === p.period ? theme.palette.action.hover : 'inherit', cursor: 'pointer' }}
                                        >
                                            <TableCell>{formatPeriodLabel(p.period, viewMode)}</TableCell>
                                            <TableCell align="right">{p.summary.in}</TableCell>
                                            <TableCell align="right">{p.summary.grossOut}</TableCell>
                                            <TableCell align="right">{p.summary.netOut}</TableCell>
                                            <TableCell align="right">{p.summary.payMe}</TableCell>
                                            <TableCell align="right">{p.summary.click}</TableCell>
                                            <TableCell align="right">{p.summary.paynet}</TableCell>
                                            <TableCell align="right">{p.summary.cash}</TableCell>
                                            <TableCell align="right">{p.summary.bonus}</TableCell>
                                            <TableCell align="right">{p.summary.returned}</TableCell>
                                            <TableCell align="right">{p.summary.refundRatePercent}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                </Grid>
            </Grid>

            {/* Footer */}
            <Box sx={{ mt: 2 }}>
                <Button variant="outlined" onClick={handleExport}>Export CSV</Button>
            </Box>

            {/* Modal */}
            <Dialog open={openModal} onClose={() => setOpenModal(false)}>
                <DialogTitle>Period Detail: {selectedPeriod?.period}</DialogTitle>
                <DialogContent>
                    <pre>{JSON.stringify(selectedPeriod?.summary, null, 2)}</pre>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenModal(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default FinanceStats;