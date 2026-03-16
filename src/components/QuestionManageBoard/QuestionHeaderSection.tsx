import React from "react"
import { Button, Typography } from "antd"
import { PlusOutlined, BookOutlined } from "@ant-design/icons"

const { Title } = Typography

interface HeaderSectionProps {
  onAdd: () => void
}

const HeaderSection: React.FC<HeaderSectionProps> = ({ onAdd }) => (
  <div className="header-section">
    <div className="title-section">
      <BookOutlined className="title-icon" />
      <Title level={2} className="main-title">
        Question Management
      </Title>
    </div>
    <Button
      type="primary"
      icon={<PlusOutlined />}
      onClick={onAdd}
      className="add-btn"
      size="large"
    >
      Add New Question
    </Button>
  </div>
)

export default HeaderSection
