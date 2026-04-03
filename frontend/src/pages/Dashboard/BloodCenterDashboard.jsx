import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import dashboardService from "../../services/dashboardService";
import stockService from "../../services/stockService";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import Card from "../../components/Common/Card";
import Button from "../../components/Common/Button";
import { motion } from "framer-motion";
import {
  CubeIcon,
  ClipboardDocumentListIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import ChartsPanel from "../../components/Dashboard/ChartsPanel";



const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <motion.div
    whileHover={{ y: -3 }}
    transition={{ duration: 0.2 }}
    className="rounded-2xl border p-5 flex items-center gap-4"
    style={{ background: "var(--bg-card)", borderColor: "var(--border)" }}
  >
    <div
      className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${colorClass}`}
    >
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        {title}
      </p>
      <p className="text-2xl font-bold mt-0.5" style={{ color: "var(--text)" }}>
        {value ?? 0}
      </p>
    </div>
  </motion.div>
);

const BloodCenterDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sR, stR] = await Promise.all([
        dashboardService.getStats(),
        stockService.getStock(),
      ]);
      setStats(sR.data);
      setStock(stR.data || []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const statusBadge = (s) => {
    const m = {
      pending: "badge badge-yellow",
      approved: "badge badge-blue",
      rejected: "badge badge-red",
      completed: "badge badge-green",
    };
    const l = {
      pending: t("status.pending"),
      approved: t("status.approved"),
      rejected: t("status.rejected"),
      completed: t("status.completed"),
    };
    return <span className={m[s] || "badge badge-gray"}>{l[s] || s}</span>;
  };

  const stockBadge = (item) => {
    if (item.quantity === 0)
      return <span className="badge badge-red">{t("stock.empty")}</span>;
    if (item.is_low)
      return <span className="badge badge-yellow">{t("stock.low")}</span>;
    return <span className="badge badge-green">{t("stock.available")}</span>;
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-72">
        <LoadingSpinner size="lg" />
      </div>
    );

  const pieData = [
    { name: t("status.pending"), value: stats?.pending_demandes || 0 },
    { name: t("status.approved"), value: stats?.approved_demandes || 0 },
    { name: t("status.rejected"), value: stats?.rejected_demandes || 0 },
    { name: t("status.completed"), value: stats?.completed_demandes || 0 },
  ].filter((d) => d.value > 0);

  const lowStock = stock.filter((i) => i.is_low || i.quantity === 0);

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center flex-wrap gap-3">
        <div>
          <h1 className="page-title">{t("nav.dashboard")}</h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            {t("common.welcome")}, {user?.name}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          icon={ArrowPathIcon}
        >
          {t("common.refresh")}
        </Button>
      </div>

      {/* Low stock alert */}
      {lowStock.length > 0 && (
        <div
          className="flex items-start gap-3 p-4 rounded-xl border"
          style={{
            background: "rgba(245,158,11,0.08)",
            borderColor: "rgba(245,158,11,0.3)",
            color: "#d97706",
          }}
        >
          <ExclamationTriangleIcon className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p className="text-sm font-medium">
            {lowStock.length}{" "}
            {lowStock.length === 1 ? "groupe sanguin" : "groupes sanguins"}{" "}
            {t("stock.low").toLowerCase()}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t("stats.total_blood_units")}
          value={stats?.total_blood_units}
          icon={CubeIcon}
          colorClass="bg-red-500"
        />
        <StatCard
          title={t("stats.pending")}
          value={stats?.pending_demandes}
          icon={ClockIcon}
          colorClass="bg-amber-500"
        />
        <StatCard
          title={t("stats.todays_requests")}
          value={stats?.today_transfusions}
          icon={CheckCircleIcon}
          colorClass="bg-emerald-500"
        />
        <StatCard
          title={t("stats.urgent_pending")}
          value={stats?.urgent_pending_demandes}
          icon={ExclamationTriangleIcon}
          colorClass="bg-purple-500"
        />
      </div>

      <ChartsPanel
        pieData={pieData}
        barData={stats?.demandes_by_blood_type}
        barColor="#ef4444"
      />

      {/* Blood stock */}
      <Card title={t("stock.title")}>
        <div className="t-wrap">
          <table className="t-table">
            <thead className="t-head">
              <tr>
                <th className="t-th">{t("stock.blood_type")}</th>
                <th className="t-th">{t("stock.quantity")}</th>
                <th className="t-th">{t("stock.minimum")}</th>
                <th className="t-th">{t("stock.status")}</th>
                <th className="t-th">{t("stock.last_update")}</th>
              </tr>
            </thead>
            <tbody className="t-body">
              {stock.map((item) => (
                <tr key={item.id}>
                  <td className="t-td font-semibold">{item.blood_type}</td>
                  <td className="t-td">
                    <span
                      className={`font-bold ${item.quantity === 0 ? "text-red-500" : item.is_low ? "text-amber-500" : "text-emerald-500"}`}
                    >
                      {item.quantity}
                    </span>
                  </td>
                  <td className="t-td t-td-muted">{item.minimum_threshold}</td>
                  <td className="t-td">{stockBadge(item)}</td>
                  <td className="t-td t-td-muted">
                    {item.last_updated
                      ? new Date(item.last_updated).toLocaleDateString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 text-center">
          <Link to="/stock">
            <Button variant="outline" size="sm">
              {t("stock.title")}
            </Button>
          </Link>
        </div>
      </Card>

      {/* Recent requests */}
      {stats?.recent_demandes && (
        <Card title={t("demandes.recent")}>
          <div className="t-wrap">
            <table className="t-table">
              <thead className="t-head">
                <tr>
                  <th className="t-th">{t("demandes.hospital")}</th>
                  <th className="t-th">{t("demandes.patient")}</th>
                  <th className="t-th">{t("demandes.blood_type")}</th>
                  <th className="t-th">{t("demandes.quantity")}</th>
                  <th className="t-th">{t("demandes.urgency")}</th>
                  <th className="t-th">{t("demandes.status")}</th>
                </tr>
              </thead>
              <tbody className="t-body">
                {stats.recent_demandes.map((d) => (
                  <tr key={d.id}>
                    <td className="t-td t-td-muted">
                      {d.hospital?.name || "—"}
                    </td>
                    <td className="t-td font-medium">{d.patient_name}</td>
                    <td className="t-td">
                      <span className="badge badge-red">{d.blood_type}</span>
                    </td>
                    <td className="t-td t-td-muted">{d.quantity}</td>
                    <td className="t-td">
                      <span
                        className={
                          {
                            emergency: "badge badge-red",
                            urgent: "badge badge-yellow",
                            normal: "badge badge-green",
                          }[d.urgency] || "badge badge-gray"
                        }
                      >
                        {d.urgency_label || d.urgency}
                      </span>
                    </td>
                    <td className="t-td">{statusBadge(d.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 text-center">
            <Link to="/demandes">
              <Button variant="outline" size="sm">
                {t("demandes.view_all")}
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
};

export default BloodCenterDashboard;
