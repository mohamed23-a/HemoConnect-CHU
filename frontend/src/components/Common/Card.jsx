import React from "react";
import { motion } from "framer-motion";

const Card = ({ title, children, className = "", action, noPad = false }) => (
  <motion.div
    initial="rest"
    whileHover={{ y: -3, boxShadow: "0 12px 32px rgba(0,0,0,0.12)" }}
    transition={{ duration: 0.25 }}
    className={`rounded-2xl border overflow-hidden transition-colors duration-250 ${className}`}
    style={{
      background: "var(--bg-card)",
      borderColor: "var(--border)",
      boxShadow: "var(--shadow-sm)",
    }}
  >
    {title && (
      <div
        className="flex items-center justify-between px-5 py-4 border-b"
        style={{ borderColor: "var(--border)" }}
      >
        <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>
          {title}
        </h3>
        {action && <div>{action}</div>}
      </div>
    )}
    <div className={noPad ? "" : "p-5"}>{children}</div>
  </motion.div>
);

export default Card;
