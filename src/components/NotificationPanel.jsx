import { useState, useEffect } from "react";

const notificationPanel = {
  position: "fixed",
  top: 20,
  right: 20,
  width: 320,
  maxHeight: "60vh",
  overflowY: "auto",
  zIndex: 1000,
  display: "grid",
  gap: 12,
};

const notificationItem = {
  padding: "16px 18px",
  borderRadius: 16,
  background: "rgba(255, 255, 255, 0.95)",
  border: "1px solid rgba(255, 255, 255, 0.2)",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
  backdropFilter: "blur(12px)",
  color: "#1a1a1a",
  fontSize: 14,
  lineHeight: 1.4,
  animation: "slideIn 0.3s ease-out",
};

const criticalNotification = {
  ...notificationItem,
  background: "linear-gradient(135deg, #ff6b6b, #ff4757)",
  color: "#fff",
  border: "1px solid rgba(255, 107, 107, 0.3)",
};

const successNotification = {
  ...notificationItem,
  background: "linear-gradient(135deg, #5bff96, #4ecdc4)",
  color: "#fff",
  border: "1px solid rgba(91, 255, 150, 0.3)",
};

const infoNotification = {
  ...notificationItem,
  background: "linear-gradient(135deg, #74d0ff, #5b9bff)",
  color: "#fff",
  border: "1px solid rgba(116, 208, 255, 0.3)",
};

const closeButton = {
  position: "absolute",
  top: 8,
  right: 8,
  background: "none",
  border: "none",
  color: "inherit",
  cursor: "pointer",
  fontSize: 16,
  opacity: 0.7,
  padding: 4,
};

const styles = `
@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
`;

export default function NotificationPanel({ notifications, onRemove }) {
  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
    return () => document.head.removeChild(styleSheet);
  }, []);

  const getNotificationStyle = (type) => {
    switch (type) {
      case "critical":
        return criticalNotification;
      case "success":
        return successNotification;
      case "info":
        return infoNotification;
      default:
        return notificationItem;
    }
  };

  return (
    <div style={notificationPanel}>
      {notifications.map((notification) => (
        <div key={notification.id} style={getNotificationStyle(notification.type)}>
          <button
            style={closeButton}
            onClick={() => onRemove(notification.id)}
            aria-label="Close notification"
          >
            ×
          </button>
          <div>{notification.message}</div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
            {new Date(notification.timestamp).toLocaleTimeString()}
          </div>
        </div>
      ))}
    </div>
  );
}