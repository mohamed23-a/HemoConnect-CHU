import React from "react";
import PropTypes from "prop-types";
import {
  XCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

const Alert = ({ type = "info", message, onClose }) => {
  const types = {
    success: {
      bg: "bg-green-50",
      border: "border-green-400",
      text: "text-green-800",
      icon: CheckCircleIcon,
      iconColor: "text-green-400",
    },
    error: {
      bg: "bg-red-50",
      border: "border-red-400",
      text: "text-red-800",
      icon: XCircleIcon,
      iconColor: "text-red-400",
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-400",
      text: "text-yellow-800",
      icon: ExclamationTriangleIcon,
      iconColor: "text-yellow-400",
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-400",
      text: "text-blue-800",
      icon: InformationCircleIcon,
      iconColor: "text-blue-400",
    },
  };

  const current = types[type];
  const Icon = current.icon;

  return (
    <div
      className={`rounded-md ${current.bg} p-4 border ${current.border} mb-4`}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`h-5 w-5 ${current.iconColor}`} aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm font-medium ${current.text}`}>{message}</p>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className={`inline-flex rounded-md ${current.bg} p-1.5 ${current.text} hover:bg-opacity-75`}
            >
              <XCircleIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

Alert.propTypes = {
  type: PropTypes.oneOf(["success", "error", "warning", "info"]),
  message: PropTypes.string.isRequired,
  onClose: PropTypes.func,
};



export default Alert;
