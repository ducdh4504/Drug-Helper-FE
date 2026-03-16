import type {
  Courses,
  CourseRegistrations,
} from "../../types/interfaces/Courses"
import { LearningStatus } from "../../types/enums/LearningStatusEnum"
import "./CourseBox.scss"
import { fallbackCoursesImages } from "../../utils/helpers/firebaseUpload"

interface CourseBoxProps {
  course: Courses
  courseRegistration: CourseRegistrations | null
  onClick?: () => void
}

const CourseBox: React.FC<CourseBoxProps> = ({
  course,
  courseRegistration,
  onClick,
}) => {
  const learningStatusButton = () => {
    switch (courseRegistration?.learningStatus) {
      case LearningStatus.IN_PROCESS:
        return (
          <button className="inprogress-button">
            <h4>In process</h4>
          </button>
        )
      case LearningStatus.COMPLETED:
        return (
          <button className="complete-button">
            <h4>Completed</h4>
          </button>
        )
      default:
        return <button className="register-button">Register</button>
    }
  }

  const courseStatus = (status: number) => {
    switch (status) {
      case 0:
        return { text: "Open", type: "open" }
      case 1:
        return { text: "Closed", type: "closed" }
      default:
        return { text: "Unknown", type: "unknown" }
    }
  }

  const renderStatusBadge = () => {
    if (course.status === undefined) {
      return null
    }

    const status = courseStatus(Number(course.status))
    return (
      <div className={`course-status-badge ${status.type}`}>
        <span className="status-dot"></span>
        <span className="status-text">{status.text}</span>
      </div>
    )
  }

  // Lấy ảnh chính hoặc fallback nếu không có
  const imgUrl =
    course.imgUrl && course.imgUrl.startsWith("http")
      ? course.imgUrl
      : fallbackCoursesImages[
          Math.floor(Math.random() * fallbackCoursesImages.length)
        ]

  return (
    <div className="container-course-box">
      <div
        className="image"
        style={{ backgroundImage: `url(${imgUrl})` }}
        role="img"
        aria-label={course.title}
      />
      <div className="course-info">
        <h2 className="course-title">{course.title}</h2>
        <p className="course-description">{course.description}</p>
        {courseRegistration?.learningStatus !== LearningStatus.COMPLETED &&
          course.status !== undefined &&
          renderStatusBadge()}
      </div>
      <div className="status-button-containter" onClick={onClick}>
        {learningStatusButton()}
      </div>
    </div>
  )
}

export default CourseBox
