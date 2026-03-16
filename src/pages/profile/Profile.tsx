import { useState, useEffect } from "react"
import "./profile.scss"
import nullAvatar from "../../assets/images/null_avatar.png"
import { FaRegPenToSquare } from "react-icons/fa6"
import { getUserProfile, updateUserProfile } from "../../services/userAPI"
import {
  getUserCourseRegistrations,
  getCourseById,
} from "../../services/courseAPI"
import {
  getUserProgramParticipation,
  getCommunicationProgramById,
} from "../../services/programAPI"
import { useNotification } from "../../hooks/useNotification"
import AppointmentProgramHistory from "../../components/AppointmentProgramHistory/AppointmentProgramHistory"
import CourseBox from "../../components/CourseBox/CourseBox"
import ProgramBox from "../../components/ProgramBox/ProgramBox"
import { Spin } from "antd"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import { getUserNameFromToken } from "../../utils/helpers/getRoleJwt"

const Profile = () => {
  // Lấy userId từ redux (authSlice)
  const userId = useSelector((state: any) => state.auth?.userId || "")
  const token = useSelector((state: any) => state.auth?.token || "")

  const [activeTab, setActiveTab] = useState<"profile" | "course" | "activity">(
    "profile"
  )
  const [profileData, setProfileData] = useState({
    imgUrl: nullAvatar,
    userName: getUserNameFromToken(token) || "",
    fullName: "",
    phone: "",
    address: "",
    birthday: "",
    email: "",
  })
  const [courses, setCourses] = useState<any[]>([])
  const [programs, setPrograms] = useState<any[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [coursesLoading, setCoursesLoading] = useState(false)
  const [programsLoading, setProgramsLoading] = useState(false)
  const { showSuccess, showError, showWarning } = useNotification()
  const navigate = useNavigate()

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

  useEffect(() => {
    const fetchCourses = async () => {
      if (activeTab === "course" && userId) {
        try {
          setCoursesLoading(true)
          const res = await getUserCourseRegistrations(userId)
          const registrations = res.data || []

          const courseDetails = await Promise.all(
            registrations.map(async (reg: any) => {
              try {
                const courseRes = await getCourseById(reg.courseId)
                return {
                  ...reg,
                  course: courseRes.data,
                }
              } catch (err) {
                return { ...reg, course: null }
              }
            })
          )
          setCourses(courseDetails)
        } catch (error: any) {
          console.error("Failed to load courses:", error)
          if (error?.response?.status !== 404) {
            showError(
              "Failed to load courses",
              error?.response?.data?.message ||
                "An error occurred while loading courses."
            )
          }
        } finally {
          setCoursesLoading(false)
        }
      }
    }
    fetchCourses()
  }, [activeTab, userId])

  useEffect(() => {
    const fetchPrograms = async () => {
      if (activeTab === "activity" && userId) {
        try {
          setProgramsLoading(true)
          const res = await getUserProgramParticipation(userId)
          const participations = res.data || []

          const programDetails = await Promise.all(
            participations.map(async (participation: any) => {
              try {
                const programRes = await getCommunicationProgramById(
                  participation.programID
                )
                return {
                  ...participation,
                  program: programRes.data,
                }
              } catch (err) {
                return { ...participation, program: null }
              }
            })
          )
          setPrograms(programDetails.filter((p) => p.program !== null))
        } catch (error: any) {
          console.error("Failed to load programs:", error)
          showError(
            "Failed to load programs",
            error?.response?.data?.message ||
              "An error occurred while loading programs."
          )
        } finally {
          setProgramsLoading(false)
        }
      }
    }
    fetchPrograms()
  }, [activeTab, userId])

  const handleTabChange = (tab: "profile" | "course" | "activity") => {
    setActiveTab(tab)
    setIsEditing(false)
  }

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

  const handleCourseClick = (courseId: string) => {
    navigate(`/course/${courseId}`)
  }

  const handleProgramClick = (programId: string) => {
    navigate(`/program-register/${programId}`)
  }

  return (
    <div className="profile-container">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-avatar-container">
          <img
            src={profileData.imgUrl}
            alt="profile-avatar"
            className="profile-avatar"
          />
        </div>
        <div className="profile-info-header">
          <h1 className="profile-name">
            {profileData.userName || "User Name"}
          </h1>
          <p className="profile-email">
            {profileData.email || "user@email.com"}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="navigation">
        <button
          className={`nav-item ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => handleTabChange("profile")}
          disabled={loading}
        >
          Profile
        </button>
        <button
          className={`nav-item ${activeTab === "course" ? "active" : ""}`}
          onClick={() => handleTabChange("course")}
          disabled={loading}
        >
          Course
        </button>
        <button
          className={`nav-item ${activeTab === "activity" ? "active" : ""}`}
          onClick={() => handleTabChange("activity")}
          disabled={loading}
        >
          Activity History
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "profile" && (
        <div className="profile-content">
          <div className="profile-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter your full name"
                  value={profileData.fullName}
                  onChange={(e) =>
                    handleInputChange("fullName", e.target.value)
                  }
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
                  onChange={(e) =>
                    handleInputChange("birthday", e.target.value)
                  }
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
                {loading ? (
                  <>
                    <Spin size="small" style={{ marginRight: 8 }} />
                    Saving...
                  </>
                ) : isEditing ? (
                  "Save Changes"
                ) : (
                  <>
                    <FaRegPenToSquare style={{ marginRight: 8 }} />
                    Edit Profile
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "course" && (
        <div className="course-content">
          {!userId ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading profile...</p>
            </div>
          ) : coursesLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading your enrolled courses...</p>
            </div>
          ) : courses.length > 0 ? (
            <div className="course-grid">
              {courses.map((courseRegistration) => (
                <CourseBox
                  key={
                    courseRegistration.courseRegistrationID ||
                    courseRegistration.courseID
                  }
                  course={courseRegistration.course || courseRegistration}
                  courseRegistration={courseRegistration}
                  onClick={() =>
                    handleCourseClick(
                      courseRegistration.course?.courseId ||
                        courseRegistration.courseID
                    )
                  }
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📚</div>
              <p>You haven't enrolled in any courses yet.</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "activity" && (
        <div className="activity-content">
          <AppointmentProgramHistory loading={loading} />

          {/* Programs Section */}
          <div className="activity-section">
            <h3 className="section-title">My Programs</h3>
            {!userId ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading profile...</p>
              </div>
            ) : programsLoading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading your programs...</p>
              </div>
            ) : programs.length > 0 ? (
              <div className="programs-grid">
                {programs.map((programParticipation) => (
                  <ProgramBox
                    key={programParticipation.programID}
                    program={{
                      programID: programParticipation.program.programID,
                      name: programParticipation.program.name,
                      description: programParticipation.program.description,
                      image:
                        programParticipation.program.imgUrl ||
                        "https://via.placeholder.com/350x220?text=No+Image&bg=f8f9fa&color=6c757d",
                      imgUrl: programParticipation.program.imgUrl,
                      status: programParticipation.program.status,
                      date: programParticipation.program.date,
                      startTime: programParticipation.program.startTime,
                      endTime: programParticipation.program.endTime,
                      speaker: programParticipation.program.speaker,
                      speakerImageUrl:
                        programParticipation.program.speakerImageUrl,
                      location: programParticipation.program.location,
                      locationType: programParticipation.program.locationType,
                    }}
                    onClick={handleProgramClick}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">🎯</div>
                <p>You haven't joined any programs yet.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Profile
