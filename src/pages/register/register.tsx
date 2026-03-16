import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useNavigate } from "react-router-dom"
import { useDispatch } from "react-redux"
import {
  getAuth,
  fetchSignInMethodsForEmail,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth"
import "./register.scss"
import { FormField } from "../../components/FormField/FormField"
import { loginSuccess } from "../../redux/slices/authSlice"
import { googleLogin, register as registerAPI } from "../../services/authAPI"
import type { AppDispatch } from "../../redux/store"
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google"
import {
  registerSchema,
  type RegisterFormData,
} from "../../utils/helpers/validationSchemas"
import { useNotification } from "../../hooks/useNotification"

const Register = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()
  const [loading, setLoading] = useState(false)
  const auth = getAuth()
  const { showSuccess, showError, showWarning, showInfo } = useNotification()

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
  })

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true)

    try {
      const signInMethods = await fetchSignInMethodsForEmail(auth, data.email)
      if (signInMethods.length > 0) {
        showWarning(
          "Email Already Exists",
          "This email is already registered in the system!"
        )
        setLoading(false)
        return
      }

      await createUserWithEmailAndPassword(auth, data.email, data.password)
      await handleCreateUserAfterEmailVerified()
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        showError(
          "Email Already In Use",
          "This email is already being used by another account."
        )
      } else if (error.code === "auth/weak-password") {
        showError("Weak Password", "Please choose a stronger password.")
      } else if (error.code === "auth/invalid-email") {
        showError("Invalid Email", "Please enter a valid email address.")
      } else {
        showError(
          "Registration Failed",
          error.message || "An unexpected error occurred during registration."
        )
      }
    } finally {
      setLoading(false)
    }
  }

  const handleCreateUserAfterEmailVerified = async () => {
    try {
      setLoading(true)
      await auth.currentUser?.reload()

      // Send email verification first
      if (auth.currentUser && !auth.currentUser.emailVerified) {
        await sendEmailVerification(auth.currentUser, {
          url: `${window.location.origin}/login`,
          handleCodeInApp: false,
        })

        showInfo(
          "Verification Email Sent 📧",
          "Please check your email and verify your account before continuing."
        )
      }

      const formData = getValues()
      await registerAPI({
        userName: formData.userName,
        email: formData.email,
        birthday: formData.birthday || "",
        password: formData.password,
      })

      setTimeout(() => {
        navigate("/login")
      }, 1300)
    } catch (error: any) {
      showError(
        "Account Creation Failed",
        error?.response?.data?.message ||
          "Failed to create user account. Please try again."
      )
      await auth.currentUser?.delete()
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
        navigate("/")
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

  return (
    <div className="register-container">
      <div className="register-left">
        <h2 className="form-title">Register</h2>

        <form className="register-form" onSubmit={handleSubmit(onSubmit)}>
          <FormField
            name="userName"
            type="text"
            placeholder="Username"
            register={register}
            error={errors.userName}
            disabled={loading || isSubmitting}
            autoComplete="username"
          />

          <FormField
            name="email"
            type="email"
            placeholder="Email"
            register={register}
            error={errors.email}
            disabled={loading || isSubmitting}
            autoComplete="email"
          />

          <FormField
            name="birthday"
            type="date"
            placeholder="Birthday"
            register={register}
            error={errors.birthday}
            disabled={loading || isSubmitting}
          />

          <FormField
            name="password"
            type="password"
            placeholder="Password"
            register={register}
            error={errors.password}
            disabled={loading || isSubmitting}
            autoComplete="new-password"
          />

          <FormField
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            register={register}
            error={errors.confirmPassword}
            disabled={loading || isSubmitting}
            autoComplete="new-password"
          />

          <button
            className="register-button"
            type="submit"
            disabled={loading || isSubmitting}
          >
            {loading || isSubmitting ? "Registering..." : "Register"}
          </button>
        </form>

        <p className="signup-text">
          Already have an account?
          <a onClick={() => navigate("/login")}> Sign in</a>
        </p>

        <div className="social-login">
          <GoogleLogin
            onSuccess={handleGoogleLogin}
            onError={() =>
              showError(
                "Google Login Error",
                "An error occurred during Google login."
              )
            }
          />
        </div>
      </div>

      <div className="divider"></div>

      <div className="register-right">
        <img
          src="https://firebasestorage.googleapis.com/v0/b/drug-helper-1c86b.firebasestorage.app/o/otherImage%2FloginImage.png?alt=media&token=f115b5be-ba8a-40f2-8f4c-5387ee6c9bed"
          alt="Register"
          className="register-image"
        />
      </div>
    </div>
  )
}

export default Register
