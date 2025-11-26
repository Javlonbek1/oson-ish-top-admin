// src/components/finance/financeStatsUtils.js

// Map backend PeriodicFinancialResponse to chart-friendly data
export function mapPeriodicResponseToChartData(response) {
    if (!response || !Array.isArray(response.periods)) {
        return [];
    }

    return response.periods.map((p) => ({
        period: p.period,
        ...(p.summary || {}),
    }));
}

// Granularity helper based on applied filters
export function getGranularity(filters) {
    const year = filters?.year;
    const month = filters?.month;
    const day = filters?.day;

    if (year && month && day) return 'hourly';
    if (year && month) return 'daily';
    if (year) return 'monthly';
    return 'monthly';
}

// CSV export builder for current view
export function buildCsvFromFinanceData(periods, total) {
    const headers = [
        'period',
        'in',
        'grossOut',
        'netOut',
        'payMe',
        'click',
        'paynet',
        'cash',
        'bonus',
        'returned',
        'refundRatePercent',
    ];

    const escape = (value) => {
        if (value == null) return '';
        const str = String(value);
        if (str.includes('"') || str.includes(',') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const lines = [];
    lines.push(headers.join(','));

    (periods || []).forEach((p) => {
        const s = p.summary || {};
        lines.push(
            [
                escape(p.period),
                escape(s.in),
                escape(s.grossOut),
                escape(s.netOut),
                escape(s.payMe),
                escape(s.click),
                escape(s.paynet),
                escape(s.cash),
                escape(s.bonus),
                escape(s.returned),
                escape(s.refundRatePercent),
            ].join(',')
        );
    });

    if (total) {
        const t = total;
        lines.push(
            [
                escape('TOTAL'),
                escape(t.in),
                escape(t.grossOut),
                escape(t.netOut),
                escape(t.payMe),
                escape(t.click),
                escape(t.paynet),
                escape(t.cash),
                escape(t.bonus),
                escape(t.returned),
                escape(t.refundRatePercent),
            ].join(',')
        );
    }

    return lines.join('\n');
}

// Default filters helper (used by component)
export function getDefaultFilters(initialYear, initialMonth, initialDay) {
    const now = new Date();
    return {
        year: (initialYear ?? now.getFullYear()).toString(),
        month: initialMonth ? String(initialMonth) : '',
        day: initialDay ? String(initialDay) : '',
    };
}

/**
 * ---- Mock data for dev/testing (exactly from the spec) ----
 */

export const MOCK_SINGLE_SUMMARY = {
    in: 430,
    grossOut: 6367,
    netOut: -5937,
    payMe: 120,
    click: 200,
    paynet: 100,
    cash: 10,
    bonus: 7372,
    returned: 2323,
    refundRatePercent: 36.5,
};

export const MOCK_PERIODIC_SUMMARY = {
    periods: [
        {
            period: 'jan',
            summary: {
                in: 100,
                grossOut: 50,
                netOut: 50,
                payMe: 10,
                click: 20,
                paynet: 10,
                cash: 60,
                bonus: 0,
                returned: 0,
                refundRatePercent: 0,
            },
        },
        {
            period: 'feb',
            summary: {
                in: 200,
                grossOut: 150,
                netOut: 50,
                payMe: 40,
                click: 60,
                paynet: 20,
                cash: 80,
                bonus: 0,
                returned: 100,
                refundRatePercent: 66.6,
            },
        },
        {
            period: 'mar',
            summary: {
                in: 130,
                grossOut: 80,
                netOut: 50,
                payMe: 70,
                click: 20,
                paynet: 10,
                cash: 30,
                bonus: 0,
                returned: 30,
                refundRatePercent: 37.5,
            },
        },
    ],
    total: {
        in: 430,
        grossOut: 280,
        netOut: 150,
        payMe: 120,
        click: 200,
        paynet: 40,
        cash: 170,
        bonus: 0,
        returned: 130,
        refundRatePercent: 46.4,
    },
};
