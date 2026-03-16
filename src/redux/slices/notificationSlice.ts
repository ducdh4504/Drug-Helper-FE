import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface NotificationState {
  id: string
  type: NotificationType
  title: string
  message: string
  duration: number
  visible: boolean
  timestamp: number
}

interface NotificationSliceState {
  notifications: NotificationState[]
}

const initialState: NotificationSliceState = {
  notifications: []
}

// Async thunk để auto hide notification sau duration
export const autoHideNotification = createAsyncThunk(
  'notification/autoHide',
  async (id: string, { dispatch }) => {
    return new Promise<string>((resolve) => {
      setTimeout(() => {
        dispatch(hideNotification(id))
        resolve(id)
      }, 300) // Delay for animation
    })
  }
)

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    showNotification: (state, action: PayloadAction<{
      type: NotificationType
      title: string
      message: string
      duration?: number
    }>) => {
      const { type, title, message, duration = 4000 } = action.payload
      const id = Date.now().toString()
      
      const notification: NotificationState = {
        id,
        type,
        title,
        message,
        duration,
        visible: true,
        timestamp: Date.now()
      }
      
      // Chỉ hiển thị 1 notification tại một thời điểm (có thể thay đổi nếu muốn nhiều)
      state.notifications = [notification]
    },
    
    hideNotification: (state, action: PayloadAction<string>) => {
      const id = action.payload
      const notification = state.notifications.find(n => n.id === id)
      if (notification) {
        notification.visible = false
      }
    },
    
    removeNotification: (state, action: PayloadAction<string>) => {
      const id = action.payload
      state.notifications = state.notifications.filter(n => n.id !== id)
    },
    
    clearAllNotifications: (state) => {
      state.notifications = []
    }
  }
})

export const { 
  showNotification, 
  hideNotification, 
  removeNotification, 
  clearAllNotifications 
} = notificationSlice.actions

// Helper actions
export const showSuccess = (title: string, message: string, duration?: number) => 
  showNotification({ type: 'success', title, message, duration })

export const showError = (title: string, message: string, duration?: number) => 
  showNotification({ type: 'error', title, message, duration })

export const showWarning = (title: string, message: string, duration?: number) => 
  showNotification({ type: 'warning', title, message, duration })

export const showInfo = (title: string, message: string, duration?: number) => 
  showNotification({ type: 'info', title, message, duration })

export default notificationSlice.reducer