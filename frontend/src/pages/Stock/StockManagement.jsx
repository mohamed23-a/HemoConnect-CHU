import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import stockService from "../../services/stockService";
import Card from "../../components/Common/Card";
import Button from "../../components/Common/Button";
import Modal from "../../components/Modals/Modal";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import toast from "react-hot-toast";
import {
  PlusCircleIcon,
  MinusCircleIcon,
  PencilIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const StockManagement = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [stock, setStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStock, setSelectedStock] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showDeduct, setShowDeduct] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [threshold, setThreshold] = useState(5);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    setLoading(true);
    try {
      const r = await stockService.getStock();
      setStock(r.data || []);
    } catch {
      toast.error(t("errors.load_failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!quantity || quantity < 1) {
      toast.error(t("stock.invalid_qty"));
      return;
    }
    setProcessing(true);
    try {
      await stockService.addStock({
        blood_type: selectedStock.blood_type,
        quantity,
        action: "add",
      });
      toast.success(
        `+${quantity} ${t("stock.units_added")} ${selectedStock.blood_type}`,
      );
      setShowAdd(false);
      setQuantity(1);
      setSelectedStock(null);
      fetchStock();
    } catch (e) {
      toast.error(e.response?.data?.message || t("errors.generic"));
    } finally {
      setProcessing(false);
    }
  };

  const handleDeduct = async () => {
    if (!quantity || quantity < 1) {
      toast.error(t("stock.invalid_qty"));
      return;
    }
    if (quantity > selectedStock.quantity) {
      toast.error(t("stock.qty_exceeds"));
      return;
    }
    setProcessing(true);
    try {
      await stockService.deductStock({
        blood_type: selectedStock.blood_type,
        quantity,
        action: "deduct",
      });
      toast.success(
        `-${quantity} ${t("stock.units_deducted")} ${selectedStock.blood_type}`,
      );
      setShowDeduct(false);
      setQuantity(1);
      setSelectedStock(null);
      fetchStock();
    } catch (e) {
      toast.error(e.response?.data?.message || t("errors.generic"));
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdate = async () => {
    if (quantity < 0) {
      toast.error(t("stock.qty_positive"));
      return;
    }
    setProcessing(true);
    try {
      await stockService.updateStock(selectedStock.blood_type, {
        quantity,
        minimum_threshold: threshold,
      });
      toast.success(`${t("stock.updated")} ${selectedStock.blood_type}`);
      setShowEdit(false);
      setQuantity(1);
      setThreshold(5);
      setSelectedStock(null);
      fetchStock();
    } catch (e) {
      toast.error(e.response?.data?.message || t("errors.generic"));
    } finally {
      setProcessing(false);
    }
  };

  const stockBadge = (item) => {
    if (item.quantity === 0)
      return <span className="badge badge-red">{t("stock.empty")}</span>;
    if (item.is_low)
      return <span className="badge badge-yellow">{t("stock.low")}</span>;
    return <span className="badge badge-green">{t("stock.available")}</span>;
  };

  const getQuantityColor = (item) => {
    if (item.quantity === 0) return "text-red-500";
    if (item.is_low) return "text-amber-500";
    return "text-emerald-500";
  };

  const canManageStock = !(
    user?.role === "admin" && user?.is_super_admin === false
  );

  if (loading)
    return (
      <div className="flex justify-center items-center h-72">
        <LoadingSpinner size="lg" />
      </div>
    );

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h1 className="page-title">{t("stock.title")}</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchStock}
          icon={ArrowPathIcon}
        >
          {t("common.refresh")}
        </Button>
      </div>

      <Card>
        <div className="t-wrap">
          <table className="t-table">
            <thead className="t-head">
              <tr>
                <th className="t-th">{t("stock.blood_type")}</th>
                <th className="t-th">{t("stock.quantity")}</th>
                <th className="t-th">{t("stock.minimum")}</th>
                <th className="t-th">{t("stock.status")}</th>
                <th className="t-th">{t("stock.last_update")}</th>
                {canManageStock && (
                  <th className="t-th">{t("common.actions")}</th>
                )}
              </tr>
            </thead>
            <tbody className="t-body">
              {stock.map((item) => (
                <tr key={item.id}>
                  <td className="t-td font-semibold">{item.blood_type}</td>
                  <td className="t-td">
                    <span
                      className={`font-bold text-base ${getQuantityColor(item)}`}
                    >
                      {item.quantity}
                    </span>
                  </td>
                  <td className="t-td t-td-muted">{item.minimum_threshold}</td>
                  <td className="t-td">{stockBadge(item)}</td>
                  <td className="t-td t-td-muted">
                    {item.last_updated
                      ? new Date(item.last_updated).toLocaleDateString()
                      : "-"}
                  </td>
                  {canManageStock && (
                    <td className="t-td">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedStock(item);
                            setQuantity(1);
                            setShowAdd(true);
                          }}
                          className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                          title={t("stock.add")}
                        >
                          <PlusCircleIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStock(item);
                            setQuantity(1);
                            setShowDeduct(true);
                          }}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title={t("stock.deduct")}
                        >
                          <MinusCircleIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedStock(item);
                            setQuantity(item.quantity);
                            setThreshold(item.minimum_threshold);
                            setShowEdit(true);
                          }}
                          className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title={t("common.edit")}
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Shared qty input helper */}
      {[
        {
          show: showAdd,
          title: `${t("stock.add")} — ${selectedStock?.blood_type}`,
          onClose: () => setShowAdd(false),
          onConfirm: handleAdd,
          variant: "success",
          label: t("stock.qty_add"),
        },
        {
          show: showDeduct,
          title: `${t("stock.deduct")} — ${selectedStock?.blood_type}`,
          onClose: () => setShowDeduct(false),
          onConfirm: handleDeduct,
          variant: "danger",
          label: t("stock.qty_deduct"),
        },
      ].map(({ show, title, onClose, onConfirm, variant, label }) => (
        <Modal key={title} isOpen={show} onClose={onClose} title={title}>
          <div className="space-y-4">
            <div>
              <label className="th-label">{label}</label>
              <input
                type="number"
                className="th-input"
                value={quantity}
                min="1"
                onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 0)}
              />
              <p
                className="text-xs mt-1.5"
                style={{ color: "var(--text-faint)" }}
              >
                {t("stock.current")}: {selectedStock?.quantity}{" "}
                {t("stock.units")}
              </p>
            </div>
            <div className="flex justify-end gap-3 pt-1">
              <Button variant="outline" onClick={onClose}>
                {t("common.cancel")}
              </Button>
              <Button
                variant={variant}
                onClick={onConfirm}
                loading={processing}
              >
                {t("common.confirm")}
              </Button>
            </div>
          </div>
        </Modal>
      ))}

      {/* Edit modal */}
      <Modal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        title={`${t("common.edit")} — ${selectedStock?.blood_type}`}
      >
        <div className="space-y-4">
          <div>
            <label className="th-label">{t("stock.quantity")}</label>
            <input
              type="number"
              className="th-input"
              value={quantity}
              min="0"
              onChange={(e) => setQuantity(Number.parseInt(e.target.value) || 0)}
            />
          </div>
          <div>
            <label className="th-label">{t("stock.minimum")}</label>
            <input
              type="number"
              className="th-input"
              value={threshold}
              min="1"
              onChange={(e) => setThreshold(Number.parseInt(e.target.value) || 0)}
            />
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <Button variant="outline" onClick={() => setShowEdit(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdate}
              loading={processing}
            >
              {t("common.save")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default StockManagement;
