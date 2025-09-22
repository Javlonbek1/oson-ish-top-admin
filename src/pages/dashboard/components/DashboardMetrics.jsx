import React, { useEffect, useMemo, useState } from "react";
import { useQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, RefreshCcw, AlertTriangle, CalendarDays, Sun, Moon, CalendarRange, BarChart3, PieChart, Users, Download } from "lucide-react";

/**
 * DashboardMetrics.jsx — Provider-safe version (axiosInstance + React Query)
 * - Automatically wraps itself in QueryClientProvider so you DON'T need to do it at app level
 * - Self-contained UI (Button, Card) — no external UI kit required
 * - Neon glass background scoped to this component
 * - axiosInstance prop expected (interceptors add token automatically). If missing, tries window.axios.
 *
 * Usage:
 *   import axiosInstance from "@/lib/axios";
 *   export default () => (
 *     <DashboardMetrics axiosInstance={axiosInstance} endpoint="/api/v1/admin/users/stats" />
 *   );
 */

// ---------- Helpers ----------
const fmt = new Intl.NumberFormat("uz-UZ");
const formatNumber = (n) => fmt.format(Number(n ?? 0));

export function percentChange(current, previous) {
    if (previous === 0 && current === 0) return { pct: 0, dir: "flat" };
    if (previous === 0) return { pct: 100, dir: current > 0 ? "up" : "flat" };
    const pct = ((current - previous) / Math.abs(previous)) * 100;
    return { pct: Math.abs(pct), dir: pct > 0 ? "up" : pct < 0 ? "down" : "flat" };
}

const MONTH_LABELS = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"];

export function normalizeMetrics(d = {}) {
    const months = Array.isArray(d.monthsYear) ? d.monthsYear : [];
    const monthsYear = Array.from({ length: 12 }).map((_, i) => {
        const m = months.find((x) => Number(x?.month) === i + 1) || {};
        const label = m?.label || MONTH_LABELS[i];
        const count = Number(m?.count) || 0;
        return { month: i + 1, label, count };
    });

    return {
        today: Number(d.today) || 0,
        yesterday: Number(d.yesterday) || 0,
        thisWeek: Number(d.thisWeek) || 0,
        lastWeek: Number(d.lastWeek) || 0,
        last7Days: Number(d.last7Days) || 0,
        thisMonth: Number(d.thisMonth) || 0,
        lastMonth: Number(d.lastMonth) || 0,
        total: Number(d.total) || 0,
        monthsYear,
    };
}

export function buildMonthlyChartData(metrics) {
    if (!metrics?.monthsYear) return [];
    return metrics.monthsYear.map((m) => ({ name: m.label, value: Number(m.count) || 0 }));
}

// ---------- Public default (ensures QueryClientProvider) ----------
export default function DashboardMetrics(props) {
    const [client] = useState(() => new QueryClient());
    return (
        <QueryClientProvider client={client}>
            <DashboardMetricsInner {...props} />
        </QueryClientProvider>
    );
}

