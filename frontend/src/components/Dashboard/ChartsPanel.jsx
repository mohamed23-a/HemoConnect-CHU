import React from "react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import Card from "../Common/Card";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#f59e0b", "#10b981", "#ef4444", "#3b82f6"];

const ChartsPanel = ({ pieData, barData, barColor = "#3b82f6" }) => {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
      <Card title={t("stats.by_status")}>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={90}
              innerRadius={40}
              dataKey="value"
              label={({ name, percent }) =>
                `${name} ${(percent * 100).toFixed(0)}%`
              }
            >
              {pieData.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                color: "var(--text)",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      <Card title={t("stats.by_blood_type")}>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart
            data={barData || []}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="blood_type"
              tick={{ fontSize: 12, fill: "var(--text-muted)" }}
            />
            <YAxis tick={{ fontSize: 12, fill: "var(--text-muted)" }} />
            <Tooltip
              contentStyle={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                color: "var(--text)",
              }}
            />
            <Bar dataKey="count" fill={barColor} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
};

ChartsPanel.propTypes = {
  pieData: PropTypes.array.isRequired,
  barData: PropTypes.array,
  barColor: PropTypes.string,
};

export default ChartsPanel;
