import { useSelector, useDispatch } from "react-redux"
import { useEffect } from "react"
import { setAuthToken } from "./services/axiosClient"
import { logout } from "./redux/slices/authSlice"
import type { RootState } from "./redux/store"
import NotificationContainer from "./components/Notification/NotificationContainer"
import AppRouter from "./routes/AppRouter"

function App() {
  const token = useSelector((state: RootState) => state.auth.token)
  const expiresAt = useSelector((state: RootState) => state.auth.expiresAt)
  const dispatch = useDispatch()

  useEffect(() => {
    setAuthToken(token)
  }, [token])

  useEffect(() => {
    if (!token || !expiresAt) return
    if (Date.now() > expiresAt) {
      dispatch(logout())
    } else {
      const timeout = setTimeout(
        () => dispatch(logout()),
        expiresAt - Date.now()
      )
      return () => clearTimeout(timeout)
    }
  }, [token, expiresAt, dispatch])

  return (
    <>
      <AppRouter />
      <NotificationContainer />
    </>
  )
}

export default App
