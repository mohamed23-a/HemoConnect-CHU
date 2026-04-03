import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import demandeService from "../../services/demandeService";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import Card from "../../components/Common/Card";
import Button from "../../components/Common/Button";
import Modal from "../../components/Modals/Modal";
import toast from "react-hot-toast";
import {
  PlusCircleIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilSquareIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/outline";

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const DemandesList = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [demandes, setDemandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: "", blood_type: "" });
  const [selectedDemande, setSelectedDemande] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchDemandes();
  }, [filters]);

  const fetchDemandes = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.blood_type) params.blood_type = filters.blood_type;
      const response = await demandeService.getDemandes(params);
      setDemandes(response.data || []);
    } catch {
      toast.error(t("errors.load_failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (demande) => {
    if (
      !globalThis.confirm(
        `${t("demandes.confirm_approve")} ${demande.patient_name}?`,
      )
    )
      return;
    setProcessing(true);
    try {
      await demandeService.approveDemande(
        demande.id,
        t("demandes.approved_note"),
      );
      toast.success(t("demandes.approved_ok"));
      fetchDemandes();
    } catch (e) {
      toast.error(e.response?.data?.message || t("errors.generic"));
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error(t("demandes.reason_required"));
      return;
    }
    if (rejectReason.trim().length < 10) {
      toast.error(
        t("create.err_reason_min") ||
          "Rejection reason must be at least 10 characters",
      );
      return;
    }
    setProcessing(true);
    try {
      await demandeService.rejectDemande(selectedDemande.id, rejectReason);
      toast.success(t("demandes.rejected_ok"));
      setShowRejectModal(false);
      setRejectReason("");
      setSelectedDemande(null);
      fetchDemandes();
    } catch (e) {
      toast.error(e.response?.data?.message || t("errors.generic"));
    } finally {
      setProcessing(false);
    }
  };

  const handleCancel = async (demande) => {
    if (
      !globalThis.confirm(
        t("demandes.confirm_cancel") ||
          "Are you sure you want to cancel this request?",
      )
    )
      return;
    setProcessing(true);
    try {
      await demandeService.cancelDemande(demande.id);
      toast.success(
        t("demandes.cancelled_ok") || "Request cancelled successfully",
      );
      fetchDemandes();
    } catch (e) {
      toast.error(e.response?.data?.message || t("errors.generic"));
    } finally {
      setProcessing(false);
    }
  };

  const statusBadge = (status) => {
    const map = {
      pending: ["badge badge-yellow", t("status.pending")],
      approved: ["badge badge-blue", t("status.approved")],
      rejected: ["badge badge-red", t("status.rejected")],
      completed: ["badge badge-green", t("status.completed")],
    };
    const [cls, label] = map[status] || ["badge badge-gray", status];
    return <span className={cls}>{label}</span>;
  };

  const urgencyBadge = (urgency) => {
    const map = {
      normal: ["badge badge-green", t("urgency.normal")],
      urgent: ["badge badge-yellow", t("urgency.urgent")],
      emergency: ["badge badge-red", t("urgency.emergency")],
    };
    const [cls, label] = map[urgency] || ["badge badge-gray", urgency];
    return <span className={cls}>{label}</span>;
  };

  const canProcess =
    user?.role === "blood_center" ||
    (user?.role === "admin" && user?.is_super_admin !== false);
  const hasActions = true; // Always true because Hospitals now have Edit/Cancel actions, everyone has View

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h1 className="page-title">
          {user?.role === "hospital"
            ? t("demandes.my_requests")
            : t("demandes.all_requests")}
        </h1>
        {user?.role === "hospital" && (
          <Link to="/demandes/create">
            <Button variant="primary" icon={PlusCircleIcon}>
              {t("demandes.new_request")}
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card title={t("common.filter")}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="th-label">{t("demandes.status")}</label>
            <select
              className="th-input"
              value={filters.status}
              onChange={(e) =>
                setFilters({ ...filters, status: e.target.value })
              }
            >
              <option value="">{t("common.all")}</option>
              <option value="pending">{t("status.pending")}</option>
              <option value="approved">{t("status.approved")}</option>
              <option value="rejected">{t("status.rejected")}</option>
              <option value="completed">{t("status.completed")}</option>
            </select>
          </div>
          <div>
            <label className="th-label">{t("demandes.blood_type")}</label>
            <select
              className="th-input"
              value={filters.blood_type}
              onChange={(e) =>
                setFilters({ ...filters, blood_type: e.target.value })
              }
            >
              <option value="">{t("common.all")}</option>
              {BLOOD_TYPES.map((bt) => (
                <option key={bt} value={bt}>
                  {bt}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Table */}
      <Card>
        {loading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <div className="t-wrap">
            <table className="t-table">
              <thead className="t-head">
                <tr>
                  <th className="t-th">{t("demandes.patient")}</th>
                  <th className="t-th">{t("demandes.blood_type")}</th>
                  <th className="t-th">
                    {t("create.product_type") || "Product"}
                  </th>
                  <th className="t-th">{t("demandes.quantity")}</th>
                  <th className="t-th">{t("demandes.urgency")}</th>
                  <th className="t-th">{t("demandes.status")}</th>
                  {user?.role !== "hospital" && (
                    <th className="t-th">{t("demandes.hospital")}</th>
                  )}
                  <th className="t-th">{t("common.date")}</th>
                  {hasActions && (
                    <th className="t-th text-center">{t("common.actions")}</th>
                  )}
                </tr>
              </thead>
              <tbody className="t-body">
                {demandes.map((d) => (
                  <tr key={d.id}>
                    <td className="t-td font-medium">{d.patient_name}</td>
                    <td className="t-td">
                      <span className="badge badge-red">{d.blood_type}</span>
                    </td>
                    <td className="t-td">
                      <span className="badge badge-gray">
                        {t(`product.${d.product_type}`) || d.product_type}
                      </span>
                    </td>
                    <td className="t-td t-td-muted">
                      {d.quantity} {t("demandes.units")}
                    </td>
                    <td className="t-td">{urgencyBadge(d.urgency)}</td>
                    <td className="t-td">{statusBadge(d.status)}</td>
                    {user?.role !== "hospital" && (
                      <td className="t-td t-td-muted">
                        {d.hospital?.name || "-"}
                      </td>
                    )}
                    <td className="t-td t-td-muted">
                      {new Date(d.created_at).toLocaleDateString()}
                    </td>
                    {hasActions && (
                      <td className="t-td">
                        <div className="flex items-center gap-2">
                          <Link to={`/demandes/${d.id}`}>
                            <button
                              className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                              title={t("common.view")}
                            >
                              <EyeIcon className="w-4 h-4" />
                            </button>
                          </Link>
                          {canProcess && d.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleApprove(d)}
                                disabled={processing}
                                className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                                title={t("common.approve")}
                              >
                                <CheckCircleIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedDemande(d);
                                  setShowRejectModal(true);
                                }}
                                disabled={processing}
                                className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                title={t("common.reject")}
                              >
                                <XCircleIcon className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {user?.role === "hospital" &&
                            d.status === "pending" && (
                              <>
                                <Link to={`/demandes/edit/${d.id}`}>
                                  <button
                                    className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                                    title={t("common.edit")}
                                  >
                                    <PencilSquareIcon className="w-4 h-4" />
                                  </button>
                                </Link>
                                <button
                                  onClick={() => handleCancel(d)}
                                  disabled={processing}
                                  className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                  title={t("common.cancel")}
                                >
                                  <NoSymbolIcon className="w-4 h-4" />
                                </button>
                              </>
                            )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {demandes.length === 0 && (
                  <tr>
                    <td
                      colSpan="8"
                      className="t-td text-center py-10"
                      style={{ color: "var(--text-faint)" }}
                    >
                      {t("demandes.empty")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectReason("");
          setSelectedDemande(null);
        }}
        title={t("demandes.reject_title")}
      >
        <div className="space-y-4">
          <p style={{ color: "var(--text)" }}>
            {t("demandes.reject_confirm")}{" "}
            <strong>{selectedDemande?.patient_name}</strong> ?
          </p>
          <div>
            <label className="th-label">{t("demandes.reject_reason")}</label>
            <textarea
              className="th-input"
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder={t("demandes.reject_reason_placeholder")}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectModal(false);
                setRejectReason("");
                setSelectedDemande(null);
              }}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="danger"
              onClick={handleReject}
              loading={processing}
            >
              {t("demandes.confirm_reject")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DemandesList;
