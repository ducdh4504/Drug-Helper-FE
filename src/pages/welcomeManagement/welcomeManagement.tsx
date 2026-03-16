import React from "react"
import { useSelector } from "react-redux"
import { Typography, Avatar } from "antd"
import { UserOutlined } from "@ant-design/icons"
import type { RootState } from "../../redux/store"
import { UserRole } from "../../types/enums/UserRoleEnum"
import "./welcomeManagement.scss"

const { Title } = Typography

const WelcomeManagement: React.FC = () => {
  const { role } = useSelector((state: RootState) => state.auth)

  const getRoleDisplayName = (userRole?: string) => {
    switch (userRole) {
      case UserRole.ADMIN:
        return "Administrator"
      case UserRole.MANAGER:
        return "Manager"
      case UserRole.STAFF:
        return "Staff"
      case UserRole.CONSULTANT:
        return "Consultant"
      default:
        return "User"
    }
  }

  const getWelcomeMessage = (userRole?: string) => {
    switch (userRole) {
      case UserRole.ADMIN:
        return (
          <>
            <h4>Welcome to the administrative panel.</h4>
            <p>
              You have full system access to manage all aspects of the platform.
            </p>
          </>
        )
      case UserRole.MANAGER:
        return (
          <>
            <h4>Welcome to the management dashboard.</h4>
            <p>
              You can oversee staff activities, manage programs, and ensure
              smooth operations.
            </p>
          </>
        )
      case UserRole.STAFF:
        return (
          <>
            <h4>Welcome to your workspace.</h4>
            <p>Manage content, programs, and user support activities.</p>
          </>
        )
      case UserRole.CONSULTANT:
        return (
          <>
            <h4>Welcome to your consultation center.</h4>
            <p>Manage your schedule, clients, and professional services.</p>
          </>
        )
      default:
        return (
          <>
            <h4>Welcome to the management system.</h4>
          </>
        )
    }
  }

  return (
    <div className="welcome-management-page">
      <div className="welcome-content">
        <Avatar size={80} icon={<UserOutlined />} className="welcome-avatar" />
        <div className="welcome-text">
          <Title level={1} className="welcome-title">
            Welcome, {getRoleDisplayName(role)}!
          </Title>
          <div className="welcome-description">{getWelcomeMessage(role)}</div>
        </div>
      </div>
    </div>
  )
}

export default WelcomeManagement
