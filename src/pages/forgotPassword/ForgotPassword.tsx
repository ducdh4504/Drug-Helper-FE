import React, { useState } from "react"
import "./ForgotPassword.scss"
import { useNavigate } from "react-router-dom"
import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from "../../utils/filebaseConfig"
import { useNotification } from "../../hooks/useNotification"

const ForgotPassword = () => {
  const navigate = useNavigate()
  const { showSuccess, showError } = useNotification()

  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setErrorMsg("Please enter a valid email address!")
      return
    }

    setLoading(true)

    try {
      // Send password reset email via Firebase
      await sendPasswordResetEmail(auth, email, {
        url: `${window.location.origin}/login`, // Continue URL after reset
        handleCodeInApp: false, // Let Firebase handle the action via email
      })

      showSuccess(
        "Reset Email Sent! 📧",
        "Please check your email for password reset instructions."
      )

      // Navigate back to login after showing message
      setTimeout(() => {
        navigate("/login")
      }, 2000)
    } catch (error: any) {
      let errorMessage = "An error occurred while sending reset email."

      switch (error.code) {
        case "auth/user-not-found":
          errorMessage = "No account found with this email address."
          break
        case "auth/invalid-email":
          errorMessage = "Please enter a valid email address."
          break
        case "auth/too-many-requests":
          errorMessage = "Too many requests. Please try again later."
          break
        default:
          errorMessage = error.message || "Failed to send reset email."
      }

      setErrorMsg(errorMessage)
      showError("Reset Email Failed", errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-header">
        <h2 className="form-title">Forgot Password</h2>
        <form onSubmit={handleSubmit} className="forgot-password-form">
          <div className="input-wrapper">
            <input
              type="email"
              placeholder="Enter your email"
              className="input-field"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          {/* Hiển thị lỗi validate local */}
          {errorMsg && <p className="error-message">{errorMsg}</p>}

          <button
            type="submit"
            className="forgot-password-button"
            disabled={loading}
          >
            {loading ? "Processing..." : "Send Reset Link"}
          </button>
        </form>

        <p className="back-to-login">
          <a onClick={() => navigate("/login")}>Back to Login</a>
        </p>
      </div>
    </div>
  )
}

export default ForgotPassword
