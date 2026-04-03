import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../context/AuthContext";
import demandeService from "../../services/demandeService";
import Card from "../../components/Common/Card";
import Button from "../../components/Common/Button";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

const DemandeDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const [demande, setDemande] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDemande();
  }, [id]);

  const fetchDemande = async () => {
    setLoading(true);
    try {
      const response = await demandeService.getDemande(id);
      setDemande(response.data); // As response.data is returned by axios inside service, the actual model is inside .data
    } catch (error) {
      toast.error(t("errors.load_failed"));
      navigate("/demandes");
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-72">
        <LoadingSpinner size="lg" />
      </div>
    );
  if (!demande) return null;

  const InfoRow = ({ label, value }) => (
    <div className="flex flex-col sm:flex-row sm:justify-between py-3 border-b border-gray-100 dark:border-gray-800 last:border-0 gap-1">
      <span className="text-sm font-medium style={{ color: 'var(--text-faint)' }}">
        {label}
      </span>
      <span className="text-sm style={{ color: 'var(--text)' }}">
        {value || "—"}
      </span>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex justify-between items-center"
      >
        <div>
          <h1 className="page-title">
            {t("demandes.details_title") || "Détails de la demande"} #
            {demande.id}
          </h1>
          <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>
            {t("common.date")}: {demande.created_at}
          </p>
        </div>
        <Button
          variant="outline"
          icon={ArrowLeftIcon}
          onClick={() => navigate(-1)}
        >
          {t("common.back")}
        </Button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card title={t("demandes.patient_info") || "Informations Patient"}>
          <div className="space-y-1 mt-2">
            <InfoRow
              label={t("create.patient_name")}
              value={demande.patient_name}
            />
            <InfoRow
              label={t("create.patient_age")}
              value={`${demande.patient_age} ans`}
            />
            <InfoRow
              label={t("create.blood_type")}
              value={
                <span className="badge badge-red">{demande.blood_type}</span>
              }
            />
            <InfoRow label={t("create.reason")} value={demande.reason} />
          </div>
        </Card>

        <Card title={t("demandes.request_details") || "Détails de la Demande"}>
          <div className="space-y-1 mt-2">
            {user?.role !== "hospital" && (
              <InfoRow
                label={t("demandes.hospital")}
                value={demande.hospital?.name}
              />
            )}
            <InfoRow
              label={t("demandes.quantity")}
              value={`${demande.quantity} ${t("demandes.units")}`}
            />
            <InfoRow
              label={t("create.urgency")}
              value={
                <span className="badge badge-yellow">
                  {demande.urgency_label}
                </span>
              }
            />
            <InfoRow
              label={t("create.status")}
              value={
                <span className={`badge badge-${demande.status_color}`}>
                  {demande.status_label}
                </span>
              }
            />
            {demande.rejection_reason && (
              <InfoRow
                label={t("demandes.reject_reason")}
                value={
                  <span className="text-red-500">
                    {demande.rejection_reason}
                  </span>
                }
              />
            )}
            {demande.notes && (
              <InfoRow label={t("create.notes")} value={demande.notes} />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DemandeDetails;
