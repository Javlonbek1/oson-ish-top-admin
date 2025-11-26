// src/components/finance/FinanceStats.jsx

import React, {
    useState,
    useEffect,
    useMemo,
    useRef,
    useCallback,
} from 'react';
import {
    Box,
    Paper,
    Grid,
    Typography,
    TextField,
    MenuItem,
    Button,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tooltip as MuiTooltip,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    TableSortLabel,
    TablePagination,
    Alert,
    FormControlLabel,
    Checkbox,
    Switch,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import RefreshIcon from '@mui/icons-material/Refresh';
import DownloadIcon from '@mui/icons-material/Download';
import InfoIcon from '@mui/icons-material/Info';
import CloseIcon from '@mui/icons-material/Close';

import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell,
} from 'recharts';

import {
    mapPeriodicResponseToChartData,
    buildCsvFromFinanceData,
    getGranularity,
    getDefaultFilters,
} from './financeStatsUtils';

const COLORS = {
    in: '#1b5e20',
    inHighlight: '#2e7d32',
    grossOut: '#1565c0',
    grossOutHighlight: '#1976d2',
    netOut: '#c62828',
    netOutHighlight: '#e53935',
    returned: '#546e7a',
    returnedHighlight: '#455a64',
};

const MONTH_OPTIONS = [
    { value: '', label: 'All months' },
    { value: '1', label: 'Jan' },
    { value: '2', label: 'Feb' },
    { value: '3', label: 'Mar' },
    { value: '4', label: 'Apr' },
    { value: '5', label: 'May' },
    { value: '6', label: 'Jun' },
    { value: '7', label: 'Jul' },
    { value: '8', label: 'Aug' },
    { value: '9', label: 'Sep' },
    { value: '10', label: 'Oct' },
    { value: '11', label: 'Nov' },
    { value: '12', label: 'Dec' },
];

const DEFAULT_ROWS_PER_PAGE = 10;

const TABLE_COLUMNS = [
    { id: 'period', label: 'Period', numeric: false },
    { id: 'in', label: 'In', numeric: true },
    { id: 'grossOut', label: 'Gross Out', numeric: true },
    { id: 'netOut', label: 'Net Out', numeric: true },
    { id: 'payMe', label: 'Pay Me', numeric: true },
    { id: 'click', label: 'Click', numeric: true },
    { id: 'paynet', label: 'Paynet', numeric: true },
    { id: 'cash', label: 'Cash', numeric: true },
    { id: 'bonus', label: 'Bonus', numeric: true },
    { id: 'returned', label: 'Returned', numeric: true },
    { id: 'refundRatePercent', label: 'Refund Rate (%)', numeric: true },
];

// Format numbers for display
function formatNumber(value) {
    if (value == null || Number.isNaN(value)) return '-';
    return Number(value).toLocaleString(undefined, {
        maximumFractionDigits: 2,
    });
}

// Custom tooltip for Recharts
function ChartTooltip({ active, payload, label }) {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload || {};

    return (
        <Paper elevation={3} sx={{ p: 1.5 }}>
            <Typography variant="subtitle2" gutterBottom>
                Period: {label}
            </Typography>
            {Object.entries(data).map(([key, val]) => {
                if (key === 'period') return null;
                return (
                    <Typography key={key} variant="body2">
                        {key}: {formatNumber(val)}
                    </Typography>
                );
            })}
        </Paper>
    );
}

