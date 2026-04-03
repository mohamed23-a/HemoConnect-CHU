import React from "react";
import Modal from "./Modal";
import { useTranslation } from "react-i18next";
import {
  CheckCircleIcon,
  HeartIcon,
  ShieldCheckIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";

const AboutModal = ({ isOpen, onClose }) => {
  const { t } = useTranslation();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t("about.title")} size="lg">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 mx-auto bg-white rounded-2xl p-2 shadow-sm border dark:bg-gray-800 dark:border-gray-700">
            <img
              src="/logo.png"
              alt="HemoConnect CHU Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <h2 className="text-xl font-bold bg-gradient-to-r from-red-600 to-red-400 bg-clip-text text-transparent">
            HemoConnect CHU
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("about.subtitle")}
          </p>
        </div>

        {/* Why Project Section */}
        <div className="space-y-2">
          <h3 className="font-bold flex items-center gap-2 text-gray-800 dark:text-gray-100">
            <HeartIcon className="w-5 h-5 text-red-500" />
            {t("about.why_title")}
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed bg-red-50 dark:bg-red-900/10 p-3.5 rounded-xl border border-red-100 dark:border-red-900/30 text-justify">
            {t("about.why_desc")}
          </p>
        </div>

        {/* Features Section */}
        <div className="space-y-3">
          <h3 className="font-bold flex items-center gap-2 text-gray-800 dark:text-gray-100">
            <ShieldCheckIcon className="w-5 h-5 text-blue-500" />
            {t("about.features_title")}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              {
                icon: BoltIcon,
                color: "text-amber-500",
                text: t("about.feat_1"),
              },
              {
                icon: ShieldCheckIcon,
                color: "text-emerald-500",
                text: t("about.feat_2"),
              },
              {
                icon: CheckCircleIcon,
                color: "text-blue-500",
                text: t("about.feat_3"),
              },
              {
                icon: HeartIcon,
                color: "text-red-500",
                text: t("about.feat_4"),
              },
            ].map((f, i) => (
              <div
                key={`feature-${i}`}
                className="flex items-start gap-2.5 p-3 rounded-xl border bg-gray-50 lg:bg-white dark:bg-gray-800/50 dark:border-gray-700"
              >
                <f.icon className={`w-5 h-5 flex-shrink-0 ${f.color}`} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {f.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t dark:border-gray-700 flex justify-center">
          <p
            className="text-xs text-gray-400 font-medium whitespace-pre-wrap text-center"
            dir="ltr"
          >
            © {new Date().getFullYear()} HemoConnect CHU. {t("about.footer")}
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default AboutModal;
