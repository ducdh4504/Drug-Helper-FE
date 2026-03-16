import React from "react"
import { Table, Tag, Space, Button, Popconfirm } from "antd"
import { EditOutlined, DeleteOutlined, BookOutlined } from "@ant-design/icons"
import type { ColumnsType } from "antd/es/table"
import type { Questions, Answers } from "../../types/interfaces/Assessments"

interface QuestionWithAnswers extends Questions {
  answers?: Answers[]
  assessmentName?: string
}

interface QuestionTableProps {
  questions: QuestionWithAnswers[]
  loading: boolean
  onEdit: (question: QuestionWithAnswers) => void
  onDelete: (questionId: string) => void
  getScoreColor: (score: number) => string
}

const QuestionTable: React.FC<QuestionTableProps> = ({
  questions,
  loading,
  onEdit,
  onDelete,
  getScoreColor,
}) => {
  const columns: ColumnsType<QuestionWithAnswers> = [
    {
      title: "Content",
      dataIndex: "content",
      key: "content",
      width: 350,
      ellipsis: true,
      render: (content: string) => (
        <div className="question-content">
          <BookOutlined style={{ marginRight: 8, color: "#1890ff" }} />
          <span title={content}>{content}</span>
        </div>
      ),
    },
    {
      title: "Max Score",
      dataIndex: "maxScore",
      key: "maxScore",
      width: 100,
      align: "center",
      render: (score: number) => (
        <Tag color={getScoreColor(score)} className="score-tag">
          {score}
        </Tag>
      ),
    },
    {
      title: "Answers",
      key: "answersCount",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Tag color="blue" className="answers-count-tag">
          {record.answers?.length || 0} answers
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => onEdit(record)}
            title="Edit Question"
            className="action-btn edit-btn"
          />
          <Popconfirm
            title="Are you sure you want to delete this question?"
            description="This action cannot be undone."
            onConfirm={() => onDelete(record.questionID)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              size="small"
              danger
              title="Delete Question"
              className="action-btn delete-btn"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      dataSource={questions}
      rowKey="questionId"
      loading={loading}
      scroll={{ x: 1000 }}
      className="questions-table"
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} of ${total} questions`,
        className: "table-pagination",
      }}
    />
  )
}

export default QuestionTable
