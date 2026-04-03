import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import Navbar from "./Navbar";
import { DesktopSidebar, MobileSidebar } from "./Sidebar";
import AboutModal from "../Modals/AboutModal";
import { motion } from "framer-motion";

const Layout = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const { i18n } = useTranslation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  const isRTL = i18n.language === "ar";

  if (!isAuthenticated) return <>{children}</>;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "var(--bg)" }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <Navbar
        onMobileMenuToggle={() => setMobileOpen((o) => !o)}
        onLogoClick={() => setShowAbout(true)}
      />

      {/* flex-row-reverse when RTL so sidebar appears on the right */}
      <div
        className={`flex flex-1 overflow-hidden ${isRTL ? "flex-row-reverse" : "flex-row"}`}
      >
        {/* Desktop sidebar */}
        <div className="sidebar-desktop">
          <DesktopSidebar
            collapsed={collapsed}
            onToggle={() => setCollapsed((c) => !c)}
            onLogoClick={() => setShowAbout(true)}
          />
        </div>

        {/* Mobile drawer */}
        <MobileSidebar
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          onLogoClick={() => setShowAbout(true)}
        />

        {/* Main content */}
        <motion.main
          className="main-content flex-1 overflow-auto p-4 sm:p-6"
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
        >
          <div className="max-w-7xl mx-auto w-full">{children}</div>
        </motion.main>
      </div>
      <AboutModal isOpen={showAbout} onClose={() => setShowAbout(false)} />
    </div>
  );
};

export default Layout;
