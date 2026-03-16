import React, { useEffect } from "react"
import {
  Modal,
  Form,
  Input,
  DatePicker,
  InputNumber,
  Select,
  Button,
  Space,
} from "antd"
import dayjs from "dayjs"
import type { Courses } from "../../types/interfaces/Courses"
import { LevelTarget } from "../../types/enums/LevelTargetEnum"

const { TextArea } = Input
const { RangePicker } = DatePicker

interface CourseFormData {
  title: string
  contentSummary: string
  description: string
  startDate: string
  endDate: string
  ageMin: number
  capacity: number
  levelTarget?: LevelTarget
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

  useEffect(() => {
    if (visible) {
      if (editingCourse) {
        form.setFieldsValue({
          title: editingCourse.title,
          contentSummary: editingCourse.contentSummary,
          description: editingCourse.description,
          dateRange: [
            dayjs(editingCourse.startDate),
            dayjs(editingCourse.endDate),
          ],
          ageMin: editingCourse.ageMin,
          capacity: editingCourse.capacity,
          levelTarget: editingCourse.levelTarget, // <-- dùng trực tiếp
        })
      } else {
        form.resetFields()
      }
    }
  }, [visible, editingCourse, form])

  const handleSubmit = async (values: any) => {
    await onSubmit(values)
    form.resetFields()
  }

  const handleCancel = () => {
    form.resetFields()
    onCancel()
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      form.setFieldsValue({ imageFile: file })
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
          label="Course Duration"
          name="dateRange"
          rules={[
            { required: true, message: "Please select course duration!" },
          ]}
        >
          <RangePicker
            showTime
            format="YYYY-MM-DD HH:mm:ss"
            style={{ width: "100%" }}
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                form.setFieldsValue({
                  startDate: dates[0].toISOString(),
                  endDate: dates[1].toISOString(),
                })
              } else {
                form.setFieldsValue({
                  startDate: undefined,
                  endDate: undefined,
                })
              }
            }}
          />
        </Form.Item>

        <Form.Item name="startDate" hidden>
          <Input />
        </Form.Item>

        <Form.Item name="endDate" hidden>
          <Input />
        </Form.Item>

        <div style={{ display: "flex", gap: 16 }}>
          <Form.Item
            label="Minimum Age"
            name="ageMin"
            style={{ flex: 1 }}
            rules={[{ required: true, message: "Please input minimum age!" }]}
          >
            <InputNumber
              min={0}
              max={100}
              style={{ width: "100%" }}
              placeholder="18"
            />
          </Form.Item>

          <Form.Item
            label="Capacity"
            name="capacity"
            style={{ flex: 1 }}
            rules={[{ required: true, message: "Please input capacity!" }]}
          >
            <InputNumber
              min={1}
              max={1000}
              style={{ width: "100%" }}
              placeholder="30"
            />
          </Form.Item>
        </div>

        <Form.Item label="Level Target" name="levelTarget">
          <Select placeholder="Select level target" allowClear>
            {Object.values(LevelTarget).map((level) => (
              <Select.Option key={level} value={level}>
                {level}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="Course Image" name="imageFile" valuePropName="file">
          <input type="file" accept="image/*" onChange={handleImageChange} />
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
