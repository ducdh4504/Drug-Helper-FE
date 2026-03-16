import React from "react"
import { Table, Space, Button } from "antd"
import {
  EditOutlined,
  LinkOutlined,
  QuestionCircleOutlined,
  SettingOutlined,
} from "@ant-design/icons"
import type { ColumnsType } from "antd/es/table"
import type { Assessments } from "../../types/interfaces/Assessments"

interface AssessmentTableProps {
  assessments: Assessments[]
  loading: boolean
  onEdit: (assessment: Assessments) => void
  onLinkRandom: (assessment: Assessments) => void
  onManageQuestions: (assessment: Assessments) => void
  getStatusTag: (status: number) => React.ReactNode
}

const AssessmentTable: React.FC<AssessmentTableProps> = ({
  assessments,
  loading,
  onEdit,
  onLinkRandom,
  onManageQuestions,
  getStatusTag,
}) => {
  const columns: ColumnsType<Assessments> = [
    {
      title: "Assessment Name",
      dataIndex: "assessmentName",
      key: "assessmentName",
      width: 300,
      ellipsis: true,
      render: (name: string | null) => name || "N/A",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: number) => getStatusTag(status),
    },
    {
      title: "Actions",
      key: "actions",
      width: 280,
      fixed: "right",
      render: (_, record) => (
        <Space size="small" wrap>
          <Button
            type="text"
            icon={<LinkOutlined />}
            size="small"
            onClick={() => onLinkRandom(record)}
            title="Link Random Questions"
          >
            Random
          </Button>
          <Button
            type="text"
            icon={<SettingOutlined />}
            size="small"
            onClick={() => onManageQuestions(record)}
            title="Manage Questions"
          >
            Manage
          </Button>
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => onEdit(record)}
            title="Edit Assessment"
          >
            Edit
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <Table
      columns={columns}
      dataSource={assessments}
      rowKey="assessmentId"
      loading={loading}
      scroll={{ x: 800 }}
      pagination={{
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) =>
          `${range[0]}-${range[1]} of ${total} assessments`,
      }}
    />
  )
}

export default AssessmentTable
