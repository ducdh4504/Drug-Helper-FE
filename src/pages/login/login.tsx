import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google"
import "./login.scss"
import { FormField } from "../../components/FormField/FormField"
import { useNotification } from "../../hooks/useNotification"
import { loginSuccess } from "../../redux/slices/authSlice"
import { googleLogin, login } from "../../services/authAPI"
import type { AppDispatch } from "../../redux/store"
import {
  loginSchema,
  type LoginFormData,
} from "../../utils/helpers/validationSchemas"
import type { RootState } from "../../redux/store"
import { getRoleLoginRoute } from "../../routes/getRoleLoginRoute"

const Login = () => {
  const dispatch = useDispatch<AppDispatch>()
  const [loading, setLoading] = useState(false)

  const role = useSelector((state: RootState) => state.auth.role)
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn)
  const navigate = useNavigate()

  // Sử dụng notification hook
  const { showSuccess, showError, showWarning, showInfo } = useNotification()

  useEffect(() => {
    if (isLoggedIn && role) {
      navigate(getRoleLoginRoute(role))
    }
  }, [isLoggedIn, role, navigate])

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  })

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true)
    showInfo("Logging in", "Please wait while we process your login...")

    try {
      const response = await login({
        usernameOrEmail: data.usernameOrEmail,
        password: data.password,
      })
      const { token } = response.data

      dispatch(loginSuccess({ token }))

      // Hiển thị thông báo thành công
      showSuccess(
        "Login Successful! 🎉",
        "Welcome back! You have been logged in successfully."
      )
    } catch (error: any) {
      console.error("Login error:", error)

      // Xử lý các loại lỗi khác nhau
      if (error?.response?.status === 401) {
        showError(
          "Login Failed",
          "Invalid username/email or password. Please check your credentials and try again."
        )
      } else if (error?.response?.status === 403) {
        showError(
          "Account Restricted",
          "Your account has been temporarily restricted. Please contact support."
        )
      } else if (error?.response?.status === 429) {
        showWarning(
          "Too Many Attempts",
          "Too many login attempts. Please wait a few minutes before trying again."
        )
      } else if (error?.code === "NETWORK_ERROR") {
        showError(
          "Network Error",
          "Unable to connect to the server. Please check your internet connection."
        )
      } else {
        showError(
          "Login Failed",
          error?.response?.data?.message ||
            "An unexpected error occurred. Please try again."
        )
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async (credentialResponse: CredentialResponse) => {
    setLoading(true)

    showInfo("Google Login", "Processing Google authentication...")

    try {
      if (!credentialResponse.credential) {
        showError(
          "Google Login Failed",
          "No credential received from Google. Please try again."
        )
        return
      }

      const response = await googleLogin(credentialResponse.credential)
      const { token } = response.data

      dispatch(loginSuccess({ token }))

      showSuccess(
        "Google Login Successful! 🎉",
        "You have been logged in with Google successfully."
      )

      setTimeout(() => {
        navigate(getRoleLoginRoute(role))
      }, 1000)
    } catch (error: any) {
      console.error("Google login error:", error)

      if (error?.response?.status === 400) {
        showError(
          "Google Login Failed",
          "Invalid Google token. Please try logging in again."
        )
      } else if (error?.response?.status === 401) {
        showError(
          "Authentication Failed",
          "Google authentication failed. Please try again."
        )
      } else {
        showError(
          "Google Login Error",
          error?.response?.data?.message ||
            "Failed to login with Google. Please try again."
        )
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleError = () => {
    showError(
      "Google Login Error",
      "Google authentication was cancelled or failed. Please try again."
    )
  }

  return (
    <div className="login-container">
      <div className="login-left">
        <h2 className="form-title">Login</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="login-form">
          <FormField
            name="usernameOrEmail"
            type="text"
            placeholder="Username"
            register={register}
            error={errors.usernameOrEmail}
            disabled={loading || isSubmitting}
            autoComplete="username"
          />

          <FormField
            name="password"
            type="password"
            placeholder="Password"
            register={register}
            error={errors.password}
            disabled={loading || isSubmitting}
            autoComplete="current-password"
          />

          <div className="form-links">
            <a
              onClick={() => navigate("/forgetpassword")}
              className="forgot-pass-link"
              style={{ cursor: "pointer" }}
            >
              Forgot Password?
            </a>
          </div>

          <button
            type="submit"
            className="login-button"
            disabled={loading || isSubmitting}
          >
            {loading || isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="signup-text">
          Don't have an account?
          <a onClick={() => navigate("/register")}> Sign up</a>
        </p>

        <div className="social-login">
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={handleGoogleError}
          />
        </div>
      </div>

      <div className="divider"></div>

      <div className="login-right">
        <img
          src="https://firebasestorage.googleapis.com/v0/b/drug-helper-1c86b.firebasestorage.app/o/otherImage%2FloginImage.png?alt=media&token=f115b5be-ba8a-40f2-8f4c-5387ee6c9bed"
          alt="Login"
          className="login-image"
        />
      </div>
    </div>
  )
}

export default Login
