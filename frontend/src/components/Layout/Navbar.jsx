import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";
import NotificationBell from "../Common/NotificationBell";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRightOnRectangleIcon,
  KeyIcon,
  ChevronDownIcon,
  SunIcon,
  MoonIcon,
  Bars3Icon,
  GlobeAltIcon,
} from "@heroicons/react/24/outline";

const LANGS = [
  { code: "fr", label: "Français", flag: "🇫🇷", dir: "ltr" },
  { code: "ar", label: "العربية", flag: "🇸🇦", dir: "rtl" },
  { code: "en", label: "English", flag: "🇬🇧", dir: "ltr" },
];

/* Reusable click-outside hook */
function useClickOutside(handler) {
  const ref = useRef(null);
  useEffect(() => {
    const listener = (e) => {
      if (ref.current && !ref.current.contains(e.target)) handler();
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [handler]);
  return ref;
}

/* Dropdown panel */
const DropdownPanel = ({ children, style = {} }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95, y: -6 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95, y: -6 }}
    transition={{ duration: 0.15, ease: "easeOut" }}
    className="absolute mt-1.5 rounded-xl border overflow-hidden z-50 shadow-2xl"
    style={{
      background: "var(--bg-card)",
      borderColor: "var(--border)",
      boxShadow: "var(--shadow-lg)",
      minWidth: "180px",
      ...style,
    }}
  >
    {children}
  </motion.div>
);

const Navbar = ({ onMobileMenuToggle, onLogoClick }) => {
  const { user, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const { t, i18n } = useTranslation();

  const [langOpen, setLangOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const langRef = useClickOutside(() => setLangOpen(false));
  const userRef = useClickOutside(() => setUserOpen(false));

  const isRTL = i18n.language === "ar";

  const switchLang = (code, dir) => {
    i18n.changeLanguage(code);
    document.documentElement.dir = dir;
    document.documentElement.lang = code;
    setLangOpen(false);
  };

  const roleColors = {
    admin: { bg: "#ede9fe", color: "#6d28d9" },
    hospital: { bg: "#d1fae5", color: "#065f46" },
    blood_center: { bg: "#fee2e2", color: "#991b1b" },
  };
  const roleStyle = roleColors[user?.role] || {
    bg: "var(--bg-muted)",
    color: "var(--text-muted)",
  };

  const roleLabel =
    {
      admin: t("auth.role_admin"),
      hospital: t("auth.role_hospital"),
      blood_center: t("auth.role_blood_center"),
    }[user?.role] || user?.role;

  return (
    <nav
      className="sticky top-0 z-40 border-b"
      style={{ background: "var(--bg-navbar)", borderColor: "var(--border)" }}
    >
      <div className="px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">
          {/* Left: hamburger + logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={onMobileMenuToggle}
              className="md:hidden p-2 rounded-lg transition-colors"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--bg-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <Bars3Icon className="w-5 h-5" />
            </button>

            <div
              className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
              role="button"
              tabIndex={0}
              onClick={onLogoClick}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onLogoClick(); }}
              title="À propos / About HemoConnect CHU"
            >
              <img
                src="/logo.png"
                alt="HemoConnect"
                className="w-7 h-7 object-contain drop-shadow-sm rounded-md"
              />
              <span className="text-sm font-bold gradient-text hidden sm:block">
                HemoConnect CHU
              </span>
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-1">
            {/* Language switcher */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => {
                  setLangOpen((o) => !o);
                  setUserOpen(false);
                }}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{ color: "var(--text-muted)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--bg-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                <GlobeAltIcon className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {LANGS.find((l) => l.code === i18n.language)?.flag || "🌐"}{" "}
                  {(i18n.language || "fr").toUpperCase()}
                </span>
              </button>
              <AnimatePresence>
                {langOpen && (
                  <DropdownPanel style={{ [isRTL ? "right" : "left"]: 0 }}>
                    {LANGS.map(({ code, label, flag, dir }) => (
                      <button
                        key={code}
                        onClick={() => switchLang(code, dir)}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition-colors text-left"
                        style={{
                          color:
                            i18n.language === code ? "#3b82f6" : "var(--text)",
                          fontWeight: i18n.language === code ? 600 : 400,
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = "var(--bg-hover)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        <span className="text-base">{flag}</span>
                        {label}
                      </button>
                    ))}
                  </DropdownPanel>
                )}
              </AnimatePresence>
            </div>

            {/* Theme toggle */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={toggle}
              className="p-2 rounded-xl transition-colors"
              style={{ color: "var(--text-muted)" }}
              title={isDark ? t("theme.light") : t("theme.dark")}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "var(--bg-hover)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <motion.div
                animate={{ rotate: isDark ? 180 : 0 }}
                transition={{ duration: 0.35 }}
              >
                {isDark ? (
                  <SunIcon className="w-5 h-5 text-amber-400" />
                ) : (
                  <MoonIcon className="w-5 h-5" />
                )}
              </motion.div>
            </motion.button>

            <NotificationBell />

            <div
              className="w-px h-6 mx-1"
              style={{ background: "var(--border)" }}
            />

            {/* User menu */}
            <div className="relative" ref={userRef}>
              <button
                onClick={() => {
                  setUserOpen((o) => !o);
                  setLangOpen(false);
                }}
                className="flex items-center gap-2 rounded-xl px-2 py-1.5 transition-colors"
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--bg-hover)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                {/* Avatar */}
                <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                {/* Info */}
                <div className="hidden sm:block text-right">
                  <div
                    className="text-xs font-semibold leading-tight"
                    style={{ color: "var(--text)" }}
                  >
                    {user?.name}
                  </div>
                  <div
                    className="text-[10px] px-1.5 py-0.5 rounded-full mt-0.5 inline-block font-medium"
                    style={{ background: roleStyle.bg, color: roleStyle.color }}
                  >
                    {roleLabel}
                  </div>
                </div>
                <ChevronDownIcon
                  className="w-3.5 h-3.5 hidden sm:block"
                  style={{ color: "var(--text-faint)" }}
                />
              </button>

              <AnimatePresence>
                {userOpen && (
                  <DropdownPanel
                    style={{ [isRTL ? "left" : "right"]: 0, minWidth: "210px" }}
                  >
                    {/* Header */}
                    <div
                      className="px-4 py-3 border-b"
                      style={{
                        borderColor: "var(--border)",
                        background: "var(--bg-muted)",
                      }}
                    >
                      <p
                        className="text-sm font-semibold"
                        style={{ color: "var(--text)" }}
                      >
                        {user?.name}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: "var(--text-faint)" }}
                      >
                        {user?.email}
                      </p>
                    </div>

                    {/* Items */}
                    <div className="py-1">
                      <button
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm transition-colors"
                        style={{ color: "var(--text)" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "var(--bg-hover)";
                          e.currentTarget.style.color = "var(--text)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <KeyIcon
                          className="w-4 h-4"
                          style={{ color: "var(--text-faint)" }}
                        />
                        {t("user.change_password")}
                      </button>

                      <div
                        className="my-1 border-t"
                        style={{ borderColor: "var(--border)" }}
                      />

                      <button
                        onClick={() => {
                          setUserOpen(false);
                          logout();
                        }}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-500 transition-colors"
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            "rgba(239,68,68,0.08)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4" />
                        {t("user.logout")}
                      </button>
                    </div>
                  </DropdownPanel>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