function FinanceStats({
    baseUrl = '/api/v1/finance',
    initialYear,
    initialMonth,
    initialDay,
    onPeriodClick,
    axiosInstance,
}) {
    const theme = useTheme();
    const isMdDown = useMediaQuery(theme.breakpoints.down('md'));

    const ax = axiosInstance || (typeof window !== "undefined" && window.axios);

    const defaultFiltersRef = useRef(
        getDefaultFilters(initialYear, initialMonth, initialDay)
    );

    const [filters, setFilters] = useState(defaultFiltersRef.current);
    const [appliedFilters, setAppliedFilters] = useState(
        defaultFiltersRef.current
    );
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const cacheRef = useRef(new Map());
    const [hoveredPeriod, setHoveredPeriod] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState(null);

    const [seriesVisibility, setSeriesVisibility] = useState({
        in: true,
        grossOut: true,
        netOut: true,
        returned: true,
    });
    const [stacked, setStacked] = useState(false);

    const [sortConfig, setSortConfig] = useState({
        field: null,
        direction: 'asc',
    });
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);

    const [modalOpen, setModalOpen] = useState(false);
    const [modalData, setModalData] = useState(null);

    const makeKeyFromFilters = (f) =>
        JSON.stringify({
            year: f.year || '',
            month: f.month || '',
            day: f.day || '',
        });

    const total = data ? data.total : null;
    const granularity = useMemo(
        () => getGranularity(appliedFilters),
        [appliedFilters]
    );

    const chartData = useMemo(
        () => (data ? mapPeriodicResponseToChartData(data) : []),
        [data]
    );

    const daysInSelectedMonth = useMemo(() => {
        const yearNum = parseInt(filters.year || '', 10);
        const monthNum = parseInt(filters.month || '', 10);

        if (!yearNum || !monthNum) return 31;
        // JS Date uses month index 0..11; using monthNum as "next month" and day 0 gives last day of that month
        return new Date(yearNum, monthNum, 0).getDate();
    }, [filters.year, filters.month]);

    const dayOptions = useMemo(
        () =>
            Array.from({ length: daysInSelectedMonth }, (_, i) => (i + 1).toString()),
        [daysInSelectedMonth]
    );

    const handleFilterChange = (field) => (event) => {
        const value = event.target.value;
        setFilters((prev) => {
            const updated = { ...prev, [field]: value };
            if (field === 'month' && !value) {
                updated.day = '';
            }
            if (field === 'year' && !value) {
                updated.month = '';
                updated.day = '';
            }
            return updated;
        });
    };

    const fetchPeriodic = useCallback(
        async (targetFilters, { useCache = true } = {}) => {
            if (!ax) return;

            const key = makeKeyFromFilters(targetFilters);
            setError(null);

            // Cache tekshirish
            if (useCache && cacheRef.current.has(key)) {
                setData(cacheRef.current.get(key));
                return;
            }

            setIsLoading(true);

            try {
                const params = new URLSearchParams();
                if (targetFilters.year) params.append("year", targetFilters.year);
                if (targetFilters.month) params.append("month", targetFilters.month);
                if (targetFilters.day) params.append("day", targetFilters.day);

                const trimmedBase = baseUrl.replace(/\/$/, "");
                const url = `${trimmedBase}/summary/periodic`;

                const res = await ax.get(url, {
                    params,
                    headers: {
                        Accept: "application/json",
                    },
                });

                if (res.status !== 200) {
                    throw new Error(`Failed: HTTP ${res.status}`);
                }

                const json = res.data;
                cacheRef.current.set(key, json); // Cache saqlash
                setData(json);
            } catch (err) {
                console.error(err);

                const msg =
                    err?.response?.data?.message ||
                    err?.message ||
                    "Failed to load finance data";

                setError(msg);
            } finally {
                setIsLoading(false);
            }
        },
        [baseUrl, ax]
    );

    const handleApplyFilters = () => {
        const cleaned = {
            year: filters.year,
            month: filters.month,
            day: filters.day,
        };
        setAppliedFilters(cleaned);
        setPage(0);
        fetchPeriodic(cleaned);
    };

    const handleResetFilters = () => {
        const reset = defaultFiltersRef.current;
        setFilters(reset);
        setAppliedFilters(reset);
        setPage(0);
        fetchPeriodic(reset, { useCache: true });
    };

    const handleRetry = () => {
        if (!appliedFilters) return;
        fetchPeriodic(appliedFilters, { useCache: false });
    };

    useEffect(() => {
        // initial load
        fetchPeriodic(defaultFiltersRef.current, { useCache: true });
    }, [fetchPeriodic]);

    const sortedPeriods = useMemo(() => {
        if (!data || !Array.isArray(data.periods)) return [];

        const items = data.periods.map((p, index) => ({ ...p, _index: index }));
        const { field, direction } = sortConfig;

        if (!field) return items;

        const sorted = [...items].sort((a, b) => {
            if (field === 'period') {
                if (a.period < b.period) return direction === 'asc' ? -1 : 1;
                if (a.period > b.period) return direction === 'asc' ? 1 : -1;
                return 0;
            }
            const valA =
                a.summary && typeof a.summary[field] === 'number'
                    ? a.summary[field]
                    : 0;
            const valB =
                b.summary && typeof b.summary[field] === 'number'
                    ? b.summary[field]
                    : 0;

            if (valA < valB) return direction === 'asc' ? -1 : 1;
            if (valA > valB) return direction === 'asc' ? 1 : -1;
            return 0;
        });

        return sorted;
    }, [data, sortConfig]);

    const paginatedPeriods = useMemo(() => {
        const start = page * rowsPerPage;
        return sortedPeriods.slice(start, start + rowsPerPage);
    }, [sortedPeriods, page, rowsPerPage]);

    const handleRequestSort = (field) => {
        setSortConfig((prev) => {
            if (prev.field === field) {
                return {
                    field,
                    direction: prev.direction === 'asc' ? 'desc' : 'asc',
                };
            }
            return {
                field,
                direction: field === 'period' ? 'asc' : 'desc',
            };
        });
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const toggleSeriesVisibility = (key) => () => {
        setSeriesVisibility((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const handleRowClick = (row) => {
        setModalData(row);
        setModalOpen(true);
        setSelectedPeriod(row.period);
        if (onPeriodClick) {
            onPeriodClick(row.period, row.summary);
        }
    };

    const handleRowKeyDown = (row) => (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleRowClick(row);
        }
    };

    const handleModalClose = () => {
        setModalOpen(false);
    };

    const handleDrillDownFromModal = () => {
        if (!modalData) return;
        const current = granularity;

        if (current === 'monthly') {
            // months: "jan", "feb", ...
            const monthStr = (modalData.period || '').toLowerCase().slice(0, 3);
            const monthIndex =
                ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'].indexOf(
                    monthStr
                ) + 1;

            if (monthIndex > 0) {
                const nextFilters = {
                    year: appliedFilters.year,
                    month: String(monthIndex),
                    day: '',
                };
                setFilters(nextFilters);
                setAppliedFilters(nextFilters);
                setModalOpen(false);
                fetchPeriodic(nextFilters);
            }
        } else if (current === 'daily') {
            const dayStr = modalData.period;
            const nextFilters = {
                year: appliedFilters.year,
                month: appliedFilters.month,
                day: dayStr,
            };
            setFilters(nextFilters);
            setAppliedFilters(nextFilters);
            setModalOpen(false);
            fetchPeriodic(nextFilters);
        }
        // if hourly, no further drill-down
    };

    const handleExportCsv = () => {
        if (!data) return;
        const csv = buildCsvFromFinanceData(data.periods, data.total);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const suffix = getGranularity(appliedFilters);
        a.href = url;
        a.download = `finance-stats-${suffix}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const isDayDisabled = !filters.month;

    const showSkeleton = isLoading && !data;

    return (
        <Box>
            <Box
                sx={{
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                }}
            >
                <Typography variant="h5" component="h2">
                    Finance Statistics
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <MuiTooltip title="Export current view as CSV">
                        <span>
                            <IconButton
                                aria-label="Export CSV"
                                size="small"
                                onClick={handleExportCsv}
                                disabled={!data}
                            >
                                <DownloadIcon fontSize="small" />
                            </IconButton>
                        </span>
                    </MuiTooltip>
                    <MuiTooltip title="Reset filters">
                        <IconButton
                            aria-label="Reset filters"
                            size="small"
                            onClick={handleResetFilters}
                        >
                            <RefreshIcon fontSize="small" />
                        </IconButton>
                    </MuiTooltip>
                </Box>
            </Box>

            {/* Filters panel */}
            <Paper
                sx={{
                    p: 2,
                    mb: 2,
                }}
                component="section"
                aria-label="Finance filters"
            >
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={4} md={3}>
                        <TextField
                            label="Year"
                            type="number"
                            fullWidth
                            size="small"
                            value={filters.year}
                            onChange={handleFilterChange('year')}
                            inputProps={{ min: 2000, max: 2100 }}
                        />
                    </Grid>
                    <Grid item xs={12} sm={4} md={3}>
                        <TextField
                            label="Month"
                            select
                            fullWidth
                            size="small"
                            value={filters.month}
                            onChange={handleFilterChange('month')}
                        >
                            {MONTH_OPTIONS.map((option) => (
                                <MenuItem key={option.value || 'all'} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid item xs={12} sm={4} md={3}>
                        <TextField
                            label="Day"
                            select
                            fullWidth
                            size="small"
                            value={filters.day}
                            onChange={handleFilterChange('day')}
                            disabled={isDayDisabled}
                            helperText={isDayDisabled ? 'Select month first' : ''}
                        >
                            <MenuItem value="">All days</MenuItem>
                            {dayOptions.map((d) => (
                                <MenuItem key={d} value={d}>
                                    {d}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Grid>
                    <Grid
                        item
                        xs={12}
                        sm={12}
                        md={3}
                        sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}
                    >
                        <Button
                            variant="outlined"
                            onClick={handleResetFilters}
                            sx={{ mr: 1 }}
                        >
                            Reset
                        </Button>
                        <Button variant="contained" onClick={handleApplyFilters}>
                            Apply
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {error && (
                <Alert
                    severity="error"
                    sx={{ mb: 2 }}
                    action={
                        <Button color="inherit" size="small" onClick={handleRetry}>
                            Retry
                        </Button>
                    }
                >
                    {error}
                </Alert>
            )}

            {/* KPI cards */}
            {showSkeleton ? (
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    {[0, 1, 2, 3].map((i) => (
                        <Grid item xs={12} sm={6} md={3} key={i}>
                            <Paper sx={{ p: 2 }}>
                                <Skeleton variant="text" width="60%" />
                                <Skeleton variant="text" width="40%" />
                            </Paper>
                        </Grid>
                    ))}
                </Grid>
            ) : (
                <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="subtitle2">In</Typography>
                            <Typography
                                variant="h6"
                                sx={{ color: COLORS.in, fontWeight: 600 }}
                            >
                                {total ? formatNumber(total.in) : '-'}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="subtitle2">Gross Out</Typography>
                            <Typography
                                variant="h6"
                                sx={{ color: COLORS.grossOut, fontWeight: 600 }}
                            >
                                {total ? formatNumber(total.grossOut) : '-'}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper sx={{ p: 2 }}>
                            <Typography variant="subtitle2">Net Out</Typography>
                            <Typography
                                variant="h6"
                                sx={{ color: COLORS.netOut, fontWeight: 600 }}
                            >
                                {total ? formatNumber(total.netOut) : '-'}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Paper sx={{ p: 2 }}>
                            <Box display="flex" alignItems="center" gap={1}>
                                <Typography variant="subtitle2">Refund Rate</Typography>
                                <MuiTooltip title="Refund rate percent">
                                    <InfoIcon fontSize="small" />
                                </MuiTooltip>
                            </Box>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                                {total
                                    ? `${formatNumber(total.refundRatePercent)}%`
                                    : '-'}
                            </Typography>
                        </Paper>
                    </Grid>
                </Grid>
            )}

            {/* Main content: chart + table */}
            <Grid container spacing={2}>
                <Grid item xs={12} md={7}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                        {showSkeleton ? (
                            <Skeleton variant="rectangular" height={300} />
                        ) : (
                            <>
                                <Box
                                    sx={{
                                        mb: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        flexWrap: 'wrap',
                                        gap: 1,
                                    }}
                                >
                                    <Typography variant="subtitle1">
                                        {granularity === 'monthly' && 'Monthly breakdown'}
                                        {granularity === 'daily' && 'Daily breakdown'}
                                        {granularity === 'hourly' && 'Hourly breakdown'}
                                    </Typography>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                            flexWrap: 'wrap',
                                        }}
                                    >
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    size="small"
                                                    checked={seriesVisibility.in}
                                                    onChange={toggleSeriesVisibility('in')}
                                                />
                                            }
                                            label="In"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    size="small"
                                                    checked={seriesVisibility.grossOut}
                                                    onChange={toggleSeriesVisibility('grossOut')}
                                                />
                                            }
                                            label="Gross Out"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    size="small"
                                                    checked={seriesVisibility.netOut}
                                                    onChange={toggleSeriesVisibility('netOut')}
                                                />
                                            }
                                            label="Net Out"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Checkbox
                                                    size="small"
                                                    checked={seriesVisibility.returned}
                                                    onChange={toggleSeriesVisibility('returned')}
                                                />
                                            }
                                            label="Returned"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    size="small"
                                                    checked={stacked}
                                                    onChange={(e) => setStacked(e.target.checked)}
                                                />
                                            }
                                            label="Stacked"
                                        />
                                    </Box>
                                </Box>
                                <Box
                                    role="img"
                                    aria-label={`Finance chart showing ${granularity} summary`}
                                    sx={{ width: '100%', height: isMdDown ? 260 : 320 }}
                                >
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                            data={chartData}
                                            margin={{ top: 16, right: 16, left: 0, bottom: 8 }}
                                            onMouseMove={(state) => {
                                                if (state && state.activeLabel) {
                                                    setHoveredPeriod(state.activeLabel);
                                                } else {
                                                    setHoveredPeriod(null);
                                                }
                                            }}
                                            onMouseLeave={() => setHoveredPeriod(null)}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="period" />
                                            <YAxis />
                                            <Tooltip content={<ChartTooltip />} />
                                            <Legend />
                                            {seriesVisibility.in && (
                                                <Bar
                                                    dataKey="in"
                                                    name="In"
                                                    stackId={stacked ? 'finance' : undefined}
                                                >
                                                    {chartData.map((entry, index) => (
                                                        <Cell
                                                            key={`in-${index}`}
                                                            fill={
                                                                entry.period === hoveredPeriod ||
                                                                    entry.period === selectedPeriod
                                                                    ? COLORS.inHighlight
                                                                    : COLORS.in
                                                            }
                                                        />
                                                    ))}
                                                </Bar>
                                            )}
                                            {seriesVisibility.grossOut && (
                                                <Bar
                                                    dataKey="grossOut"
                                                    name="Gross Out"
                                                    stackId={stacked ? 'finance' : undefined}
                                                >
                                                    {chartData.map((entry, index) => (
                                                        <Cell
                                                            key={`gross-${index}`}
                                                            fill={
                                                                entry.period === hoveredPeriod ||
                                                                    entry.period === selectedPeriod
                                                                    ? COLORS.grossOutHighlight
                                                                    : COLORS.grossOut
                                                            }
                                                        />
                                                    ))}
                                                </Bar>
                                            )}
                                            {seriesVisibility.netOut && (
                                                <Bar
                                                    dataKey="netOut"
                                                    name="Net Out"
                                                    stackId={stacked ? 'finance' : undefined}
                                                >
                                                    {chartData.map((entry, index) => (
                                                        <Cell
                                                            key={`net-${index}`}
                                                            fill={
                                                                entry.period === hoveredPeriod ||
                                                                    entry.period === selectedPeriod
                                                                    ? COLORS.netOutHighlight
                                                                    : COLORS.netOut
                                                            }
                                                        />
                                                    ))}
                                                </Bar>
                                            )}
                                            {seriesVisibility.returned && (
                                                <Bar
                                                    dataKey="returned"
                                                    name="Returned"
                                                    stackId={stacked ? 'finance' : undefined}
                                                >
                                                    {chartData.map((entry, index) => (
                                                        <Cell
                                                            key={`returned-${index}`}
                                                            fill={
                                                                entry.period === hoveredPeriod ||
                                                                    entry.period === selectedPeriod
                                                                    ? COLORS.returnedHighlight
                                                                    : COLORS.returned
                                                            }
                                                        />
                                                    ))}
                                                </Bar>
                                            )}
                                        </BarChart>
                                    </ResponsiveContainer>
                                </Box>
                            </>
                        )}
                    </Paper>
                </Grid>

                <Grid item xs={12} md={5}>
                    <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
                        {showSkeleton ? (
                            <Skeleton variant="rectangular" height={320} />
                        ) : (
                            <>
                                <Typography
                                    variant="subtitle1"
                                    sx={{ mb: 1 }}
                                    id="finance-periods-table-label"
                                >
                                    Period breakdown
                                </Typography>
                                <Box
                                    sx={{ flexGrow: 1, overflowX: 'auto' }}
                                    aria-label="Finance period table wrapper"
                                >
                                    <Table
                                        size="small"
                                        aria-labelledby="finance-periods-table-label"
                                        stickyHeader
                                    >
                                        <TableHead>
                                            <TableRow>
                                                {TABLE_COLUMNS.map((col) => (
                                                    <TableCell
                                                        key={col.id}
                                                        sortDirection={
                                                            sortConfig.field === col.id
                                                                ? sortConfig.direction
                                                                : false
                                                        }
                                                        align={col.numeric ? 'right' : 'left'}
                                                    >
                                                        <TableSortLabel
                                                            active={sortConfig.field === col.id}
                                                            direction={
                                                                sortConfig.field === col.id
                                                                    ? sortConfig.direction
                                                                    : 'asc'
                                                            }
                                                            onClick={() => handleRequestSort(col.id)}
                                                        >
                                                            {col.label}
                                                        </TableSortLabel>
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {paginatedPeriods.map((row) => {
                                                const isActive =
                                                    row.period === hoveredPeriod ||
                                                    row.period === selectedPeriod;
                                                return (
                                                    <TableRow
                                                        key={row.period}
                                                        hover
                                                        selected={isActive}
                                                        onMouseEnter={() => setHoveredPeriod(row.period)}
                                                        onMouseLeave={() => setHoveredPeriod(null)}
                                                        onClick={() => handleRowClick(row)}
                                                        role="button"
                                                        tabIndex={0}
                                                        onKeyDown={handleRowKeyDown(row)}
                                                    >
                                                        <TableCell>{row.period}</TableCell>
                                                        <TableCell align="right">
                                                            {formatNumber(row.summary?.in)}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            {formatNumber(row.summary?.grossOut)}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            {formatNumber(row.summary?.netOut)}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            {formatNumber(row.summary?.payMe)}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            {formatNumber(row.summary?.click)}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            {formatNumber(row.summary?.paynet)}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            {formatNumber(row.summary?.cash)}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            {formatNumber(row.summary?.bonus)}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            {formatNumber(row.summary?.returned)}
                                                        </TableCell>
                                                        <TableCell align="right">
                                                            {formatNumber(row.summary?.refundRatePercent)}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                            {!paginatedPeriods.length && (
                                                <TableRow>
                                                    <TableCell colSpan={TABLE_COLUMNS.length} align="center">
                                                        No data for selected filters
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </Box>
                                <TablePagination
                                    component="div"
                                    rowsPerPageOptions={[5, 10, 20, 50]}
                                    count={sortedPeriods.length}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    onPageChange={handleChangePage}
                                    onRowsPerPageChange={handleChangeRowsPerPage}
                                />
                            </>
                        )}
                    </Paper>
                </Grid>
            </Grid>

            {/* Total footer card */}
            <Box sx={{ mt: 2 }}>
                <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                    <Typography variant="subtitle1">Total (backend)</Typography>
                    <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                        <Typography variant="body2">
                            In: <strong>{total ? formatNumber(total.in) : '-'}</strong>
                        </Typography>
                        <Typography variant="body2">
                            Gross Out:{' '}
                            <strong>{total ? formatNumber(total.grossOut) : '-'}</strong>
                        </Typography>
                        <Typography variant="body2">
                            Net Out:{' '}
                            <strong>{total ? formatNumber(total.netOut) : '-'}</strong>
                        </Typography>
                        <Typography variant="body2">
                            Returned:{' '}
                            <strong>{total ? formatNumber(total.returned) : '-'}</strong>
                        </Typography>
                    </Box>
                </Paper>
            </Box>

            {/* Detail modal */}
            <Dialog
                open={modalOpen}
                onClose={handleModalClose}
                fullWidth
                maxWidth="sm"
                aria-labelledby="finance-period-detail-title"
            >
                <DialogTitle id="finance-period-detail-title">
                    Period details{modalData ? `: ${modalData.period}` : ''}
                    <IconButton
                        aria-label="close"
                        onClick={handleModalClose}
                        sx={{
                            position: 'absolute',
                            right: 8,
                            top: 8,
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {modalData && (
                        <>
                            <Typography variant="subtitle2" gutterBottom>
                                Summary JSON
                            </Typography>
                            <Box
                                component="pre"
                                sx={{
                                    p: 1,
                                    bgcolor: theme.palette.action.hover,
                                    borderRadius: 1,
                                    fontSize: 12,
                                    overflowX: 'auto',
                                }}
                            >
                                {JSON.stringify(modalData.summary, null, 2)}
                            </Box>
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Quick links
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    {(granularity === 'monthly' || granularity === 'daily') && (
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            onClick={handleDrillDownFromModal}
                                        >
                                            Drill down into this period
                                        </Button>
                                    )}
                                    <Button
                                        variant="text"
                                        size="small"
                                        onClick={handleResetFilters}
                                    >
                                        Back to default view
                                    </Button>
                                </Box>
                            </Box>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleModalClose}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}

export default FinanceStats;
