import React, { useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "../../redux/store"
import {
  hideNotification,
  removeNotification,
} from "../../redux/slices/notificationSlice"
import Notification from "./Notification"

const NotificationContainer: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const notifications = useSelector(
    (state: RootState) => state.notification.notifications
  )

  useEffect(() => {
    notifications.forEach((notification) => {
      if (notification.visible && notification.duration > 0) {
        const timer = setTimeout(() => {
          dispatch(hideNotification(notification.id))
          // Remove sau khi animation hoàn thành
          setTimeout(() => {
            dispatch(removeNotification(notification.id))
          }, 300)
        }, notification.duration)

        return () => clearTimeout(timer)
      }
    })
  }, [notifications, dispatch])

  const handleClose = (id: string) => {
    dispatch(hideNotification(id))
    setTimeout(() => {
      dispatch(removeNotification(id))
    }, 300)
  }

  return (
    <>
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          visible={notification.visible}
          onClose={() => handleClose(notification.id)}
        />
      ))}
    </>
  )
}

export default NotificationContainer
