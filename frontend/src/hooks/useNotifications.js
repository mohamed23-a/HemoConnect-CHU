import { useState, useEffect, useCallback } from "react";
import dashboardService from "../services/dashboardService";
import { useTranslation } from "react-i18next";

const useNotifications = () => {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await dashboardService.getRecentActivity();
      const activities = response.data || [];
      setNotifications(activities);
      setUnreadCount(activities.filter((a) => !a.read).length);
      setError(null);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      setError(t("notifications.fetch_failed") || "فشل تحميل الإشعارات");
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      // هنا يمكن إضافة endpoint لتعليم الإشعار كمقروء
      // حالياً نقوم بتحديث الحالة محلياً
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, read: true } : notif,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true })),
      );
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  }, []);

  const deleteNotification = useCallback(
    async (notificationId) => {
      try {
        setNotifications((prev) =>
          prev.filter((notif) => notif.id !== notificationId),
        );
        // إذا كان الإشعار غير مقروء، نخفض العداد
        const wasUnread =
          notifications.find((n) => n.id === notificationId)?.read === false;
        if (wasUnread) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } catch (err) {
        console.error("Error deleting notification:", err);
      }
    },
    [notifications],
  );

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // تحديث كل 30 ثانية
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  };
};

export default useNotifications;
