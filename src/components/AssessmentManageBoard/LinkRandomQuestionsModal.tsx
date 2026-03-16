import React from "react"
import { Modal, Form, InputNumber, Button, Space } from "antd"

interface LinkRandomQuestionsModalProps {
  visible: boolean
  onCancel: () => void
  onFinish: (values: { questionCount: number }) => void
  form: any
}

const LinkRandomQuestionsModal: React.FC<LinkRandomQuestionsModalProps> = ({
  visible,
  onCancel,
  onFinish,
  form,
}) => (
  <Modal
    title="Link Random Questions"
    open={visible}
    onCancel={onCancel}
    footer={null}
    width={400}
  >
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{ questionCount: 1 }}
    >
      <Form.Item
        name="questionCount"
        label="Number of Random Questions"
        rules={[
          { required: true, message: "Please input question count!" },
          { type: "number", min: 1, message: "Must be at least 1!" },
        ]}
      >
        <InputNumber
          min={1}
          placeholder="Enter question count"
          style={{ width: "100%" }}
        />
      </Form.Item>

      <Form.Item style={{ textAlign: "right", marginBottom: 0 }}>
        <Space>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            Link Random Questions
          </Button>
        </Space>
      </Form.Item>
    </Form>
  </Modal>
)

export default LinkRandomQuestionsModal
