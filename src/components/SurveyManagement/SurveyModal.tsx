import React from "react"
import { Modal, Form, Input, Select, DatePicker, Button, Space } from "antd"

const { TextArea } = Input
const { Option } = Select

interface SurveyModalProps {
  visible: boolean
  form: any
  editingSurvey: any
  onCancel: () => void
  onFinish: (values: any) => void
}

const SurveyModal: React.FC<SurveyModalProps> = ({
  visible,
  form,
  editingSurvey,
  onCancel,
  onFinish,
}) => (
  <Modal
    title={editingSurvey ? "Edit Survey" : "Create Survey"}
    open={visible}
    onCancel={onCancel}
    footer={null}
    width={600}
  >
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        type: "0",
        status: "1",
      }}
    >
      <Form.Item
        name="title"
        label="Title"
        rules={[{ required: true, message: "Please input the title!" }]}
      >
        <Input placeholder="Enter survey title" />
      </Form.Item>

      <Form.Item
        name="description"
        label="Description"
        rules={[{ required: true, message: "Please input the description!" }]}
      >
        <TextArea
          rows={4}
          placeholder="Enter survey description"
          showCount
          maxLength={1000}
        />
      </Form.Item>

      <Space style={{ width: "100%" }}>
        <Form.Item
          name="type"
          label="Survey Type"
          rules={[{ required: true, message: "Please select survey type!" }]}
        >
          <Select placeholder="Select type" style={{ width: 200 }}>
            <Option value="0">Pre-Program</Option>
            <Option value="1">Post-Program</Option>
          </Select>
        </Form.Item>

        {editingSurvey && (
          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: "Please select status!" }]}
          >
            <Select placeholder="Select status" style={{ width: 150 }}>
              <Option value="1">Active</Option>
              <Option value="0">Inactive</Option>
            </Select>
          </Form.Item>
        )}

        {editingSurvey && (
          <Form.Item name="publishDate" label="Publish Date">
            <DatePicker format="DD/MM/YYYY" style={{ width: 150 }} />
          </Form.Item>
        )}
      </Space>

      <div style={{ textAlign: "right", marginTop: 16 }}>
        <Space>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            {editingSurvey ? "Update" : "Create"}
          </Button>
        </Space>
      </div>
    </Form>
  </Modal>
)

export default SurveyModal