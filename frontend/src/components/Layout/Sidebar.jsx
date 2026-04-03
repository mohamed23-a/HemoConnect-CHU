import React from "react";
import PropTypes from "prop-types";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  HomeIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
  UserGroupIcon,
  ClockIcon,
  ChartBarIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

const buildMenu = (t) => ({
  admin: [
    { path: "/dashboard", label: t("nav.dashboard"), icon: HomeIcon },
    {
      path: "/demandes",
      label: t("nav.requests"),
      icon: ClipboardDocumentListIcon,
    },
    { path: "/stock", label: t("nav.stock"), icon: CubeIcon },
    { path: "/users", label: t("nav.users"), icon: UserGroupIcon },
    { path: "/historique", label: t("nav.history"), icon: ClockIcon },
    { path: "/statistiques", label: t("nav.statistics"), icon: ChartBarIcon },
  ],
  blood_center: [
    { path: "/dashboard", label: t("nav.dashboard"), icon: HomeIcon },
    {
      path: "/demandes",
      label: t("nav.requests"),
      icon: ClipboardDocumentListIcon,
    },
    { path: "/stock", label: t("nav.stock"), icon: CubeIcon },
    { path: "/historique", label: t("nav.history"), icon: ClockIcon },
  ],
  hospital: [
    { path: "/dashboard", label: t("nav.dashboard"), icon: HomeIcon },
    {
      path: "/demandes",
      label: t("nav.requests"),
      icon: ClipboardDocumentListIcon,
    },
    { path: "/historique", label: t("nav.history"), icon: ClockIcon },
  ],
});

// Desktop sidebar (collapsible)
export const DesktopSidebar = ({ collapsed, onToggle, onLogoClick }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const items = buildMenu(t)[user?.role] || buildMenu(t).hospital;

  return (
    <motion.aside
      animate={{ width: collapsed ? 64 : 232 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative hidden md:flex flex-col flex-shrink-0 border-r min-h-screen"
      style={{ background: "var(--bg-sidebar)", borderColor: "var(--border)" }}
    >
      {/* Toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-5 z-10 w-6 h-6 rounded-full border flex items-center justify-center shadow-sm transition-colors hover:shadow"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border)",
          color: "var(--text-faint)",
        }}
      >
        <motion.span
          animate={{ rotate: collapsed ? 0 : 180 }}
          transition={{ duration: 0.3 }}
          className="text-xs"
        >
          ›
        </motion.span>
      </button>

      {/* Brand */}
      <div
        className="px-3 py-4 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.div
              key="exp"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              role="button"
              tabIndex={0}
              onClick={onLogoClick}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onLogoClick(); }}
            >
              <Logo />
              <span
                className="text-xs font-bold whitespace-nowrap"
                style={{ color: "var(--text)" }}
              >
                HemoConnect CHU
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="col"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center cursor-pointer hover:opacity-80 transition-opacity"
              role="button"
              tabIndex={0}
              onClick={onLogoClick}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onLogoClick(); }}
            >
              <Logo />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-hidden">
        {items.map((item) => (
          <SidebarLink key={item.path} item={item} collapsed={collapsed} />
        ))}
      </nav>
    </motion.aside>
  );
};

// Mobile drawer sidebar
export const MobileSidebar = ({ open, onClose, onLogoClick }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const items = buildMenu(t)[user?.role] || buildMenu(t).hospital;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="sidebar-overlay md:hidden"
            role="button"
            tabIndex={0}
            onClick={onClose}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClose();
              }
            }}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-full w-64 z-40 border-l flex flex-col md:hidden"
            style={{
              background: "var(--bg-sidebar)",
              borderColor: "var(--border)",
            }}
          >
            <div
              className="flex items-center justify-between px-4 py-4 border-b"
              style={{ borderColor: "var(--border)" }}
            >
              <div
                className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                role="button"
                tabIndex={0}
                onClick={onLogoClick}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onLogoClick(); }}
              >
                <Logo />
                <span
                  className="text-sm font-bold"
                  style={{ color: "var(--text)" }}
                >
                  HemoConnect CHU
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: "var(--text-faint)" }}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 px-2 py-3 space-y-0.5">
              {items.map((item) => (
                <SidebarLink
                  key={item.path}
                  item={item}
                  collapsed={false}
                  onNavigate={onClose}
                />
              ))}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Shared nav link
const SidebarLink = ({ item, collapsed, onNavigate }) => (
  <NavLink
    to={item.path}
    onClick={onNavigate}
    title={collapsed ? item.label : undefined}
    className={({ isActive }) =>
      `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden
      ${isActive ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : "hover:bg-slate-50 dark:hover:bg-slate-700/50"}`
    }
    style={({ isActive }) => ({
      color: isActive ? undefined : "var(--text-muted)",
    })}
  >
    {({ isActive }) => (
      <>
        {isActive && (
          <motion.div
            layoutId="sidebarActive"
            className="absolute inset-0 rounded-xl bg-blue-50 dark:bg-blue-900/30"
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}
        <item.icon className="w-5 h-5 flex-shrink-0 relative z-10" />
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 whitespace-nowrap overflow-hidden"
            >
              {item.label}
            </motion.span>
          )}
        </AnimatePresence>
        {isActive && (
          <motion.div
            layoutId="sidebarLine"
            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full"
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
          />
        )}
      </>
    )}
  </NavLink>
);

const Logo = () => (
  <img
    src="/logo.png"
    alt="HemoConnect CHU"
    className="w-7 h-7 object-contain drop-shadow-sm rounded-md"
  />
);

// Default export for backwards compat (desktop only)
const Sidebar = ({ collapsed, onToggle }) => (
  <DesktopSidebar collapsed={collapsed} onToggle={onToggle} />
);
Sidebar.propTypes = {
  collapsed: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

DesktopSidebar.propTypes = {
  collapsed: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
  onLogoClick: PropTypes.func,
};

MobileSidebar.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onLogoClick: PropTypes.func,
};

SidebarLink.propTypes = {
  item: PropTypes.object.isRequired,
  collapsed: PropTypes.bool.isRequired,
  onNavigate: PropTypes.func,
};



export default Sidebar;
