import React from "react";
import PropTypes from "prop-types";
import { motion } from "framer-motion";
import { TableRowSkeleton } from "./SkeletonLoader";
import { staggerContainer, staggerItem } from "../../animations/variants";
import { InboxIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";

const Table = ({
  columns,
  data,
  onRowClick,
  loading = false,
  skeletonRows = 5,
}) => {
  const { t } = useTranslation();
  if (loading) {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((col, i) => (
                <th
                  key={col.key || `header-${i}`}
                  className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {Array.from({ length: skeletonRows }).map((_, i) => (
              <TableRowSkeleton key={`table-skeleton-${i}`} cols={columns.length} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="py-16 text-center"
      >
        <InboxIcon className="w-10 h-10 text-slate-200 mx-auto mb-3" />
        <p className="text-slate-400 text-sm">
          {t("common.no_data") || "لا توجد بيانات لعرضها"}
        </p>
      </motion.div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((col, i) => (
              <th
                key={col.key || `header-main-${i}`}
                className="px-6 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <motion.tbody
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="divide-y divide-slate-50 bg-white"
        >
          {data.map((row, rowIndex) => (
            <motion.tr
              key={row.id || `row-${rowIndex}`}
              variants={staggerItem}
              onClick={() => onRowClick?.(row)}
              whileHover={
                onRowClick ? { backgroundColor: "#f8fafc" } : undefined
              }
              className={`transition-colors ${onRowClick ? "cursor-pointer" : ""}`}
            >
              {columns.map((col, colIndex) => (
                <td
                  key={col.key || `cell-${rowIndex}-${colIndex}`}
                  className="px-6 py-4 text-sm text-slate-700 whitespace-nowrap"
                >
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </motion.tr>
          ))}
        </motion.tbody>
      </table>
    </div>
  );
};

Table.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({
    header: PropTypes.string.isRequired,
    key: PropTypes.string,
    render: PropTypes.func
  })).isRequired,
  data: PropTypes.array.isRequired,
  onRowClick: PropTypes.func,
  loading: PropTypes.bool,
  skeletonRows: PropTypes.number,
};

export default Table;
