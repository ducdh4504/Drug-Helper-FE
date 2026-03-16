import React, { useEffect, useState } from "react"
import {
  Modal,
  Form,
  Input,
  DatePicker,
  InputNumber,
  Select,
  Button,
  Space,
  Upload,
} from "antd"
import { UploadOutlined } from "@ant-design/icons"
import { LevelTarget } from "../../types/enums/LevelTargetEnum"
import type { Courses } from "../../types/interfaces/Courses"
import dayjs from "dayjs"

const { TextArea } = Input
const { RangePicker } = DatePicker
const { Option } = Select

interface CourseFormData {
  title: string
  contentSummary: string
  description: string
  startDate: string
  endDate: string
  ageMin: number
  capacity: number
  levelTarget?: LevelTarget
  imageFile?: File
}

interface CourseModalProps {
  visible: boolean
  editingCourse: Courses | null
  onCancel: () => void
  onSubmit: (values: CourseFormData) => Promise<void>
}

const CourseModal: React.FC<CourseModalProps> = ({
  visible,
  editingCourse,
  onCancel,
  onSubmit,
}) => {
  const [form] = Form.useForm()
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    if (visible) {
      if (editingCourse) {
        form.setFieldsValue({
          title: editingCourse.title,
          contentSummary: editingCourse.contentSummary,
          description: editingCourse.description,
          dateRange: [
            editingCourse.startDate ? dayjs(editingCourse.startDate) : null,
            editingCourse.endDate ? dayjs(editingCourse.endDate) : null,
          ],
          ageMin: editingCourse.ageMin,
          capacity: editingCourse.capacity,
          levelTarget: editingCourse.levelTarget,
        })
        // Set preview to current course image
        setImagePreview(editingCourse.imgUrl || null)
        setSelectedFile(null)
      } else {
        form.resetFields()
        setImagePreview(null)
        setSelectedFile(null)
      }
    }
  }, [visible, editingCourse, form])

  const handleSubmit = async (values: any) => {
    const [startDate, endDate] = values.dateRange || []
    await onSubmit({
      ...values,
      startDate: startDate ? startDate.format("YYYY-MM-DD") : "",
      endDate: endDate ? endDate.format("YYYY-MM-DD") : "",
      imageFile: selectedFile,
    })
    form.resetFields()
    setImagePreview(null)
    setSelectedFile(null)
  }

  const handleCancel = () => {
    form.resetFields()
    setImagePreview(null)
    setSelectedFile(null)
    onCancel()
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      // Create preview URL
      const reader = new FileReader()
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Modal
      title={editingCourse ? "Edit Course" : "Add New Course"}
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={800}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          ageMin: 18,
          capacity: 30,
        }}
      >
        <Form.Item
          label="Course Title"
          name="title"
          rules={[{ required: true, message: "Please input course title!" }]}
        >
          <Input placeholder="Enter course title" />
        </Form.Item>

        <Form.Item
          label="Content Summary"
          name="contentSummary"
          rules={[{ required: true, message: "Please input content summary!" }]}
        >
          <TextArea rows={3} placeholder="Enter content summary" />
        </Form.Item>

        <Form.Item
          label="Description"
          name="description"
          rules={[{ required: true, message: "Please input description!" }]}
        >
          <TextArea rows={4} placeholder="Enter course description" />
        </Form.Item>

        <Form.Item
          label="Date Range"
          name="dateRange"
          rules={[{ required: true, message: "Please select date range!" }]}
        >
          <RangePicker format="DD/MM/YYYY" style={{ width: "100%" }} />
        </Form.Item>

        <Space style={{ width: "100%" }}>
          <Form.Item
            label="Age Min"
            name="ageMin"
            rules={[{ required: true, message: "Please input min age!" }]}
          >
            <InputNumber min={0} max={100} style={{ width: 120 }} />
          </Form.Item>
          <Form.Item
            label="Capacity"
            name="capacity"
            rules={[{ required: true, message: "Please input capacity!" }]}
          >
            <InputNumber min={1} max={1000} style={{ width: 120 }} />
          </Form.Item>
          <Form.Item label="Level Target" name="levelTarget">
            <Select
              placeholder="Select level"
              style={{ width: 150 }}
              allowClear
            >
              <Option value={LevelTarget.LOW}>Low</Option>
              <Option value={LevelTarget.MEDIUM}>Medium</Option>
              <Option value={LevelTarget.HIGH}>High</Option>
            </Select>
          </Form.Item>
        </Space>

        <Form.Item label="Course Image">
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ marginBottom: 16 }}
            />
            {imagePreview && (
              <div style={{ marginTop: 8 }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    maxWidth: "200px",
                    maxHeight: "150px",
                    objectFit: "cover",
                    border: "1px solid #d9d9d9",
                    borderRadius: "6px",
                  }}
                />
                <div style={{ marginTop: 4, fontSize: "12px", color: "#666" }}>
                  Image Preview
                </div>
              </div>
            )}
          </div>
        </Form.Item>

        <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
          <Space>
            <Button onClick={handleCancel}>Cancel</Button>
            <Button type="primary" htmlType="submit">
              {editingCourse ? "Update" : "Create"}
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default CourseModal
