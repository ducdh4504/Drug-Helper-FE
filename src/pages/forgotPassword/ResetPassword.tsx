import { useNavigate, useSearchParams } from "react-router-dom"
import "./ResetPassword.scss"
import { useState } from "react"
import { resetPassword } from "../../services/authAPI"
import { auth } from "../../utils/filebaseConfig"
import { verifyPasswordResetCode } from "firebase/auth"

const ResetPassword = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const oobCode = searchParams.get("oobCode") || ""

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  })
  const [errorMsg, setErrorMsg] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [loading, setLoading] = useState(false)

  const validateForm = () => {
    if (!formData.newPassword) {
      setErrorMsg("Vui lòng nhập mật khẩu mới")
      return false
    } else if (formData.newPassword.length < 6) {
      setErrorMsg("Mật khẩu phải có ít nhất 6 ký tự")
      return false
    } else if (formData.newPassword !== formData.confirmPassword) {
      setErrorMsg("Mật khẩu xác nhận không khớp")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")
    setSuccessMsg("")
    const email = await verifyPasswordResetCode(auth, oobCode)
    if (!validateForm()) return

    if (!email) {
      setErrorMsg("Liên kết không hợp lệ hoặc đã hết hạn.")
      return
    }

    setLoading(true)
    try {
      await resetPassword({
        email,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      })
      setSuccessMsg("Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.")
      setTimeout(() => navigate("/login"), 2000)
    } catch (error: unknown) {
      setErrorMsg(
        (error as any)?.response?.data?.message ||
          "Đã có lỗi xảy ra khi đặt lại mật khẩu"
      )
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (errorMsg) setErrorMsg("")
    if (successMsg) setSuccessMsg("")
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password">
        <h2 className="form-title">Reset password</h2>

        <form onSubmit={handleSubmit} className="reset-password-form">
          <div className="form-group-reset-password">
            <label htmlFor="newPassword">New Password:</label>
            <div className="password-field">
              <input
                type="password"
                placeholder="New Password"
                className="input-field"
                required
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>
          <div className="form-group-reset-password">
            <label htmlFor="confirmPassword">Re-enter Password:</label>
            <div className="password-field">
              <input
                type="password"
                placeholder="Confirm Password"
                className="input-field"
                required
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>
          {errorMsg && <p className="error-message">{errorMsg}</p>}
          {successMsg && <p className="success-message">{successMsg}</p>}

          <button
            type="submit"
            className="reset-password-button"
            disabled={loading}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <p className="back-to-login">
          <a onClick={() => navigate("/login")}>Quay lại đăng nhập</a>
        </p>
      </div>
    </div>
  )
}

export default ResetPassword
