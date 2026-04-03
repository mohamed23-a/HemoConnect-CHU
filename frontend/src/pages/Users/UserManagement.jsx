import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";
import userService from "../../services/userService";
import demandeService from "../../services/demandeService";
import Card from "../../components/Common/Card";
import Button from "../../components/Common/Button";
import Modal from "../../components/Modals/Modal";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import toast from "react-hot-toast";
import {
  PencilIcon,
  TrashIcon,
  UserCircleIcon,
  PlusCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

const FIELD = (label, value, onChange, type = "text", required = true) => ({
  label,
  value,
  onChange,
  type,
  required,
});

const UserManagement = () => {
  const { user: me, register } = useAuth();
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selected, setSelected] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
    role: "hospital",
    hospital_name: "",
    blood_center_name: "",
    is_active: true,
    is_super_admin: false,
  });

  // Activity Modal State
  const [showActivity, setShowActivity] = useState(false);
  const [activityUser, setActivityUser] = useState(null);
  const [activityData, setActivityData] = useState([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const r = await userService.getUsers();
      setUsers(r.data.data || []);
    } catch {
      toast.error(t("errors.load_failed"));
    } finally {
      setLoading(false);
    }
  };

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const r = await register(form);
      if (r.success) {
        toast.success(t("users.created"));
        setShowCreate(false);
        resetForm();
        fetchUsers();
      }
    } catch (e) {
      toast.error(e.response?.data?.message || t("errors.generic"));
    } finally {
      setProcessing(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setProcessing(true);
    try {
      await userService.updateUser(selected.id, {
        name: form.name,
        email: form.email,
        role: form.role,
        hospital_name: form.hospital_name,
        blood_center_name: form.blood_center_name,
        is_active: form.is_active,
        is_super_admin: form.is_super_admin,
      });
      toast.success(t("users.updated"));
      setShowEdit(false);
      fetchUsers();
    } catch (e) {
      toast.error(e.response?.data?.message || t("errors.generic"));
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (user) => {
    if (user.id === me.id) {
      toast.error(t("users.cant_delete_self"));
      return;
    }
    if (!window.confirm(`${t("users.confirm_delete")} ${user.name}?`)) return;
    setProcessing(true);
    try {
      await userService.deleteUser(user.id);
      toast.success(t("users.deleted"));
      fetchUsers();
    } catch (e) {
      toast.error(e.response?.data?.message || t("errors.generic"));
    } finally {
      setProcessing(false);
    }
  };

  const handleToggle = async (user) => {
    if (user.id === me.id) {
      toast.error(t("users.cant_toggle_self"));
      return;
    }
    setProcessing(true);
    try {
      await userService.toggleUserStatus(user.id);
      toast.success(
        user.is_active ? t("users.deactivated") : t("users.activated"),
      );
      fetchUsers();
    } catch (e) {
      toast.error(e.response?.data?.message || t("errors.generic"));
    } finally {
      setProcessing(false);
    }
  };

  const resetForm = () =>
    setForm({
      name: "",
      email: "",
      password: "",
      password_confirmation: "",
      role: "hospital",
      hospital_name: "",
      blood_center_name: "",
      is_active: true,
      is_super_admin: false,
    });

  const openActivity = async (u) => {
    setActivityUser(u);
    setShowActivity(true);
    setLoadingActivity(true);
    try {
      const r = await demandeService.getDemandes({
        user_id: u.id,
        per_page: 50,
      });
      setActivityData(r.data?.data || r.data || []);
    } catch (e) {
      toast.error(t("errors.load_failed"));
    } finally {
      setLoadingActivity(false);
    }
  };

  const openEdit = (user) => {
    setSelected(user);
    setForm({
      name: user.name,
      email: user.email,
      role: user.role,
      hospital_name: user.hospital_name || "",
      blood_center_name: user.blood_center_name || "",
      is_active: user.is_active,
      is_super_admin: user.is_super_admin || false,
      password: "",
      password_confirmation: "",
    });
    setShowEdit(true);
  };

  const roleLabel = (role) =>
    ({
      admin: t("auth.role_admin"),
      hospital: t("auth.role_hospital"),
      blood_center: t("auth.role_blood_center"),
    })[role] || role;
  const roleBadge = (role) => {
    const cls =
      {
        admin: "badge badge-blue",
        hospital: "badge badge-green",
        blood_center: "badge badge-red",
      }[role] || "badge badge-gray";
    return <span className={cls}>{roleLabel(role)}</span>;
  };

  // Shared input row
  const Input = ({ label, ...props }) => (
    <div>
      <label className="th-label">{label}</label>
      <input className="th-input" {...props} />
    </div>
  );

  const RoleAndOrgFields = () => (
    <>
      <div>
        <label className="th-label">{t("users.role")}</label>
        <select className="th-input" value={form.role} onChange={set("role")}>
          <option value="hospital">{t("auth.role_hospital")}</option>
          <option value="blood_center">{t("auth.role_blood_center")}</option>
          <option value="admin">{t("auth.role_admin")}</option>
        </select>
      </div>
      {form.role === "hospital" && (
        <Input
          label={t("users.hospital_name")}
          value={form.hospital_name}
          onChange={set("hospital_name")}
        />
      )}
      {form.role === "blood_center" && (
        <Input
          label={t("users.blood_center_name")}
          value={form.blood_center_name}
          onChange={set("blood_center_name")}
        />
      )}
      {form.role === "admin" && (
        <div className="flex items-center gap-2 mt-2">
          <input
            type="checkbox"
            id="is_super_admin"
            checked={form.is_super_admin}
            onChange={(e) =>
              setForm((f) => ({ ...f, is_super_admin: e.target.checked }))
            }
            className="w-4 h-4 text-blue-600 rounded"
          />
          <label
            htmlFor="is_super_admin"
            className="th-label !mb-0 cursor-pointer"
          >
            {t("auth.role_super_admin") || "Super Admin (Full Access)"}
          </label>
        </div>
      )}
    </>
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
        <h1 className="page-title">{t("users.title")}</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            icon={ArrowPathIcon}
          >
            {t("common.refresh")}
          </Button>
          {me?.role === "admin" && me?.is_super_admin !== false && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setShowCreate(true)}
              icon={PlusCircleIcon}
            >
              {t("users.new_user")}
            </Button>
          )}
        </div>
      </div>

      <Card>
        <div className="t-wrap">
          <table className="t-table">
            <thead className="t-head">
              <tr>
                <th className="t-th">{t("users.name")}</th>
                <th className="t-th">{t("users.email")}</th>
                <th className="t-th">{t("users.role")}</th>
                <th className="t-th">{t("users.organization")}</th>
                <th className="t-th">{t("users.status")}</th>
                <th className="t-th">{t("users.joined")}</th>
                {me?.role === "admin" && me?.is_super_admin !== false && (
                  <th className="t-th">{t("common.actions")}</th>
                )}
              </tr>
            </thead>
            <tbody className="t-body">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="t-td">
                    <div
                      className="flex items-center gap-2.5 cursor-pointer group"
                      onClick={() => openActivity(u)}
                      title={t("users.activity")}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
                        {u.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <span className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {u.name}
                      </span>
                    </div>
                  </td>
                  <td className="t-td t-td-muted">{u.email}</td>
                  <td className="t-td">{roleBadge(u.role)}</td>
                  <td className="t-td t-td-muted">
                    {u.hospital_name || u.blood_center_name || "—"}
                  </td>
                  <td className="t-td">
                    <span
                      className={
                        u.is_active ? "badge badge-green" : "badge badge-red"
                      }
                    >
                      {u.is_active ? t("users.active") : t("users.inactive")}
                    </span>
                  </td>
                  <td className="t-td t-td-muted">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  {me?.role === "admin" && me?.is_super_admin !== false && (
                    <td className="t-td">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => openEdit(u)}
                          className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                          title={t("common.edit")}
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(u)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title={t("common.delete")}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggle(u)}
                          className={`p-1.5 rounded-lg transition-colors ${u.is_active ? "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20" : "text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"}`}
                          title={t("users.toggle_status")}
                        >
                          {u.is_active ? "🔴" : "🟢"}
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

      {/* Create modal */}
      <Modal
        isOpen={showCreate}
        onClose={() => {
          setShowCreate(false);
          resetForm();
        }}
        title={t("users.create_title")}
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label={t("users.full_name")}
            value={form.name}
            onChange={set("name")}
            required
          />
          <Input
            label={t("users.email")}
            type="email"
            value={form.email}
            onChange={set("email")}
            required
          />
          <Input
            label={t("auth.password")}
            type="password"
            value={form.password}
            onChange={set("password")}
            required
          />
          <Input
            label={t("users.confirm_password")}
            type="password"
            value={form.password_confirmation}
            onChange={set("password_confirmation")}
            required
          />
          <RoleAndOrgFields />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowCreate(false);
                resetForm();
              }}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" variant="primary" loading={processing}>
              {t("common.create")}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit modal */}
      <Modal
        isOpen={showEdit}
        onClose={() => setShowEdit(false)}
        title={t("users.edit_title")}
      >
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input
            label={t("users.full_name")}
            value={form.name}
            onChange={set("name")}
            required
          />
          <Input
            label={t("users.email")}
            type="email"
            value={form.email}
            onChange={set("email")}
            required
          />
          <RoleAndOrgFields />
          <div>
            <label className="th-label">{t("users.status")}</label>
            <select
              className="th-input"
              value={form.is_active ? "active" : "inactive"}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  is_active: e.target.value === "active",
                }))
              }
            >
              <option value="active">{t("users.active")}</option>
              <option value="inactive">{t("users.inactive")}</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowEdit(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit" variant="primary" loading={processing}>
              {t("common.save")}
            </Button>
          </div>
        </form>
      </Modal>

      {/* User Activity Modal */}
      <Modal
        isOpen={showActivity}
        onClose={() => setShowActivity(false)}
        title={
          activityUser
            ? `${t("users.activity") || "User Activity"} — ${activityUser.name}`
            : ""
        }
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto">
          {loadingActivity ? (
            <div className="flex justify-center p-6">
              <LoadingSpinner />
            </div>
          ) : activityData.length === 0 ? (
            <div className="text-center p-6 text-gray-500">
              {t("common.no_data")}
            </div>
          ) : (
            <div className="space-y-3">
              {activityData.map((d) => (
                <div
                  key={d.id}
                  className="p-3 border rounded-lg bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700"
                >
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                      {d.patient_name}
                    </span>
                    <span className="text-sm font-bold text-red-500 dark:text-red-400">
                      {d.blood_type}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>
                      {t("demande.quantity") || "Quantity"}:{" "}
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {d.quantity}
                      </span>
                    </span>
                    <span>{new Date(d.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="flex justify-end pt-4 mt-4 border-t dark:border-gray-800">
          <Button variant="outline" onClick={() => setShowActivity(false)}>
            {t("common.close")}
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default UserManagement;
