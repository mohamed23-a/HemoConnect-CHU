import React, { forwardRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

const AnimatedInput = forwardRef(
  (
    {
      label,
      error,
      hint,
      type = "text",
      className = "",
      icon: Icon,
      required,
      ...props
    },
    ref,
  ) => {
    return (
      <div className="space-y-1.5">
        {label && (
          <label className="block text-sm font-medium text-slate-700">
            {label}
            {required && <span className="text-red-500 mr-1">*</span>}
          </label>
        )}
        <div className="relative">
          {Icon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={`
            input-animated
            w-full rounded-lg border text-sm text-slate-800 bg-white
            ${Icon ? "pr-9" : "pr-3"} pl-3 py-2.5
            ${
              error
                ? "border-red-400 focus:border-red-500 focus:ring-red-200 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]"
                : "border-slate-200 hover:border-slate-300"
            }
            placeholder:text-slate-400
            transition-all duration-200
            outline-none
            ${className}
          `}
            {...props}
          />
          {error && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-red-400">
              <ExclamationCircleIcon className="w-4 h-4" />
            </div>
          )}
        </div>

        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -6, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -6, height: 0 }}
              transition={{ duration: 0.2 }}
              className="text-xs text-red-500 flex items-center gap-1"
            >
              {error}
            </motion.p>
          )}
          {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
        </AnimatePresence>
      </div>
    );
  },
);

AnimatedInput.displayName = "AnimatedInput";

// Animated Select
export const AnimatedSelect = forwardRef(
  ({ label, error, children, required, className = "", ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-medium text-slate-700">
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}
      <select
        ref={ref}
        className={`
        input-animated
        w-full rounded-lg border border-slate-200 hover:border-slate-300
        text-sm text-slate-800 bg-white
        px-3 py-2.5 outline-none
        ${error ? "border-red-400" : ""}
        ${className}
      `}
        {...props}
      >
        {children}
      </select>
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="text-xs text-red-500"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  ),
);

AnimatedSelect.displayName = "AnimatedSelect";

export default AnimatedInput;
