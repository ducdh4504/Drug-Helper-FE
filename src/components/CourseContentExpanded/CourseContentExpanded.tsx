import React from "react"
import { Button, Typography, List, Empty, Spin, Space } from "antd"
import { PlusOutlined } from "@ant-design/icons"
import type { Courses, CourseContent } from "../../types/interfaces/Courses"
import "./CourseContentExpanded.scss"

const { Title, Text } = Typography

interface CourseContentExpandedProps {
  course: Courses
  courseContent: CourseContent[]
  isLoading: boolean
  onManageContent: (course: Courses) => void
}

const CourseContentExpanded: React.FC<CourseContentExpandedProps> = ({
  course,
  courseContent,
  isLoading,
  onManageContent,
}) => {
  if (isLoading) {
    return (
      <div className="course-content-expanded-loading">
        <Spin size="small" />
        <Text style={{ marginLeft: 8 }}>Loading course content...</Text>
      </div>
    )
  }

  if (courseContent.length === 0) {
    return (
      <div className="course-content-expanded-empty">
        <Empty
          description="No course content available"
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          <Button
            type="primary"
            size="small"
            onClick={() => onManageContent(course)}
          >
            Add Content
          </Button>
        </Empty>
      </div>
    )
  }

  return (
    <div className="course-content-expanded-container">
      <div className="course-content-expanded-header">
        <Title level={5} style={{ margin: 0 }}>
          Course Content ({courseContent.length} items)
        </Title>
        <Button
          type="primary"
          size="small"
          icon={<PlusOutlined />}
          onClick={() => onManageContent(course)}
        >
          Manage Content
        </Button>
      </div>

      <List
        className="course-content-expanded-list"
        size="small"
        dataSource={courseContent}
        renderItem={(content, index) => (
          <List.Item key={content.courseContentID}>
            <List.Item.Meta
              title={
                <Space>
                  <Text strong>{index + 1}.</Text>
                  <Text strong>{content.title}</Text>
                </Space>
              }
              description={
                <Text ellipsis style={{ maxWidth: 800 }}>
                  {content.content}
                </Text>
              }
            />
          </List.Item>
        )}
      />
    </div>
  )
}

export default CourseContentExpanded
