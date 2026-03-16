import React, { useEffect, useState, useCallback } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "../../redux/store"
import { getCourseById, getCourseContent } from "../../services/courseAPI"
import {
  fetchCourseRegistrationStatus,
  registerForCourse,
  selectCourseRegistration,
  selectIsRegisteringForCourse,
} from "../../redux/slices/courseRegistrationSlice"
import CourseSpecifies from "../../components/CourseSpecifies/CourseSpecifies"
import BackLink from "../../components/BackLink/BackLink"
import type { Courses, CourseContent } from "../../types/interfaces/Courses"
import { LearningStatus } from "../../types/enums/LearningStatusEnum"
import { useNotification } from "../../hooks/useNotification"
import "./CourseDetailPage.scss"

const CourseDetailPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>()
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const [course, setCourse] = useState<Courses | null>(null)
  const [courseContent, setCourseContent] = useState<CourseContent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Lấy user info từ Redux store
  const userId = useSelector((state: RootState) => state.auth.userId)

  // Lấy registration data từ Redux (dùng đúng id)
  const courseRegistration = useSelector(selectCourseRegistration(id || ""))
  const isRegistering = useSelector(selectIsRegisteringForCourse(id || ""))
  const registrationError = useSelector(
    (state: RootState) => state.courseRegistration.error
  )

  // Sử dụng notification hook
  const { showSuccess, showError, showWarning, showInfo } = useNotification()

  // Memoize fetch function
  const fetchCourseDetails = useCallback(async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)

      const fetchPromises = [getCourseById(id), getCourseContent(id)]
      const responses = await Promise.allSettled(fetchPromises)

      // Set course data
      if (responses[0].status === "fulfilled") {
        setCourse(responses[0].value.data)
      } else {
        setError("Failed to load course information")
        console.error("Course fetch failed:", responses[0].reason)
      }

      if (responses[1].status === "fulfilled") {
        setCourseContent(responses[1].value.data)
      } else {
        console.warn("Content fetch failed:", responses[1].reason)
      }

      if (userId && userId !== "temp-user-id") {
        dispatch(fetchCourseRegistrationStatus({ userId, courseId: id! }))
      }
    } catch (error) {
      console.error("Error fetching course details:", error)
      setError("Unable to connect to server")
    } finally {
      setLoading(false)
    }
  }, [id, userId, dispatch])

  useEffect(() => {
    fetchCourseDetails()
  }, [fetchCourseDetails])

  // Xử lý error notifications
  useEffect(() => {
    if (error) {
      if (error === "Failed to load course information") {
        showError(
          "Error Loading Course",
          "Failed to load course information. Please try again."
        )
      } else if (error === "Unable to connect to server") {
        showError(
          "Network Error",
          "Unable to connect to server. Please check your internet connection."
        )
      }
    }
  }, [error, showError])

  // Xử lý registration error
  useEffect(() => {
    if (registrationError) {
      // Error đã được handle trong slice, chỉ cần log
      if (
        typeof registrationError === "string" &&
        registrationError.includes("400")
      ) {
        showWarning(
          "Registration Failed",
          "You are already registered for this course or registration is closed."
        )
      } else if (
        typeof registrationError === "string" &&
        registrationError.includes("401")
      ) {
        showError(
          "Authentication Error",
          "Your session has expired. Please login again."
        )
      } else if (
        typeof registrationError === "string" &&
        registrationError.includes("403")
      ) {
        showError(
          "Access Denied",
          "You don't have permission to register for this course."
        )
      } else if (
        registrationError.includes("404") ||
        registrationError.toLowerCase().includes("not found")
      ) {
        return
      } else {
        showError("Registration Failed", registrationError)
      }
    }
  }, [registrationError, showError, showWarning])

  const handleRegisterCourse = async () => {
    if (!id || isRegistering) return

    if (!userId) {
      showWarning("Login Required", "Please login to register for this course.")
      navigate("/login")
      return
    }

    showInfo(
      "Processing Registration",
      "Please wait while we process your registration..."
    )

    try {
      await dispatch(registerForCourse({ userId, courseId: id })).unwrap()

      showSuccess(
        "Registration Successful! 🎉",
        "You have successfully registered for this course. You can now access the course materials."
      )
    } catch (error: any) {
      console.error("Error registering course:", error)

      // Error đã được handle trong slice, chỉ cần log
      if (typeof error === "string" && error.includes("400")) {
        showError(
          "Registration Failed",
          "You are already registered for this course or registration is closed."
        )
      } else if (typeof error === "string" && error.includes("401")) {
        showError(
          "Authentication Error",
          "Your session has expired. Please login again."
        )
      } else if (typeof error === "string" && error.includes("403")) {
        showError(
          "Access Denied",
          "You don't have permission to register for this course."
        )
      }
    }
  }

  const getRegisterButtonText = () => {
    if (isRegistering) return "Registering..."

    if (
      courseRegistration &&
      courseRegistration.learningStatus !== LearningStatus.CLOSED
    ) {
      switch (Number(courseRegistration.learningStatus)) {
        case LearningStatus.COMPLETED:
          return "Complete"
        case LearningStatus.IN_PROCESS:
          return "Continue Learning"
        default:
          return "Register now"
      }
    }

    return "Register now"
  }

  const isRegisterDisabled = () => {
    return (
      isRegistering ||
      courseRegistration?.learningStatus === LearningStatus.COMPLETED
    )
  }

  const getButtonClass = () => {
    let baseClass = "register-course-button"

    if (isRegistering) {
      baseClass += " loading"
    }

    if (
      courseRegistration &&
      courseRegistration.learningStatus !== LearningStatus.CLOSED
    ) {
      baseClass += " registered"
    }

    return baseClass
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading course details...</p>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="error">
        <h2>Course Not Found</h2>
        <p>The course you're looking for doesn't exist or has been removed.</p>
        <BackLink />
      </div>
    )
  }

  return (
    <div className="course-detail">
      {/* Header with BackLink */}
      <div className="course-header">
        <div className="back-link-container">
          <BackLink />
        </div>
        <h1>{course.title}</h1>
        <p>{course.contentSummary}</p>
        <div className="register-btn-container">
          <button
            className={getButtonClass()}
            onClick={handleRegisterCourse}
            disabled={isRegisterDisabled()}
          >
            {getRegisterButtonText()}
          </button>
        </div>
      </div>

      {/* About This Course Section */}
      <div className="course-content-summary">
        <h2>About This Course</h2>
        <p>{course.description}</p>
      </div>

      {/* Course Content Section */}
      <div className="course-content-blocks">
        <h2>Course content</h2>
        {courseContent.length > 0 ? (
          <div className="course-content-grid">
            {courseContent.map((contentItem, idx) => (
              <CourseSpecifies
                key={contentItem.courseContentID || idx}
                title={contentItem.title}
                desc={contentItem.content}
                className="course-content-item"
              />
            ))}
          </div>
        ) : (
          <div className="no-content">
            <p>Course content will be available soon.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CourseDetailPage
