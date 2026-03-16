import React, { useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"

const AuthActionHandler: React.FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const mode = searchParams.get("mode")
    const oobCode = searchParams.get("oobCode")
    const continueUrl = searchParams.get("continueUrl")

    if (!mode || !oobCode) {
      navigate("/login")
      return
    }

    switch (mode) {
      case "verifyEmail":
        // Redirect to email verification page
        navigate(`/email-verification?mode=${mode}&oobCode=${oobCode}`)
        break

      case "resetPassword":
        // Redirect to existing reset password page
        navigate(
          `/resetpassword?oobCode=${oobCode}${
            continueUrl ? `&continueUrl=${continueUrl}` : ""
          }`
        )
        break
      default:
        navigate("/login")
    }
  }, [searchParams, navigate])

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #183153 0%, #20558A 100%)",
        color: "white",
        fontSize: "18px",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            width: "50px",
            height: "50px",
            border: "4px solid rgba(255, 255, 255, 0.3)",
            borderTop: "4px solid white",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 16px",
          }}
        ></div>
        Redirecting...
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default AuthActionHandler
