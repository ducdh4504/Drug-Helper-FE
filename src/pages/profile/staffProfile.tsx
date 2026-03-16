import { useState, useEffect } from "react"
import "./staffProfile.scss"
import nullAvatar from "../../assets/images/null_avatar.png"
import { getUserProfile, updateUserProfile } from "../../services/userAPI"
import { useNotification } from "../../hooks/useNotification"
import { useSelector } from "react-redux"
import { getUserNameFromToken } from "../../utils/helpers/getRoleJwt"

const StaffProfile = () => {
  const token = useSelector((state: any) => state.auth?.token || "")

  const [profileData, setProfileData] = useState({
    imgUrl: nullAvatar,
    userName: getUserNameFromToken(token) || "",
    fullName: "",
    phone: "",
    address: "",
    birthday: "",
    email: "",
  })
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const { showSuccess, showError, showWarning } = useNotification()

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true)
        const res = await getUserProfile()
        const formattedData = {
          imgUrl: res.data.imgUrl || nullAvatar,
          userName: getUserNameFromToken(token) || "",
          fullName: res.data.fullName || "",
          phone: res.data.phone || "",
          address: res.data.address || "",
          birthday: res.data.dateOfBirth
            ? new Date(res.data.dateOfBirth).toISOString().slice(0, 10)
            : "",
          email: res.data.email || "",
        }
        setProfileData(formattedData)
      } catch (error: any) {
        console.error("Failed to load profile:", error)
        showError(
          "Failed to load profile",
          error?.response?.data?.message ||
            "An error occurred while loading profile."
        )
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleEditToggle = () => {
    setIsEditing(!isEditing)
  }

  const handleProfileSave = async () => {
    if (!profileData.fullName.trim()) {
      showError("Validation Error", "Full name is required.")
      return
    }

    try {
      setLoading(true)
      await updateUserProfile({
        fullName: profileData.fullName,
        phone: profileData.phone,
        address: profileData.address,
        dateOfBirth: profileData.birthday
          ? new Date(profileData.birthday).toISOString()
          : "",
      })
      showSuccess(
        "Profile updated",
        "Your profile has been updated successfully."
      )
      setIsEditing(false)
    } catch (error: any) {
      console.error("Update profile error:", error)

      if (error?.status === 401) {
        showError(
          "Unauthorized",
          "You are not authorized to perform this action. Please log in again."
        )
      } else if (error?.status === 400) {
        showWarning(
          "Empty Fields",
          error?.response?.data?.message ||
            "Please fill in all required fields before submitting."
        )
      } else if (error?.status === 422) {
        showWarning(
          "Invalid Data",
          "The data you entered is not valid. Please check and try again."
        )
      } else if (error?.status >= 500) {
        showError(
          "Server Error",
          "Something went wrong on our end. Please try again later."
        )
      } else {
        showError(
          "Update Failed",
          error?.response?.data?.message ||
            "An unexpected error occurred while updating your profile."
        )
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <div className="staff-profile-container">
      {/* Profile Header */}
      <div className="staff-profile-header">
        <div className="staff-profile-avatar-container">
          <img
            src={profileData.imgUrl}
            alt="profile-avatar"
            className="staff-profile-avatar"
          />
        </div>
        <div className="staff-profile-info-header">
          <h1 className="staff-profile-name">
            {profileData.userName || "Staff Name"}
          </h1>
          <p className="staff-profile-email">
            {profileData.email || "staff@email.com"}
          </p>
        </div>
      </div>

      {/* Profile Content */}
      <div className="staff-profile-content">
        <div className="staff-profile-form">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter your full name"
                value={profileData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                disabled={!isEditing || loading}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input
                type="tel"
                className="form-input"
                placeholder="Enter your phone number"
                value={profileData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                disabled={!isEditing || loading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Address</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter your address"
                value={profileData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                disabled={!isEditing || loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Date of Birth</label>
              <input
                type="date"
                className="form-input"
                value={profileData.birthday}
                onChange={(e) => handleInputChange("birthday", e.target.value)}
                disabled={!isEditing || loading}
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              className="save-button"
              onClick={isEditing ? handleProfileSave : handleEditToggle}
              disabled={loading}
            >
              {loading
                ? "Loading..."
                : isEditing
                ? "Save Changes"
                : "Edit Profile"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StaffProfile
