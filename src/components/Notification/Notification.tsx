import React from "react"
import "./Notification.scss"

export type NotificationType = "success" | "error" | "warning" | "info"

interface NotificationProps {
  type: NotificationType
  title: string
  message: string
  onClose: () => void
  visible: boolean
}

const Notification: React.FC<NotificationProps> = ({
  type,
  title,
  message,
  onClose,
  visible,
}) => {
  const getIcon = () => {
    switch (type) {
      case "success":
        return "✓"
      case "error":
        return "✕"
      case "warning":
        return "⚠"
      case "info":
        return "ℹ"
      default:
        return "ℹ"
    }
  }

  if (!visible) return null

  return (
    <div
      className={`notification notification--${type} ${
        visible ? "notification--visible" : ""
      }`}
    >
      <div className="notification__icon">{getIcon()}</div>
      <div className="notification__content">
        <h4 className="notification__title">{title}</h4>
        <p className="notification__message">{message}</p>
      </div>
      <button className="notification__close" onClick={onClose}>
        ✕
      </button>
    </div>
  )
}

export default Notification
