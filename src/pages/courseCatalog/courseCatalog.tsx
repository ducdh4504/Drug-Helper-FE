import React, { useState, useEffect, useMemo } from "react"
import { useSelector, useDispatch } from "react-redux"
import SearchBar from "../../components/Search/SearchBar"
import CourseBox from "../../components/CourseBox/CourseBox"
import type { CourseRegistrations } from "../../types/interfaces/Courses"
import "./courseCatalog.scss"
import type { AppDispatch, RootState } from "../../redux/store"
import { fetchCourses } from "../../redux/slices/courseSlice"
import { fetchUserRegistrations } from "../../redux/slices/courseRegistrationSlice"
import { useNavigate } from "react-router-dom"

const CourseCatalog: React.FC = () => {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")

  const dispatch = useDispatch<AppDispatch>()
  const { courseList: courses, loading: coursesLoading } = useSelector(
    (state: RootState) => state.courses
  )
  const userId = useSelector((state: RootState) => state.auth.userId)
  const { userRegistrations, loading: regLoading } = useSelector(
    (state: RootState) => state.courseRegistration
  )

  useEffect(() => {
    dispatch(fetchCourses())
  }, [dispatch])

  useEffect(() => {
    if (userId) {
      dispatch(fetchUserRegistrations(userId))
    }
  }, [dispatch, userId])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  const handleCourseClick = (courseId: string) => {
    navigate(`/course/${courseId}`)
  }

  const filteredCourses = useMemo(() => {
    if (!searchTerm.trim()) return courses
    return courses.filter(
      (course) =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [courses, searchTerm])

  const getCourseRegistration = (
    courseId: string
  ): CourseRegistrations | undefined => {
    const response = userRegistrations.find((reg) => {
      return reg.courseId === courseId
    })
    return response
  }

  return (
    <div className="course-catalog-page">
      <SearchBar onSearch={handleSearch} initialValue={searchTerm} />

      <main className="course-catalog-main">
        <div className="course-catalog-container">
          <h2 className="section-title">Courses</h2>

          {coursesLoading || regLoading ? (
            <div className="loading-container">
              <div className="loading-grid">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="course-skeleton">
                    <div className="skeleton-image"></div>
                    <div className="skeleton-content">
                      <div className="skeleton-title"></div>
                      <div className="skeleton-description"></div>
                      <div className="skeleton-description"></div>
                      <div className="skeleton-button"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="courses-grid">
              {filteredCourses.map((course, index) => (
                <div
                  key={course.courseId}
                  className="course-item"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CourseBox
                    key={course.courseId}
                    course={course}
                    courseRegistration={
                      getCourseRegistration(course.courseId) ?? null
                    }
                    onClick={() => {
                      handleCourseClick(course.courseId)
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {!coursesLoading && !regLoading && filteredCourses.length === 0 && (
            <div className="no-results">
              <div className="no-results-content">
                <h3>No courses found</h3>
                <p>
                  Try adjusting your search terms or browse all available
                  courses.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default CourseCatalog
