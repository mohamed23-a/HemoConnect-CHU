import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import dashboardService from "../../services/dashboardService";
import { StatCardSkeleton } from "../../components/Common/SkeletonLoader";
import Card from "../../components/Common/Card";
import Button from "../../components/Common/Button";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "../../animations/variants";
import {
  UserGroupIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
  ClockIcon,
  ArrowPathIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

/* ── Animated number counter ─────────────────────────────────────────────── */
const AnimatedCounter = ({ value, duration = 1000 }) => {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!value) {
      setDisplay(0);
      return;
    }
    const start = performance.now();
    const to = Number(value);
    const animate = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
      setDisplay(Math.round(to * eased));
      if (p < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return <span>{display.toLocaleString()}</span>;
};

/* ── Stat Card — fully CSS-variable themed ───────────────────────────────── */
const StatCard = ({ title, value, icon: Icon, gradient, trend }) => (
  <motion.div
    variants={staggerItem}
    whileHover={{ y: -4, boxShadow: "var(--shadow-lg)" }}
    transition={{ duration: 0.25 }}
    className="rounded-2xl border p-6 overflow-hidden relative"
    style={{
      background: "var(--bg-card)",
      borderColor: "var(--border)",
      boxShadow: "var(--shadow-sm)",
    }}
  >
    {/* Glow blob */}
    <div
      className={`absolute -top-6 -left-6 w-24 h-24 rounded-full opacity-10 ${gradient}`}
    />

    <div className="flex items-start justify-between">
      <div className="relative z-10">
        <p
          className="text-xs font-semibold uppercase tracking-wide mb-2"
          style={{ color: "var(--text-faint)" }}
        >
          {title}
        </p>
        <p
          className="text-3xl font-bold tabular-nums"
          style={{ color: "var(--text)" }}
        >
          <AnimatedCounter value={value} />
        </p>
        {trend && (
          <p className="mt-2 text-xs font-medium text-emerald-500 flex items-center gap-1">
            <CheckCircleIcon className="w-3.5 h-3.5" />
            {trend}
          </p>
        )}
      </div>
      <div className={`p-3 rounded-xl ${gradient} shadow-sm flex-shrink-0`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  </motion.div>
);

/* ── Tooltip shared style ────────────────────────────────────────────────── */
const tooltipStyle = {
  background: "var(--bg-card)",
  border: "1px solid var(--border)",
  borderRadius: "10px",
  color: "var(--text)",
  fontSize: "12px",
};

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

/* ── Main component ──────────────────────────────────────────────────────── */
const AdminDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      const r = await dashboardService.getStats();
      setStats(r.data);
      setError(null);
    } catch {
      setError(t("errors.load_failed"));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* Role labels translated */
  const roleLabel = (role) =>
    ({
      admin: t("auth.role_admin"),
      hospital: t("auth.role_hospital"),
      blood_center: t("auth.role_blood_center"),
    })[role] || role;

  /* Status labels translated */
  const statusLabel = (s) =>
    ({
      pending: t("status.pending"),
      approved: t("status.approved"),
      rejected: t("status.rejected"),
      completed: t("status.completed"),
    })[s] || s;

  /* Stock badge */
  const stockBadge = (status) => {
    const map = {
      available: "badge badge-green",
      low: "badge badge-yellow",
      empty: "badge badge-red",
    };
    const label = {
      available: `● ${t("stock.available")}`,
      low: `● ${t("stock.low")}`,
      empty: `● ${t("stock.empty")}`,
    };
    return (
      <span className={map[status] || "badge badge-gray"}>
        {label[status] || status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex justify-between items-center flex-wrap gap-3"
      >
        <div>
          <h1 className="page-title">{t("nav.dashboard")}</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            {t("common.welcome")}, {user?.name}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchStats(true)}
          loading={refreshing}
          icon={ArrowPathIcon}
        >
          {t("common.refresh")}
        </Button>
      </motion.div>

      {/* Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...new Array(4)].map((_, i) => (
            <StatCardSkeleton key={`admin-stat-${i}`} />
          ))}
        </div>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 rounded-2xl border"
          style={{
            background: "rgba(239,68,68,0.06)",
            borderColor: "rgba(239,68,68,0.2)",
          }}
        >
          <p className="text-red-500 mb-3">{error}</p>
          <Button onClick={() => fetchStats()} variant="outline" size="sm">
            {t("common.refresh")}
          </Button>
        </motion.div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5"
        >
          <StatCard
            title={t("users.title")
              .replace("Gestion des ", "")
              .replace(" Management", "")}
            value={stats?.users_count || 0}
            icon={UserGroupIcon}
            gradient="bg-blue-500"
          />
          <StatCard
            title={t("stats.total_requests")}
            value={stats?.demandes_count || 0}
            icon={ClipboardDocumentListIcon}
            gradient="bg-emerald-500"
          />
          <StatCard
            title={t("stats.pending")}
            value={stats?.pending_demandes || 0}
            icon={ClockIcon}
            gradient="bg-amber-400"
          />
          <StatCard
            title={t("stats.total_blood_units")}
            value={stats?.blood_stock_summary?.total_units || 0}
            icon={CubeIcon}
            gradient="bg-red-500"
          />
        </motion.div>
      )}

      {/* Charts */}
      {!loading && !error && (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-2 gap-5"
        >
          <motion.div variants={staggerItem}>
            <Card title={t("stats.by_role") || "Utilisateurs par rôle"}>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={Object.entries(stats?.users_by_role || {}).map(
                      ([role, count]) => ({
                        name: roleLabel(role),
                        value: count,
                      }),
                    )}
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    innerRadius={45}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    isAnimationActive
                    animationBegin={200}
                    animationDuration={800}
                  >
                    {Object.keys(stats?.users_by_role || {}).map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>

          <motion.div variants={staggerItem}>
            <Card title={t("stats.by_status")}>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={Object.entries(stats?.demandes_by_status || {}).map(
                    ([s, count]) => ({
                      status: statusLabel(s),
                      count,
                    }),
                  )}
                  layout="vertical"
                  margin={{ top: 5, right: 20, left: 60, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="var(--border)"
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                  />
                  <YAxis
                    type="category"
                    dataKey="status"
                    tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                  />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar
                    dataKey="count"
                    fill="#3b82f6"
                    radius={[0, 6, 6, 0]}
                    isAnimationActive
                    animationBegin={400}
                    animationDuration={600}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </motion.div>
        </motion.div>
      )}

      {/* Monthly transfusions line chart */}
      {!loading && !error && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Card title={t("stats.monthly_transfusions")}>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart
                data={stats?.transfusions_by_month || []}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend
                  wrapperStyle={{ color: "var(--text-muted)", fontSize: 12 }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  dot={{ fill: "#3b82f6", strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: "#2563eb" }}
                  name={t("stats.monthly_transfusions")}
                  isAnimationActive
                  animationDuration={1000}
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      )}

      {/* Blood stock table */}
      {!loading &&
        !error &&
        stats?.blood_stock_summary?.by_type?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <Card title={t("stock.title")} noPad>
              <div className="t-wrap">
                <table className="t-table">
                  <thead className="t-head">
                    <tr>
                      <th className="t-th">{t("stock.blood_type")}</th>
                      <th className="t-th">{t("stock.quantity")}</th>
                      <th className="t-th">{t("stock.status")}</th>
                    </tr>
                  </thead>
                  <motion.tbody
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="t-body"
                  >
                    {stats.blood_stock_summary.by_type.map((stock, idx) => (
                      <motion.tr key={idx} variants={staggerItem}>
                        <td className="t-td font-bold text-red-500">
                          {stock.blood_type}
                        </td>
                        <td className="t-td">
                          <span
                            className="font-semibold"
                            style={{ color: "var(--text)" }}
                          >
                            {stock.quantity}
                          </span>
                          <span
                            className="ml-1 text-xs"
                            style={{ color: "var(--text-faint)" }}
                          >
                            {t("stock.units")}
                          </span>
                        </td>
                        <td className="t-td">{stockBadge(stock.status)}</td>
                      </motion.tr>
                    ))}
                  </motion.tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}

      {/* Recent activities */}
      {!loading && !error && stats?.recent_activities?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          <Card title={t("dashboard.recent_activities") || "آخر النشاطات"}>
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-1"
            >
              {stats.recent_activities.slice(0, 10).map((a, idx) => (
                <motion.div
                  key={a.id || `activity-${idx}`}
                  variants={staggerItem}
                  className="flex items-start gap-3 py-3 border-b last:border-0"
                  style={{ borderColor: "var(--border)" }}
                >
                  <div className="w-2 h-2 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm" style={{ color: "var(--text)" }}>
                      {a.description}
                    </p>
                    <p
                      className="text-xs mt-0.5"
                      style={{ color: "var(--text-faint)" }}
                    >
                      {new Date(a.created_at).toLocaleString()}
                    </p>
                  </div>
                  <span
                    className="flex-shrink-0 text-xs px-2.5 py-1 rounded-lg font-medium"
                    style={{
                      background: "var(--bg-muted)",
                      color: "var(--text-muted)",
                    }}
                  >
                    {a.action}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default AdminDashboard;