// ---------- Inner component that actually uses useQuery ----------
function DashboardMetricsInner({ endpoint = "/api/v1/admin/users/stats", axiosInstance }) {
    // Body fonini faqat shu sahifada yoqish/ochish
    // useEffect(() => {
    //     document.body.classList.add("dashboard-dark");
    //     return () => document.body.classList.remove("dashboard-dark");
    // }, []);

    // axiosInstance dan olingan klient:
    const ax = axiosInstance || (typeof window !== "undefined" && window.axios);
    const [downloading, setDownloading] = useState(false);

    async function handleExportClick() {
        if (!ax) return;
        try {
            setDownloading(true);

            // MUHIM: baseURL odatda https://api.osonishtop.uz/api/v1
            // Shuning uchun yo‘lni faqat nisbiy qiling:
            const path = "admin/users/export.xlsx";

            const res = await ax.get(path, {
                responseType: "blob",
                headers: {
                    // Ba’zi backendlar xlsx uchun aniq Accept talab qiladi
                    Accept:
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/octet-stream",
                },
            });

            // 200 bo‘lmasa, blob ichidan matnni o‘qib, foydali xabar chiqaramiz
            if (res.status !== 200) {
                try {
                    const text = await res.data.text();
                    throw new Error(text || `Export failed: HTTP ${res.status}`);
                } catch {
                    throw new Error(`Export failed: HTTP ${res.status}`);
                }
            }

            // Fayl nomini Content-Disposition dan olishga urinamiz
            const disp =
                res.headers?.["content-disposition"] ||
                res.headers?.["Content-Disposition"];
            let filename = "users-export.xlsx";
            if (disp) {
                const m = /filename\\s*=\\s*\"?([^\";]+)\"?/i.exec(disp);
                if (m?.[1]) filename = decodeURIComponent(m[1]);
            }

            const blob = new Blob([res.data], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error(e);
            alert("Export yuklab olishda xatolik: " + (e?.message || "noma'lum"));
        } finally {
            setDownloading(false);
        }
    }


    const { data: metrics, isLoading: loading, error, refetch } = useQuery({
        queryKey: ["users-stats", endpoint],
        enabled: !!ax,
        keepPreviousData: true,
        queryFn: async () => {
            const res = await ax.get(endpoint);
            return normalizeMetrics(res?.data?.data || res?.data || {});
        },
    });

    const chartData = useMemo(() => buildMonthlyChartData(metrics), [metrics]);

    const deltas = useMemo(() => {
        const d = metrics;
        if (!d) return null;
        return {
            day: percentChange(d.today, d.yesterday),
            week: percentChange(d.thisWeek, d.lastWeek),
            month: percentChange(d.thisMonth, d.lastMonth),
        };
    }, [metrics]);

    // If axios instance missing, show gentle hint
    if (!axiosInstance && !(typeof window !== "undefined" && window.axios)) {
        return (
            <div className="relative min-h-screen overflow-hidden isolate">
                <NeonBackground />
                <div className="relative z-10 p-8">
                    <GlassCard>
                        <div className="p-5 text-white/80">
                            <div className="text-lg font-semibold mb-2">Axios instance topilmadi</div>
                            <div className="text-sm opacity-80">Komponentga <code>axiosInstance</code> prop sifatida sozlangan klientni bering (token interceptor bilan), yoki <code>window.axios</code> mavjud bo'lsin.</div>
                        </div>
                    </GlassCard>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen overflow-hidden isolate">
            <NeonBackground />

            <div className="relative z-10 space-y-6 p-4 sm:p-6 lg:p-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
                        <p className="text-sm text-white/70">Bugungi ko'rsatkichlar va o'sish dinamikasi</p>
                    </div>
                    <div className="flex gap-2">
                        <div className="flex items-center gap-2">
                            <Button
                                onClick={handleExportClick}
                                className={`gap-2 bg-white/10 backdrop-blur border-white/20 text-white hover:bg-white/20 ${downloading ? 'opacity-70 pointer-events-none' : ''}`}
                                title="Export.xlsx"
                            >
                                <Download className="h-4 w-4" /> {downloading ? 'Yuklanmoqda...' : 'Export Users'}
                            </Button>

                            <Button onClick={() => refetch()} className="gap-2 bg-white/10 backdrop-blur border-white/20 text-white hover:bg-white/20" title="Yangilash">
                                <RefreshCcw className="h-4 w-4" /> Yangilash
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <GlassCard>
                        <div className="p-4 text-sm text-red-200 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4" /> {String(error.message || error)}
                        </div>
                    </GlassCard>
                )}

                {/* Stat cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard title="Today" icon={<Sun className="h-4 w-4" />} value={metrics?.today} delta={deltas?.day} loading={loading} />
                    <StatCard title="This week" icon={<CalendarRange className="h-4 w-4" />} value={metrics?.thisWeek} delta={deltas?.week} loading={loading} />
                    <StatCard title="This month" icon={<CalendarDays className="h-4 w-4" />} value={metrics?.thisMonth} delta={deltas?.month} loading={loading} />
                    <StatCard title="Total" icon={<Users className="h-4 w-4" />} value={metrics?.total} loading={loading} />
                </div>

                {/* Chart */}
                <GlassCard>
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-white">
                                <BarChart3 className="h-5 w-5" />
                                <h2 className="text-lg font-semibold">Oylar bo'yicha taqqoslash</h2>
                            </div>
                        </div>
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#FFFFFF22" />
                                    <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#e5e7eb" }} axisLine={{ stroke: "#FFFFFF22" }} tickLine={{ stroke: "#FFFFFF22" }} />
                                    <YAxis tick={{ fontSize: 12, fill: "#e5e7eb" }} axisLine={{ stroke: "#FFFFFF22" }} tickLine={{ stroke: "#FFFFFF22" }} />
                                    <Tooltip contentStyle={{ background: "rgba(17,24,39,.9)", border: "1px solid #334155", borderRadius: 12, color: "#f8fafc" }} formatter={(val) => formatNumber(Number(val))} />
                                    <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="url(#barGradient)" />
                                    <defs>
                                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.95} />
                                            <stop offset="95%" stopColor="#22d3ee" stopOpacity={0.6} />
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </GlassCard>

                {/* Detailed grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <MiniStat title="Yesterday" icon={<Moon className="h-4 w-4" />} value={metrics?.yesterday} loading={loading} />
                    <MiniStat title="Last week" icon={<CalendarRange className="h-4 w-4" />} value={metrics?.lastWeek} loading={loading} />
                    <MiniStat title="Last 7 days" icon={<PieChart className="h-4 w-4" />} value={metrics?.last7Days} loading={loading} />
                    <MiniStat title="Last month" icon={<CalendarDays className="h-4 w-4" />} value={metrics?.lastMonth} loading={loading} />
                </div>
            </div>
        </div>
    );
}

// ---------- Subcomponents (self-contained UI) ----------
function StatCard({ title, value, delta, loading, icon }) {
    return (
        <GlassCard>
            <div className="p-5">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-white/70 inline-flex items-center gap-2">{icon}<span>{title}</span></span>
                    {delta && delta.dir !== "flat" && (
                        <span className={"inline-flex items-center gap-1 text-xs " + (delta.dir === "up" ? "text-emerald-400" : "text-rose-400")}>
                            {delta.dir === "up" ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                            {delta.pct.toFixed(1)}%
                        </span>
                    )}
                </div>
                {loading ? (
                    <Skeleton className="h-8 w-24" />
                ) : (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="text-2xl font-semibold text-white">
                        {formatNumber(value)}
                    </motion.div>
                )}
            </div>
        </GlassCard>
    );
}

function MiniStat({ title, value, loading, icon }) {
    return (
        <GlassCard>
            <div className="p-4">
                <div className="text-xs text-white/70 inline-flex items-center gap-2">{icon}<span>{title}</span></div>
                {loading ? <Skeleton className="h-6 w-20 mt-1" /> : <div className="text-lg font-semibold text-white">{formatNumber(value)}</div>}
            </div>
        </GlassCard>
    );
}

function GlassCard({ children }) {
    return (
        <div className="rounded-2xl bg-white/[.06] border border-white/20 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,.2)]">
            {children}
        </div>
    );
}

function Button({ className = "", children, ...rest }) {
    return (
        <button className={`px-3 py-2 rounded-lg border text-sm ${className}`} {...rest}>
            {children}
        </button>
    );
}

function Skeleton({ className = "" }) {
    return <div className={`animate-pulse rounded-xl bg-white/10 ${className}`} />;
}

function NeonBackground() {
    return (
        <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
            <div className="absolute inset-0 bg-gradient-to-br from-[#0b1220] via-[#0b1220] to-[#0a0f1d]" />
            <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.35),transparent_60%)] blur-2xl" />
            <div className="absolute top-20 -right-10 h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.35),transparent_60%)] blur-2xl" />
            <div className="absolute bottom-[-6rem] left-1/3 h-[26rem] w-[26rem] rounded-full bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.28),transparent_60%)] blur-2xl" />
            <div className="absolute inset-0 opacity-[0.06]" style={{
                backgroundImage: "repeating-linear-gradient(0deg, rgba(255,255,255,.4) 0, rgba(255,255,255,.4) 1px, transparent 1px, transparent 3px)",
            }} />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_60%,rgba(0,0,0,.55))]" />
        </div>
    );
}

/* =========================
   TEST CASES (Jest/Vitest in JS)
   ------------------------------
   Kept minimal and pure (no React rendering). Run only in test envs.
========================= */
if (typeof describe !== "undefined") {
    describe("percentChange", () => {
        it("up 100% from 5→10", () => {
            const r = percentChange(10, 5);
            expect(r.dir).toBe("up");
            expect(Math.round(r.pct)).toBe(100);
        });
        it("down 50% from 10→5", () => {
            const r = percentChange(5, 10);
            expect(r.dir).toBe("down");
            expect(Math.round(r.pct)).toBe(50);
        });
        it("flat when both zero", () => {
            const r = percentChange(0, 0);
            expect(r.dir).toBe(0 ? "flat" : "flat");
            expect(r.pct).toBe(0);
        });
        it("up when previous is 0 and current > 0", () => {
            const r = percentChange(10, 0);
            expect(r.dir).toBe("up");
            expect(r.pct).toBe(100);
        });
    });

    describe("normalizeMetrics", () => {
        it("coerces strings into numbers and fills defaults", () => {
            const n = normalizeMetrics({ today: "7", yesterday: "2", total: "9" });
            expect(n.today).toBe(7);
            expect(n.yesterday).toBe(2);
            expect(n.total).toBe(9);
            expect(n.thisWeek).toBe(0);
        });
        it("builds 12 months with labels and counts", () => {
            const n = normalizeMetrics({ monthsYear: [{ month: 8, label: "Avgust", count: "132" }, { month: 9, label: "Sentyabr", count: 825 }] });
            expect(n.monthsYear).toHaveLength(12);
            expect(n.monthsYear[7].label).toBe("Avgust");
            expect(n.monthsYear[7].count).toBe(132);
            expect(n.monthsYear[8].label).toBe("Sentyabr");
            expect(n.monthsYear[8].count).toBe(825);
        });
    });

    describe("buildMonthlyChartData", () => {
        it("maps monthsYear to recharts data", () => {
            const chart = buildMonthlyChartData({ monthsYear: [{ label: "Yanvar", count: 1 }, { label: "Fevral", count: 2 }] });
            expect(chart[0]).toEqual({ name: "Yanvar", value: 1 });
            expect(chart[1]).toEqual({ name: "Fevral", value: 2 });
        });
    });
}
