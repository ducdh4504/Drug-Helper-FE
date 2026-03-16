import "./homepage.scss"
import { useState, useEffect } from "react"
import { Element, scroller } from "react-scroll"
import { useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import type { RootState, AppDispatch } from "../../redux/store"
import { fetchCourses } from "../../redux/slices/courseSlice"
import {
  fetchConsultants,
  selectConsultants,
  selectConsultantsLoading,
} from "../../redux/slices/consultantSlice"
import { fetchUserRegistrations } from "../../redux/slices/courseRegistrationSlice"
import ConsultantSwiper from "../../components/ConsultantSwiper/ConsultantSwiper"
import CourseBox from "../../components/CourseBox/CourseBox"
import BlogsBox from "../../components/BlogsBox/BlogsBox"
import { LearningStatus } from "../../types/enums/LearningStatusEnum"
import { getBlogsList } from "../../services/blogAPI"

const sections = [
  {
    id: "hero",
    title: "Welcome",
    description: "Overview of our drug prevention services and mission",
  },
  {
    id: "assessment",
    title: "Self Assessment",
    description: "Take a confidential test to check your addiction level",
  },
  {
    id: "courses",
    title: "Educational Courses",
    description: "Join our comprehensive anti-drug programs",
  },
  {
    id: "new-release",
    title: "Latest News",
    description: "Stay updated with recent research and developments",
  },
  {
    id: "consultant",
    title: "Expert Consultants",
    description: "Connect with our professional addiction specialists",
  },
]

const HomePage = () => {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  // Redux selectors
  const { courseList: courses, loading: coursesLoading } = useSelector(
    (state: RootState) => state.courses
  )
  const { registrations } = useSelector(
    (state: RootState) => state.courseRegistration
  )
  const consultants = useSelector(selectConsultants)
  const consultantsLoading = useSelector(selectConsultantsLoading)
  const userId =
    useSelector((state: RootState) => state.auth.userId) || "temp-user-id"

  // Local state (chỉ giữ lại những cái cần thiết)
  const [activeSection, setActiveSection] = useState("hero")
  const [showGuide, setShowGuide] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [blogs, setBlogs] = useState<any[]>([])
  const [blogsLoading, setBlogsLoading] = useState<boolean>(true)

  useEffect(() => {
    dispatch(fetchCourses())
    dispatch(fetchConsultants())
    setIsLoaded(true)

    if (userId && userId !== "temp-user-id") {
      dispatch(fetchUserRegistrations(userId))
    }

    getBlogsList()
      .then((res) => {
        setBlogs(Array.isArray(res.data) ? res.data.slice(0, 4) : [])
      })
      .catch(() => setBlogs([]))
      .finally(() => setBlogsLoading(false))
  }, [dispatch, userId])

  const getCourseRegistration = (courseId: string) => {
    return (
      registrations[courseId] || {
        userID: userId,
        courseID: courseId,
        registerTime: "",
        learningStatus: LearningStatus.CLOSED,
      }
    )
  }

  const scrollToSection = (sectionId: string) => {
    scroller.scrollTo(sectionId, {
      duration: 800,
      delay: 0,
      smooth: "easeInOutQuart",
      offset: -50,
    })
  }

  const handleGetStarted = () => {
    setShowGuide(true)
    setActiveSection("assessment")
    scrollToSection("assessment")
  }

  const handleNextSection = () => {
    const currentIndex = sections.findIndex(
      (section) => section.id === activeSection
    )
    if (currentIndex < sections.length - 1) {
      const nextSection = sections[currentIndex + 1]
      setActiveSection(nextSection.id)
      scrollToSection(nextSection.id)
    } else {
      setShowGuide(false)
      scroller.scrollTo("hero", {
        duration: 900,
        delay: 0,
        smooth: "easeInOutQuart",
        offset: -100,
      })
    }
  }

  const handleExploreCourses = () => {
    navigate("/course-catalog")
  }

  const handleBookConsultant = () => {
    navigate("/booking")
  }

  const handleCourseClick = (courseId: string) => {
    navigate(`/course/${courseId}`)
  }

  const topCourses = courses.slice(0, 3)

  return (
    <div className={`home-page ${isLoaded ? "loaded" : ""}`}>
      {/* Guide Box */}
      {showGuide && (
        <div className="guide-box">
          <div className="guide-box__content">
            <div className="guide-box__header">
              <span className="guide-box__number">
                {sections.findIndex((section) => section.id === activeSection) +
                  1}
              </span>
              <h4>
                {
                  sections.find((section) => section.id === activeSection)
                    ?.title
                }
              </h4>
            </div>
            <p>
              {
                sections.find((section) => section.id === activeSection)
                  ?.description
              }
            </p>
            <button className="guide-box__next" onClick={handleNextSection}>
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <Element name="hero" className="hero">
        <div className="container hero__container">
          <div className="hero__content">
            <h1>Preventing drug use with effective solutions</h1>
            <p>
              We provide trusted information, self-assessment tools, and support
              resources to help individuals, families, and communities prevent
              drug abuse and build a healthier future.
            </p>
            <div className="hero__actions">
              <button className="btn btn-primary" onClick={handleGetStarted}>
                Get Started →
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => navigate("/about-us")}
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </Element>

      {/* Self-assessment Section */}
      <Element name="assessment" className="assessment">
        <div className="assessment__container">
          <div className="assessment__image">
            <img
              src="https://firebasestorage.googleapis.com/v0/b/drug-helper-1c86b.firebasestorage.app/o/otherImage%2FassessmentHomepage.png?alt=media&token=394fcef8-725c-461c-a0d2-4a248bc3d5cd"
              alt="Self assessment illustration"
            />
          </div>
          <div className="assessment__content">
            <h2>How addicted are you?</h2>
            <p>
              Take our confidential self-assessment to understand your
              relationship with substances. This tool provides insights into
              your current situation and helps identify if you might benefit
              from support or professional help.
            </p>
            <button
              className="btn btn-primary"
              onClick={() => navigate("/test")}
            >
              Take Assessment →
            </button>
          </div>
        </div>
      </Element>

      {/* Course Section */}
      <Element name="courses" className="courses">
        <div className="courses__container">
          <h2 className="courses__title">Educational Courses</h2>
          <div className="courses__list">
            {coursesLoading ? (
              <div className="loading">
                <div className="loading-spinner"></div>
                <p>Loading courses...</p>
              </div>
            ) : (
              topCourses.map((course, index) => (
                <div
                  key={course.courseId}
                  className="course-item"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CourseBox
                    key={course.courseId}
                    course={course}
                    courseRegistration={getCourseRegistration(course.courseId)}
                    onClick={() => handleCourseClick(course.courseId)}
                  />
                </div>
              ))
            )}
          </div>
          <div className="courses__more">
            <button
              className="btn btn-secondary"
              onClick={handleExploreCourses}
            >
              Explore All Courses →
            </button>
          </div>
        </div>
      </Element>

      {/* New Release Section */}
      <Element name="new-release" className="new-release">
        <div className="container">
          <h2>Latest News & Research</h2>
          <div className="new-release__list">
            {blogsLoading ? (
              <div>Loading blogs...</div>
            ) : blogs.length === 0 ? (
              <div>No blogs found.</div>
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
          <div className="new-release__more">
            <button
              className="view-all-link"
              type="button"
              onClick={() => navigate("/blog")}
            >
              View All Blogs →
            </button>
          </div>
        </div>
      </Element>

      {/* Consultant Section */}
      <Element name="consultant" className="consultant">
        <div className="container">
          <h2>Meet Our Expert Consultants</h2>
          {consultantsLoading ? (
            <div>Loading consultants...</div>
          ) : (
            <ConsultantSwiper consultants={consultants} />
          )}
          <div className="consultant__booking">
            <button className="btn btn-primary" onClick={handleBookConsultant}>
              Book Consultation →
            </button>
          </div>
        </div>
      </Element>
    </div>
  )
}

export default HomePage
