import React, { useEffect, useState, useCallback } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { applyActionCode, getAuth } from "firebase/auth"
import { useNotification } from "../../hooks/useNotification"
import "./EmailVerification.scss"

interface EmailVerificationState {
  loading: boolean
  error: string | null
  success: boolean
}

const EmailVerification: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const auth = getAuth()
  const { showSuccess, showError } = useNotification()

  const [state, setState] = useState<EmailVerificationState>({
    loading: true,
    error: null,
    success: false,
  })

  const handleEmailVerification = useCallback(
    async (actionCode: string) => {
      try {
        await applyActionCode(auth, actionCode)

        setState({
          loading: false,
          error: null,
          success: true,
        })

        showSuccess(
          "Email Verified Successfully! ✅",
          "Your email has been verified. You can now access all features."
        )

        // Auto redirect to login after 3 seconds
        setTimeout(() => {
          navigate("/login")
        }, 3000)
      } catch (error: any) {
        let errorMessage = "Failed to verify email."

        switch (error.code) {
          case "auth/expired-action-code":
            errorMessage =
              "The verification link has expired. Please request a new one."
            break
          case "auth/invalid-action-code":
            errorMessage =
              "The verification link is invalid. Please check your email."
            break
          case "auth/user-disabled":
            errorMessage = "This user account has been disabled."
            break
          default:
            errorMessage = error.message || "Failed to verify email."
        }

        setState({
          loading: false,
          error: errorMessage,
          success: false,
        })

        showError("Email Verification Failed", errorMessage)
      }
    },
    [auth, navigate, showSuccess, showError]
  )

  useEffect(() => {
    const mode = searchParams.get("mode")
    const actionCode = searchParams.get("oobCode")

    // Only handle email verification
    if (mode !== "verifyEmail" || !actionCode) {
      setState({
        loading: false,
        error: "Invalid verification link",
        success: false,
      })
      return
    }

    handleEmailVerification(actionCode)
  }, [])

  return (
    <div className="email-verification-container">
      <div className="email-verification-content">
        <div className="verification-icon">
          {state.loading ? "📧" : state.success ? "✅" : "❌"}
        </div>

        <h2 className="form-title">
          {state.loading
            ? "Verifying Email..."
            : state.success
            ? "Email Verified!"
            : "Verification Failed"}
        </h2>

        {state.loading && (
          <div className="loading-content">
            <div className="spinner"></div>
            <p>Please wait while we verify your email address...</p>
          </div>
        )}

        {state.success && (
          <div className="success-content">
            <p className="success-message">
              🎉 Your email has been verified successfully! <br />
              You can now access all features of Drug Helper.
            </p>
            <p className="redirect-info">
              You will be redirected to login page in a few seconds...
            </p>
            <button
              className="action-button primary"
              onClick={() => navigate("/login")}
            >
              Go to Login Now
            </button>
          </div>
        )}

        {state.error && (
          <div className="error-content">
            <p className="error-message">{state.error}</p>
            <div className="error-actions">
              <button
                className="action-button secondary"
                onClick={() => navigate("/register")}
              >
                Back to Register
              </button>
              <button
                className="action-button primary"
                onClick={() => navigate("/login")}
              >
                Go to Login
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EmailVerification
