import React from "react"
import { Modal, Form, Input, Select, Button, Space } from "antd"
import type { FormInstance } from "antd"
import { ActivityStatus } from "../../types/enums/ActitvityStatusEnum"

const { Option } = Select

interface AssessmentModalProps {
  visible: boolean
  onCancel: () => void
  onFinish: (values: any) => void
  form: FormInstance
  editingAssessment: any
}

const AssessmentModal: React.FC<AssessmentModalProps> = ({
  visible,
  onCancel,
  onFinish,
  form,
  editingAssessment,
}) => (
  <Modal
    title={editingAssessment ? "Edit Assessment" : "Add New Assessment"}
    open={visible}
    onCancel={onCancel}
    footer={null}
    width={600}
  >
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{ status: ActivityStatus.OPEN }}
    >
      <Form.Item
        name="assessmentName"
        label="Assessment Name"
        rules={[{ required: true, message: "Please input assessment name!" }]}
      >
        <Input placeholder="Enter assessment name" />
      </Form.Item>

      {editingAssessment && (
        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: "Please select status!" }]}
        >
          <Select placeholder="Select status">
            <Option value={ActivityStatus.OPEN}>Open</Option>
            <Option value={ActivityStatus.CLOSED}>Closed</Option>
          </Select>
        </Form.Item>
      )}

      <Form.Item style={{ textAlign: "right", marginBottom: 0 }}>
        <Space>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            {editingAssessment ? "Update" : "Create"}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  </Modal>
)

export default AssessmentModal
