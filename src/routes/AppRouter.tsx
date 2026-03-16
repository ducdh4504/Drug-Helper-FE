import { BrowserRouter, Route, Routes } from "react-router-dom"
import { useProtectedRoute } from "../hooks/useProtectedRoute"
import ProtectedRoute from "../components/ProtectedRoute/ProtectedRoute"

// Import admin pages
import MainLayout from "../layouts/MainLayout"
import HomePage from "../pages/homepage/homepage"
import AboutUs from "../pages/about-us/AboutUs"
import Login from "../pages/login/login"
import Register from "../pages/register/register"
import Profile from "../pages/profile/Profile"
import StaffProfile from "../pages/profile/staffProfile"
import ForgotPassword from "../pages/forgotPassword/ForgotPassword"
import ResetPassword from "../pages/forgotPassword/ResetPassword"
import EmailVerification from "../pages/auth-action/EmailVerification"
import CourseCatalog from "../pages/courseCatalog/courseCatalog"
import CourseDetailPage from "../pages/coursedetail/CourseDetailPage"
import ConsultantPage from "../pages/consultantPage/ConsultantPage"
import ConsultantDetailPage from "../pages/consultantDetail/ConsultantDetailPage"

// Import admin pages
import AdminLayout from "../layouts/AdminLayout/AdminLayout"
import StaffCourseManagement from "../pages/StaffCourseManagement/staffCourseManagement"
import StaffAssessmentManagement from "../pages/StaffAssessmentManagement/staffAssessmentManagement"
import StaffSurveyManagement from "../pages/StaffSurveyManagement/StaffSurveyManagement"
import StaffProgramManagement from "../pages/StaffProgramManagement/StaffProgramManagement"
import BlogsCatalog from "../pages/blog/BlogCatalog"
import BlogDetail from "../pages/blog/BlogDetail"
import CommunicationProgram from "../pages/communicationProgram/CommunicationProgram"
import ProgramRegister from "../pages/ProgramRegister/ProgramRegister"
import WelcomeManagement from "../pages/welcomeManagement/welcomeManagement"
import StaffBlogManagement from "../pages/staffBlogManagement/staffBlogManagement"
import TestPage from "../pages/testpage/testpage"
import AdminUserManagement from "../pages/adminUserManagement/AdminUserManagement"
import CertificateManagement from "../pages/certificateManagement/certificateManagement"
import Dashboard from "../pages/dashboard/Dashboard"
import ScheduleManagement from "../pages/scheduleManagement/ScheduleManagement"

export default function AppRouter() {
  const { isAdmin, isConsultant, isStaff, isManager } = useProtectedRoute()

  return (
    <BrowserRouter>
      <Routes>
        {/* Main Layout - For public pages */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about-us" element={<AboutUs />} />
          <Route path="profile" element={<Profile />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="forgetpassword" element={<ForgotPassword />} />
          <Route path="resetpassword" element={<ResetPassword />} />
          <Route path="course-catalog" element={<CourseCatalog />} />
          <Route path="course/:id" element={<CourseDetailPage />} />
          <Route path="consultants" element={<ConsultantPage />} />
          <Route path="consultant/:id" element={<ConsultantDetailPage />} />
          <Route path="blog" element={<BlogsCatalog />} />
          <Route path="blog/:id" element={<BlogDetail />} />
          <Route path="program" element={<CommunicationProgram />} />
          <Route
            path="program-register/:programId"
            element={<ProgramRegister />}
          />
          <Route path="/email-verification" element={<EmailVerification />} />
          <Route path="test" element={<TestPage />} />
        </Route>

        {/* For staff  */}
        <Route
          path="/staff"
          element={
            <ProtectedRoute
              isAllowed={isStaff || isManager}
              redirectPath="/login"
            >
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<WelcomeManagement />} />
          <Route path="profile" element={<StaffProfile />} />
          <Route path="course" element={<StaffCourseManagement />} />
          <Route path="assessments" element={<StaffAssessmentManagement />} />
          <Route path="blogs" element={<StaffBlogManagement />} />
          <Route path="survey" element={<StaffSurveyManagement />} />
          <Route path="program" element={<StaffProgramManagement />} />
        </Route>

        {/* Consultant */}
        <Route
          path="/consultant"
          element={
            <ProtectedRoute isAllowed={isConsultant} redirectPath="/login">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<WelcomeManagement />} />
          <Route path="profile" element={<StaffProfile />} />
          <Route path="schedule" element={<ScheduleManagement />} />
          <Route path="certificates" element={<CertificateManagement />} />
        </Route>

        {/* For manager  */}
        <Route
          path="/manager"
          element={
            <ProtectedRoute isAllowed={isManager} redirectPath="/login">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<WelcomeManagement />} />
          <Route path="profile" element={<StaffProfile />} />
          <Route path="dashboard" element={<Dashboard />} />
        </Route>

        {/* For admin  */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute isAllowed={isAdmin} redirectPath="/login">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<WelcomeManagement />} />
          <Route path="profile" element={<StaffProfile />} />
          <Route path="users" element={<AdminUserManagement />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
