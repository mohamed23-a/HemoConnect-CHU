import React, { useState, useRef, useEffect } from "react";
import {
  BellIcon,
  CheckIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import useNotifications from "../../hooks/useNotifications";
import LoadingSpinner from "./LoadingSpinner";

const typeIcon = {
  demande_approved: "✅",
  demande_rejected: "❌",
  new_demande: "📋",
  emergency_demande: "🚨",
  low_stock_alert: "⚠️",
};

const NotificationBell = () => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { t } = useTranslation();
  const {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useNotifications();

  // Close when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-xl transition-colors"
        style={{ color: "var(--text-muted)" }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "var(--bg-hover)")
        }
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <BellIcon className="w-5 h-5" />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="pulse-badge absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute mt-2 w-96 rounded-2xl shadow-2xl z-50 border overflow-hidden"
            style={{
              background: "var(--bg-card)",
              borderColor: "var(--border)",
              boxShadow: "var(--shadow-lg)",
              right: 0,
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-3.5 border-b"
              style={{
                borderColor: "var(--border)",
                background: "var(--bg-muted)",
              }}
            >
              <div className="flex items-center gap-2">
                <h3
                  className="text-sm font-semibold"
                  style={{ color: "var(--text)" }}
                >
                  {t("notifications.title")}
                </h3>
                {unreadCount > 0 && (
                  <span className="text-[11px] bg-blue-500 text-white font-medium px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex gap-3">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-500 hover:text-blue-400 flex items-center gap-1 font-medium transition-colors"
                  >
                    <CheckIcon className="w-3.5 h-3.5" />
                    {t("notifications.mark_all")}
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAllNotifications}
                    className="text-xs text-red-500 hover:text-red-400 flex items-center gap-1 font-medium transition-colors"
                    title={t("notifications.clear_all")}
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="max-h-80 overflow-y-auto">
              {loading ? (
                <div className="py-10 flex justify-center">
                  <LoadingSpinner size="md" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-10 text-center">
                  <BellIcon
                    className="w-10 h-10 mx-auto mb-2"
                    style={{ color: "var(--text-faint)" }}
                  />
                  <p className="text-sm" style={{ color: "var(--text-faint)" }}>
                    {t("notifications.empty")}
                  </p>
                </div>
              ) : (
                notifications.map((n, i) => (
                  <div
                    key={n.id || i}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      if (!n.read) markAsRead(n.id);
                      setOpen(false);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        if (!n.read) markAsRead(n.id);
                        setOpen(false);
                      }
                    }}
                    className="flex items-start gap-3 px-5 py-3.5 border-b cursor-pointer transition-colors"
                    style={{
                      borderColor: "var(--border)",
                      background: !n.read
                        ? "rgba(59,130,246,0.06)"
                        : "transparent",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--bg-hover)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = !n.read
                        ? "rgba(59,130,246,0.06)"
                        : "transparent")
                    }
                  >
                    <span className="text-xl mt-0.5">
                      {typeIcon[n.action] || "🔔"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p
                        className="text-sm leading-snug"
                        style={{ color: "var(--text)" }}
                      >
                        {n.description}
                      </p>
                      <p
                        className="text-xs mt-1"
                        style={{ color: "var(--text-faint)" }}
                      >
                        {new Date(n.created_at).toLocaleString("ar-MA", {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </div>
                    <div className="flex flex-col items-end justify-between h-full gap-2 relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNotification(n.id);
                        }}
                        className="text-gray-400 hover:text-red-500 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        title={t("notifications.clear")}
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                      {!n.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div
              className="px-5 py-3 border-t"
              style={{
                borderColor: "var(--border)",
                background: "var(--bg-muted)",
              }}
            >
              <button
                onClick={() => setOpen(false)}
                className="w-full text-center text-xs text-blue-500 hover:text-blue-400 font-medium transition-colors"
              >
                {t("notifications.view_all")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
