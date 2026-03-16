import "./Result.scss"
import type { Answers } from "../../types/interfaces/Assessments"
import CourseBox from "../CourseBox/CourseBox"
import BlogsBox from "../BlogsBox/BlogsBox"
import type { Courses } from "../../types/interfaces/Courses"
import type { Blogs } from "../../types/interfaces/Blogs"
import type { RootState } from "../../redux/store"
import { useSelector, useDispatch } from "react-redux"
import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import ConsultantSwiper from "../ConsultantSwiper/ConsultantSwiper"
import {
  fetchConsultants,
  selectConsultants,
  selectConsultantsLoading,
} from "../../redux/slices/consultantSlice"
import { getBlogsList } from "../../services/blogAPI"
import type { AppDispatch } from "../../redux/store"

interface ResultProps {
  answers: Answers[]
  result?: {
    score?: number
    resultLevel?: number
  }
  recommend?: any
  onRestart: () => void
}

const Result: React.FC<ResultProps> = ({
  answers,
  result,
  recommend,
  onRestart,
}) => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()

  // State for blogs
  const [blogs, setBlogs] = useState<Blogs[]>([])
  const [blogsLoading, setBlogsLoading] = useState(false)

  // Redux selectors
  const consultants = useSelector(selectConsultants)
  const consultantsLoading = useSelector(selectConsultantsLoading)

  // Fetch consultants if not already loaded
  useEffect(() => {
    if (!consultants || consultants.length === 0) {
      dispatch(fetchConsultants())
    }
  }, [consultants, dispatch])

  const totalScore =
    typeof result?.score === "number"
      ? result.score
      : answers.reduce((sum, answer) => sum + (answer.score || 0), 0)

  const riskLevel =
    result?.resultLevel || (totalScore <= 3 ? 1 : totalScore <= 24 ? 2 : 3)

  // Fetch blogs based on risk level
  useEffect(() => {
    setBlogsLoading(true)
    getBlogsList()
      .then((response) => {
        const allBlogs = response.data || []
        // Filter blogs based on risk level - get blogs that match the current risk level
        const filteredBlogs = allBlogs
          .filter(
            (blog: Blogs) =>
              Number(blog.resultLevel) === riskLevel || !blog.resultLevel
          )
          .slice(0, 4) // Limit to 4 blogs
        setBlogs(filteredBlogs)
      })
      .catch((error) => {
        console.error("Error fetching blogs:", error)
        setBlogs([])
      })
      .finally(() => setBlogsLoading(false))
  }, [riskLevel])

  const { registrations } = useSelector(
    (state: RootState) => state.courseRegistration
  )
  // Màu sắc theo riskLevel
  const levelColorMap: Record<number, string> = {
    1: "#4CAF50",
    2: "#FFC107",
    3: "#F44336",
  }
  const riskColor = levelColorMap[riskLevel] || "#333"

  // Lấy danh sách courses từ recommend (nếu có)
  let courses: Courses[] = []
  if (recommend && Array.isArray(recommend) && recommend.length > 0) {
    courses = recommend[0].courses || []
  }

  const levelText = (resultLevel: number) => {
    switch (resultLevel) {
      case 1:
        return { text: "Low", type: "low" }
      case 2:
        return { text: "Moderate", type: "moderate" }
      case 3:
        return { text: "High", type: "high" }
      default:
        return { text: "Unknown", type: "unknown" }
    }
  }

  const getCourseRegistration = (courseId: string) => {
    return registrations[courseId]
  }

  const handleCourseClick = (courseId: string) => {
    navigate(`/course/${courseId}`)
  }

  return (
    <div className="result-container">
      <h2 className="result-title">Assessment Results</h2>

      <div className="result-score">
        <div className="score-circle" style={{ borderColor: riskColor }}>
          <span className="score-value">{totalScore}</span>
          <span className="score-label">Total Score</span>
        </div>
      </div>

      <div className="risk-level" style={{ color: riskColor }}>
        Risk Level: {levelText(riskLevel).text}
      </div>

      <div className="result-advice">
        <h3 className="result-advice__title">Recommendations</h3>
        {/* Render course recommendations */}
        {courses.length > 0 && (
          <div className="recommended-courses">
            <h4 className="recommended-courses__title">Recommended Courses</h4>
            <div className={`courses-grid grid-${courses.length}`}>
              {courses.map((course) => (
                <CourseBox
                  key={course.courseId}
                  course={course}
                  courseRegistration={getCourseRegistration(course.courseId)}
                  onClick={() => handleCourseClick(course.courseId)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Blog Recommendations */}
        {blogs.length > 0 && (
          <div className="recommended-blogs">
            <h4 className="recommended-blogs__title">Recommended Articles</h4>
            <div className="blogs-grid">
              {blogsLoading ? (
                <div>Loading articles...</div>
              ) : (
                blogs.map((blog) => (
                  <BlogsBox
                    key={blog.blogID}
                    blog={blog}
                    onClick={() => navigate(`/blog/${blog.blogID}`)}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {/* Consultant Section - Only show for High risk level */}
        {riskLevel === 3 && (
          <div className="recommended-consultants">
            <h2 className="recommended-consultants__title">
              Meet Our Expert Consultants
            </h2>
            {consultantsLoading ? (
              <div>Loading consultants...</div>
            ) : (
              <ConsultantSwiper consultants={consultants} />
            )}
          </div>
        )}
      </div>

      <button className="restart-button" onClick={onRestart}>
        Take Test Again
      </button>
    </div>
  )
}

export default Result
