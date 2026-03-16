import { useDispatch } from 'react-redux'
import type { AppDispatch } from '../redux/store'
import { showSuccess, showError, showWarning, showInfo } from '../redux/slices/notificationSlice'

export const useNotification = () => {
  const dispatch = useDispatch<AppDispatch>()

  return {
    showSuccess: (title: string, message: string, duration?: number) => 
      dispatch(showSuccess(title, message, duration)),
    showError: (title: string, message: string, duration?: number) => 
      dispatch(showError(title, message, duration)),
    showWarning: (title: string, message: string, duration?: number) => 
      dispatch(showWarning(title, message, duration)),
    showInfo: (title: string, message: string, duration?: number) => 
      dispatch(showInfo(title, message, duration)),
  }
}