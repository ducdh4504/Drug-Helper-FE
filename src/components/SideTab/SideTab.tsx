import React from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { useSelector } from "react-redux"
import type { RootState } from "../../redux/store"
import { FiLock } from "react-icons/fi"
import { PiChartLine } from "react-icons/pi"
import { GrWorkshop } from "react-icons/gr"
import { FiBookOpen } from "react-icons/fi"
import { RiSurveyLine } from "react-icons/ri"
import { PiExamThin } from "react-icons/pi"
import { PiNewspaperThin } from "react-icons/pi"
import { FaUser } from "react-icons/fa"
import { RiCalendarScheduleLine } from "react-icons/ri"
import { HiOutlineAcademicCap } from "react-icons/hi"
import "./SideTab.scss"
import { UserRole } from "../../types/enums/UserRoleEnum"

interface SideTabProps {
  isOpen?: boolean
}

interface SideTabItem {
  id: string
  title: string
  icon: string | React.ReactNode
  path: string
  allowedRoles: string[]
  isLocked?: boolean
}

const sideTabItems: SideTabItem[] = [
  {
    id: "schedule",
    title: "Schedule",
    icon: <RiCalendarScheduleLine />,
    path: "/consultant/schedule",
    allowedRoles: [UserRole.CONSULTANT],
  },
  {
    id: "certificates",
    title: "Certificates",
    icon: <HiOutlineAcademicCap />,
    path: "/consultant/certificates",
    allowedRoles: [UserRole.CONSULTANT],
  },
  {
    id: "communicate",
    title: "Communicate program",
    icon: <GrWorkshop />,
    path: "/staff/program",
    allowedRoles: [UserRole.MANAGER, UserRole.STAFF],
  },
  {
    id: "survey",
    title: "Survey",
    icon: <RiSurveyLine />,
    path: "/staff/survey",
    allowedRoles: [UserRole.MANAGER, UserRole.STAFF],
  },
  {
    id: "course",
    title: "Course",
    icon: <FiBookOpen />,
    path: "/staff/course",
    allowedRoles: [UserRole.MANAGER, UserRole.STAFF],
  },

  {
    id: "assessments",
    title: "Assessments",
    icon: <PiExamThin />,
    path: "/staff/assessments",
    allowedRoles: [UserRole.MANAGER, UserRole.STAFF],
  },
  {
    id: "blogs",
    title: "Blogs",
    icon: <PiNewspaperThin />,
    path: "/staff/blogs",
    allowedRoles: [UserRole.MANAGER, UserRole.STAFF],
  },
  {
    id: "dashboard",
    title: "Dashboard",
    icon: <PiChartLine />,
    path: "/manager/dashboard",
    allowedRoles: [UserRole.MANAGER],
  },
  {
    id: "users",
    title: "Users",
    icon: <FaUser />,
    path: "/admin/users",
    allowedRoles: [UserRole.ADMIN],
  },
]

const SideTab: React.FC<SideTabProps> = ({ isOpen = true }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const role = useSelector((state: RootState) => state.auth.role)

  const handleItemClick = (item: SideTabItem) => {
    if (!role || !item.allowedRoles.includes(role)) {
      return
    }

    if (item.isLocked) {
      return
    }

    navigate(item.path)
  }

  const isItemAccessible = (item: SideTabItem) => {
    return !!role && item.allowedRoles.includes(role) && !item.isLocked
  }

  const isItemActive = (item: SideTabItem) => {
    return location.pathname === item.path
  }

  const isItemLocked = (item: SideTabItem) => {
    return !role || !item.allowedRoles.includes(role) || item.isLocked
  }

  return (
    <div className={`side-tab ${isOpen ? "open" : "closed"}`}>
      <div className="side-tab-content">
        {sideTabItems.map((item) => (
          <div
            key={item.id}
            className={`
                side-tab-item ${isItemActive(item) ? "active" : ""} 
                ${isItemLocked(item) ? "locked" : ""} 
                ${isItemAccessible(item) ? "accessible" : ""}
            `}
            onClick={() => handleItemClick(item)}
          >
            <div className="item-icon">
              {isItemLocked(item) ? <FiLock /> : item.icon}
            </div>
            <div className="item-title">{item.title}</div>
            {isItemActive(item) && <div className="active-indicator" />}
          </div>
        ))}
      </div>
    </div>
  )
}

export default SideTab
