// src/components/StatsLineChart.jsx
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useQuery, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { RefreshCcw, Download, AlertTriangle } from "lucide-react";

/**
 * StatsLineChart.jsx
 *
 * Props:
 *  - axiosInstance: optional. If provided, used for requests (recommended; should have auth interceptor).
 *  - endpoint: optional. Default: "admin/users/stats/all" (relative to axiosInstance.baseURL or fallback baseURL).
 *
 * Usage:
 *  <StatsLineChart axiosInstance={axiosInstance} endpoint="admin/users/stats/all" />
 *
 * Notes:
 *  - Component wraps itself in QueryClientProvider.
 *  - Expects API shapes:
 *     - year only -> [{ month_index, label, count, deleted }, ...] (12 items)
 *     - year+month -> [{ day, count, deleted }, ...] (28/30/31 items)
 *     - year+month+day -> [{ hour: "00:00", count, deleted }, ...] (24 items)
 */

const QUERY_CLIENT = new QueryClient();
const MONTH_LABELS = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"];
const FALLBACK_BASE = "https://api.osonishtop.uz/api/v1";

function resolveTokenFallback() {
  try {
    if (typeof window !== "undefined") {
      const t1 = window.localStorage.getItem("admin_token");
      if (t1) return t1;
      const t2 = window.localStorage.getItem("token");
      if (t2) return t2;
    }
  } catch (_) { }
  try {
    if (typeof import.meta !== "undefined" && import.meta?.env?.VITE_ADMIN_TOKEN)
      return import.meta.env.VITE_ADMIN_TOKEN;
  } catch (_) { }
  return null;
}

function mapApiToSeries(items = []) {
  if (!Array.isArray(items) || items.length === 0) return [];
  const sample = items[0];
  if (sample?.month_index !== undefined || sample?.month !== undefined)
    return items.map((m) => ({
      name: m.label || MONTH_LABELS[(m.month_index || m.month) - 1] || String(m.month_index || m.month),
      count: Number(m.count) || 0,
      deleted: Number(m.deleted) || 0,
    }));

  if (sample?.day !== undefined)
    return items.map((d) => ({ name: String(d.day), count: Number(d.count) || 0, deleted: Number(d.deleted) || 0 }));

  if (sample?.hour !== undefined)
    return items.map((h) => ({ name: String(h.hour), count: Number(h.count) || 0, deleted: Number(h.deleted) || 0 }));
  // fallback
  return items.map((i) => ({ name: i.label || i.name || "-", count: Number(i.count) || 0, deleted: Number(i.deleted) || 0 }));
}

function fmtNumber(n) {
  try { return new Intl.NumberFormat("uz-UZ").format(Number(n || 0)); } catch { return String(n); }
}

