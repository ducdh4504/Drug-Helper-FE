import React, { useState } from "react"
import { Tabs, Card } from "antd"
import { BookOutlined, FileTextOutlined } from "@ant-design/icons"
import AssessmentManageBoard from "../../components/AssessmentManageBoard/AssessmentManageBoard"
import QuestionManageBoard from "../../components/QuestionManageBoard/QuestionManageBoard"
import "./StaffAssessmentManagement.scss"

const StaffAssessmentManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState("assessments")

  const handleTabChange = (key: string) => {
    setActiveTab(key)
  }

  const tabItems = [
    {
      key: "assessments",
      label: (
        <span className="tab-title">
          <FileTextOutlined />
          Assessments
        </span>
      ),
      children: (
        <div className="tab-content">
          <AssessmentManageBoard />
        </div>
      ),
    },
    {
      key: "questions",
      label: (
        <span className="tab-title">
          <BookOutlined />
          Questions
        </span>
      ),
      children: (
        <div className="tab-content">
          <QuestionManageBoard />
        </div>
      ),
    },
  ]

  return (
    <div className="staff-assessment-management-container">
      <Card className="main-container-card">
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          type="card"
          size="large"
          className="management-tabs"
          items={tabItems}
        />
      </Card>
    </div>
  )
}

export default StaffAssessmentManagement
