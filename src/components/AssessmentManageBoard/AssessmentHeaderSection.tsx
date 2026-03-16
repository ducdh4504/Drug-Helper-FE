import React from "react"
import { Button, Typography } from "antd"
import { PlusOutlined } from "@ant-design/icons"

const { Title } = Typography

interface AssessmentHeaderSectionProps {
  onAdd: () => void
}

const AssessmentHeaderSection: React.FC<AssessmentHeaderSectionProps> = ({
  onAdd,
}) => (
  <div
    style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    }}
  >
    <Title level={2} style={{ margin: 0 }}>
      Assessment Management
    </Title>
    <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
      Add New Assessment
    </Button>
  </div>
)

export default AssessmentHeaderSection
