import React from "react"
import { Modal, Form, Select, InputNumber, Button, Space } from "antd"
import type { Questions } from "../../types/interfaces/Assessments"

const { Option } = Select

interface LinkSpecificQuestionModalProps {
  visible: boolean
  onCancel: () => void
  onFinish: (values: {
    questionId: string
    randomQuestionCount: number
  }) => void
  form: any
  questions: Questions[]
}

const LinkSpecificQuestionModal: React.FC<LinkSpecificQuestionModalProps> = ({
  visible,
  onCancel,
  onFinish,
  form,
  questions,
}) => (
  <Modal
    title="Link Specific Question"
    open={visible}
    onCancel={onCancel}
    footer={null}
    width={500}
  >
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{ randomQuestionCount: 0 }}
    >
      <Form.Item
        name="questionId"
        label="Select Question"
        rules={[{ required: true, message: "Please select a question!" }]}
      >
        <Select
          placeholder="Select a question"
          showSearch
          optionFilterProp="label"
          notFoundContent="No questions found"
          style={{ width: "100%" }}
          filterOption={(input, option) =>
            (option?.label as string)
              .toLowerCase()
              .includes(input.toLowerCase())
          }
        >
          {questions.map((question) => (
            <Option
              key={question.questionID}
              value={question.questionID}
              label={
                question.content.length > 60
                  ? `${question.content.substring(0, 60)}...`
                  : question.content
              }
            >
              <div>
                <div style={{ fontWeight: 500 }}>
                  {question.content.length > 60
                    ? `${question.content.substring(0, 60)}...`
                    : question.content}
                </div>
                <div style={{ fontSize: 12, color: "#666" }}>
                  Max Score: {question.maxScore}
                </div>
              </div>
            </Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        name="randomQuestionCount"
        label="Additional Random Questions Count"
        rules={[
          {
            required: true,
            message: "Please input random question count!",
          },
          { type: "number", min: 0, message: "Must be at least 0!" },
        ]}
      >
        <InputNumber
          min={0}
          placeholder="Enter additional random questions count"
          style={{ width: "100%" }}
        />
      </Form.Item>

      <div
        style={{
          marginBottom: 16,
          padding: 12,
          background: "#f6f8fa",
          borderRadius: 4,
        }}
      >
        <p style={{ margin: 0, fontSize: 12, color: "#666" }}>
          <strong>Note:</strong> This will link the selected question plus the
          specified number of additional random questions to the assessment.
        </p>
      </div>

      <Form.Item style={{ textAlign: "right", marginBottom: 0 }}>
        <Space>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            Link Question
          </Button>
        </Space>
      </Form.Item>
    </Form>
  </Modal>
)

export default LinkSpecificQuestionModal
