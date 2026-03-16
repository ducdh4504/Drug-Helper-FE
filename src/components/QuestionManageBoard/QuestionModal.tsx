import React from "react"
import { Modal, Form, Input, InputNumber, Divider, Button, Space } from "antd"
import {
  PlusOutlined,
  MinusCircleOutlined,
  BookOutlined,
} from "@ant-design/icons"

const { TextArea } = Input

interface QuestionModalProps {
  visible: boolean
  onCancel: () => void
  onFinish: (values: any) => void
  form: any
  editingQuestion: any
}

const QuestionModal: React.FC<QuestionModalProps> = ({
  visible,
  onCancel,
  onFinish,
  form,
  editingQuestion,
}) => (
  <Modal
    title={
      <div className="modal-title">
        <BookOutlined style={{ marginRight: 8 }} />
        {editingQuestion ? "Edit Question" : "Add New Question"}
      </div>
    }
    open={visible}
    onCancel={onCancel}
    footer={null}
    width={900}
    className="question-modal"
  >
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        maxScore: 1,
        answers: [{ content: "", score: 0 }],
      }}
      className="question-form"
    >
      <Form.Item
        name="content"
        label="Question Content"
        rules={[
          { required: true, message: "Please input question content!" },
          {
            min: 10,
            message: "Question content must be at least 10 characters!",
          },
        ]}
      >
        <TextArea
          rows={4}
          placeholder="Enter your question content here..."
          showCount
          maxLength={500}
        />
      </Form.Item>

      <div className="form-row">
        <Form.Item
          name="maxScore"
          label="Max Score"
          rules={[
            { required: true, message: "Please input max score!" },
            {
              type: "number",
              min: 1,
              max: 100,
              message: "Score must be between 1 and 100!",
            },
          ]}
          className="score-input"
        >
          <InputNumber
            min={1}
            max={100}
            placeholder="Enter max score"
            style={{ width: "100%" }}
          />
        </Form.Item>
      </div>

      <Divider className="answers-divider">
        <span className="divider-text">Answer Options</span>
      </Divider>

      <Form.List name="answers">
        {(fields, { add, remove }) => (
          <div className="answers-section">
            {fields.map(({ key, name, ...restField }, index) => (
              <div key={key} className="answer-item">
                <div className="answer-header">
                  <span className="answer-label">Answer {index + 1}</span>
                  {fields.length > 1 && (
                    <MinusCircleOutlined
                      onClick={() => remove(name)}
                      className="remove-answer-btn"
                    />
                  )}
                </div>
                <div className="answer-inputs">
                  <Form.Item
                    {...restField}
                    name={[name, "content"]}
                    rules={[
                      {
                        required: true,
                        message: "Please input answer content!",
                      },
                    ]}
                    className="answer-content-input"
                  >
                    <Input
                      placeholder={`Enter answer ${index + 1} content`}
                      showCount
                      maxLength={200}
                    />
                  </Form.Item>
                  <Form.Item
                    {...restField}
                    name={[name, "score"]}
                    rules={[
                      { required: true, message: "Please input score!" },
                      {
                        type: "number",
                        min: 0,
                        max: 100,
                        message: "Score must be between 0 and 100!",
                      },
                    ]}
                    className="answer-score-input"
                  >
                    <InputNumber
                      min={0}
                      max={100}
                      placeholder="Score"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </div>
              </div>
            ))}
            <Form.Item className="add-answer-item">
              <Button
                type="dashed"
                onClick={() => add()}
                block
                icon={<PlusOutlined />}
                className="add-answer-btn"
              >
                Add Another Answer
              </Button>
            </Form.Item>
          </div>
        )}
      </Form.List>

      <Form.Item className="form-actions">
        <Space size="large">
          <Button onClick={onCancel} size="large">
            Cancel
          </Button>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            className="submit-btn"
          >
            {editingQuestion ? "Update Question" : "Create Question"}
          </Button>
        </Space>
      </Form.Item>
    </Form>
  </Modal>
)

export default QuestionModal
