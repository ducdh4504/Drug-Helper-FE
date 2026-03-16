import React, { useEffect, useState } from "react"
import {
  Modal,
  Form,
  Input,
  Button,
  Space,
  List,
  Card,
  message,
  Typography,
  Divider,
  Popconfirm,
} from "antd"
import {
  PlusOutlined,
  EditOutlined,
  SaveOutlined,
  DeleteOutlined,
} from "@ant-design/icons"
import type { CourseContent } from "../../types/interfaces/Courses"
import {
  getCourseContent,
  createCourseContent,
  updateCourseContent,
  deleteCourseContent,
} from "../../services/courseAPI"

const { Title, Text } = Typography
const { TextArea } = Input

interface CourseContentModalProps {
  visible: boolean
  courseId: string | null
  courseName: string
  onCancel: () => void
}

interface ContentFormData {
  title: string
  content: string
}

const CourseContentModal: React.FC<CourseContentModalProps> = ({
  visible,
  courseId,
  courseName,
  onCancel,
}) => {
  const [contents, setContents] = useState<CourseContent[]>([])
  const [loading, setLoading] = useState(false)
  const [editingContent, setEditingContent] = useState<CourseContent | null>(
    null
  )
  const [showForm, setShowForm] = useState(false)
  const [form] = Form.useForm()

  const fetchContents = async () => {
    if (!courseId) return

    setLoading(true)
    try {
      const response = await getCourseContent(courseId)
      setContents(response.data || [])
    } catch (error) {
      console.error("Error fetching course contents:", error)
      setContents([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (visible && courseId) {
      fetchContents()
    }
  }, [visible, courseId])

  const handleSubmit = async (values: ContentFormData) => {
    if (!courseId) return

    try {
      if (editingContent) {
        await updateCourseContent(editingContent.courseContentID, values)
        message.success("Content updated successfully")
      } else {
        await createCourseContent(courseId, values)
        message.success("Content created successfully")
      }

      form.resetFields()
      setEditingContent(null)
      setShowForm(false)
      fetchContents()
    } catch (error) {
      message.error("Failed to save content")
      console.error("Error saving content:", error)
    }
  }

  const handleDelete = async (contentId: string) => {
    try {
      await deleteCourseContent(contentId)
      message.success("Content deleted successfully")
      fetchContents()
    } catch (error) {
      message.error("Failed to delete content")
      console.error("Error deleting content:", error)
    }
  }

  const handleEdit = (content: CourseContent) => {
    setEditingContent(content)
    form.setFieldsValue({
      title: content.title,
      content: content.content,
    })
    setShowForm(true)
  }

  const handleAdd = () => {
    setEditingContent(null)
    form.resetFields()
    setShowForm(true)
  }

  const handleCancel = () => {
    form.resetFields()
    setEditingContent(null)
    setShowForm(false)
    onCancel()
  }

  const handleCancelForm = () => {
    form.resetFields()
    setEditingContent(null)
    setShowForm(false)
  }

  return (
    <Modal
      title={`Course Content Management - ${courseName}`}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={900}
      style={{ top: 20 }}
    >
      <div style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAdd}
          disabled={showForm}
        >
          Add New Content
        </Button>
      </div>

      {showForm && (
        <Card
          title={editingContent ? "Edit Content" : "Add New Content"}
          style={{ marginBottom: 16 }}
          extra={<Button onClick={handleCancelForm}>Cancel</Button>}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              label="Content Title"
              name="title"
              rules={[
                { required: true, message: "Please input content title!" },
              ]}
            >
              <Input placeholder="Enter content title" />
            </Form.Item>

            <Form.Item
              label="Content"
              name="content"
              rules={[{ required: true, message: "Please input content!" }]}
            >
              <TextArea rows={8} placeholder="Enter content description" />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
              <Space>
                <Button onClick={handleCancelForm}>Cancel</Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                >
                  {editingContent ? "Update" : "Create"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      )}

      <Divider />

      <Title level={4}>Content List ({contents.length})</Title>

      <List
        loading={loading}
        dataSource={contents}
        locale={{ emptyText: "No content available" }}
        renderItem={(content, index) => (
          <List.Item
            key={content.courseContentID}
            actions={[
              <Button
                type="text"
                icon={<EditOutlined />}
                onClick={() => handleEdit(content)}
                disabled={showForm}
              >
                Edit
              </Button>,
              <Popconfirm
                title="Are you sure you want to delete this content?"
                description="This action cannot be undone."
                onConfirm={() => handleDelete(content.courseContentID)}
                okText="Yes"
                cancelText="No"
                okType="danger"
              >
                <Button
                  type="text"
                  icon={<DeleteOutlined />}
                  danger
                  disabled={showForm}
                >
                  Delete
                </Button>
              </Popconfirm>,
            ]}
          >
            <List.Item.Meta
              title={
                <Space>
                  <Text strong>{index + 1}.</Text>
                  <Text strong>{content.title}</Text>
                </Space>
              }
              description={
                <div>
                  <Text ellipsis style={{ maxWidth: 600 }}>
                    {content.content}
                  </Text>
                </div>
              }
            />
          </List.Item>
        )}
      />
    </Modal>
  )
}

export default CourseContentModal