function Inner({ endpoint = "admin/users/stats/all", axiosInstance }) {
  useEffect(() => {
    // document.body.classList.add("dashboard-dark");
    return () => document.body.classList.remove("dashboard-dark");
  }, []);

  // prepare axios client: prefer props axiosInstance (so token/interceptor preserved)
  const [client] = useState(() => {
    if (axiosInstance) return axiosInstance;
    const inst = axios.create({ baseURL: FALLBACK_BASE, timeout: 30000 });
    const token = resolveTokenFallback();
    if (token) inst.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    inst.defaults.headers.common["Accept"] = "application/json";
    return inst;
  });

  // Filters
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");

  const qKey = ["stats-line", endpoint, year, month || null, day || null];

  const { data: apiRaw = [], isLoading, error, refetch } = useQuery({
    queryKey: qKey,
    enabled: !!client && !!year,
    queryFn: async () => {
      const params = { year };
      if (month) params.month = month;
      if (day) params.day = day;
      const res = await client.get(endpoint, { params });
      // API returns array: monthly/daily/hourly — or wraps in { data: [...] }
      const raw = res?.data?.data ?? res?.data ?? res;
      return Array.isArray(raw) ? raw : [];
    },
    keepPreviousData: true,
  });

  const chartData = useMemo(() => mapApiToSeries(apiRaw), [apiRaw]);

  return (
    <div className="rounded-2xl bg-white/[.04] p-3 border border-white/10 backdrop-blur-xl shadow-[0_6px_30px_rgba(0,0,0,0.25)] overflow-hidden">
      {/* header + filters */}
      <div className="flex items-center justify-between mb-4 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Grafik (line) — yil/oy/kun</h3>
          <div className="text-sm text-white/70">Yil majburiy — oy va kun ixtiyoriy</div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(Number(e.target.value) || new Date().getFullYear())}
            className="w-24 px-2 py-1 rounded bg-white/5 text-white"
            aria-label="year"
            title="Yil (majburiy)"
          />
          <select value={month} onChange={(e) => setMonth(e.target.value)} className="px-2 py-1 rounded bg-white/5 text-white">
            <option value="">— Oy —</option>
            {MONTH_LABELS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <input
            type="number"
            min={1}
            max={31}
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="w-20 px-2 py-1 rounded bg-white/5 text-white"
            placeholder="Kun"
          />

          <button onClick={() => refetch()} className="px-3 py-2 rounded bg-white/10 text-white flex items-center gap-2">
            <RefreshCcw className="h-4 w-4" /> Yangilash
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-3">
          <div className="p-3 rounded bg-red-600/20 text-red-200 inline-flex items-center gap-2"><AlertTriangle /> {String(error?.message || error)}</div>
        </div>
      )}

      {/* chart */}
      <div className="rounded-2xl bg-white/[.04] p-3 border border-white/10 backdrop-blur-xl shadow-[0_6px_30px_rgba(0,0,0,0.25)] overflow-hidden">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white"><strong>Grafik</strong></div>
        </div>
        <div style={{ height: 360 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 8, right: 12, left: 8, bottom: 36 }}>
              <CartesianGrid strokeDasharray="4 4" stroke="#ffffff22" />
              <XAxis dataKey="name" tick={{ fill: "#e5e7eb" }} interval={0} />
              <YAxis tick={{ fill: "#e5e7eb" }} />
              <Tooltip formatter={(v) => fmtNumber(v)} contentStyle={{ background: "#0b1220", borderRadius: 6 }} />
              <Legend verticalAlign="top" wrapperStyle={{ color: "#e5e7eb" }} />
              <Line type="monotone" dataKey="count" name="Active" stroke="#60a5fa" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="deleted" name="Deleted" stroke="#ef4444" strokeWidth={3} dot={{ r: 3 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* totals */}
      <div className="mt-4 grid grid-cols-3 gap-3 ">
        <div className="rounded-2xl bg-white/[.04] p-3 border border-white/10 backdrop-blur-xl shadow-[0_6px_30px_rgba(0,0,0,0.25)] overflow-hidden ">
          <div className="text-sm text-white/70">Sum</div>
          <div className="text-xl font-semibold text-white">{fmtNumber(chartData.reduce((s, c) => s + (c.count || 0), 0))}</div>
        </div>
        <div className="rounded-2xl bg-white/[.04] p-3 border border-white/10 backdrop-blur-xl shadow-[0_6px_30px_rgba(0,0,0,0.25)] overflow-hidden">
          <div className="text-sm text-white/70">Deleted</div>
          <div className="text-xl font-semibold text-white">{fmtNumber(chartData.reduce((s, c) => s + (c.deleted || 0), 0))}</div>
        </div>
        <div className="rounded-2xl bg-white/[.04] p-3 border border-white/10 backdrop-blur-xl shadow-[0_6px_30px_rgba(0,0,0,0.25)] overflow-hidden">
          <div className="text-sm text-white/70">Items (server)</div>
          <div className="text-xl font-semibold text-white">{fmtNumber(Array.isArray(apiRaw) && (apiRaw.total || 0))}</div>
        </div>
      </div>
    </div>
  );
}

export default function StatsLineChart({ axiosInstance, endpoint }) {
  return (
    <QueryClientProvider client={QUERY_CLIENT}>
      <Inner axiosInstance={axiosInstance} endpoint={endpoint || "admin/users/stats/all"} />
    </QueryClientProvider>
  );
}
