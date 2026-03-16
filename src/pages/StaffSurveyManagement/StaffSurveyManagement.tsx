import React, { useEffect, useState, useCallback } from "react"
import {
  Table,
  Button,
  Space,
  Typography,
  Popconfirm,
  Tag,
  Card,
  Form,
  Input,
  Select,
} from "antd"
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons"
import { useSelector } from "react-redux"
import type { ColumnsType } from "antd/es/table"
import type { RootState } from "../../redux/store"
import type { Surveys } from "../../types/interfaces/Surveys"
import {
  getSurveysList,
  createSurvey,
  updateSurvey,
  deleteSurvey,
  getSurveyById,
} from "../../services/surveyAPI"
import { getAuthorName } from "../../services/userAPI"
import { useNotification } from "../../hooks/useNotification"
import SurveyModal from "../../components/SurveyManagement/SurveyModal"
import "./StaffSurveyManagement.scss"

const { Title } = Typography

const StaffSurveyManagement: React.FC = () => {
  const [surveys, setSurveys] = useState<Surveys[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingSurvey, setEditingSurvey] = useState<Surveys | null>(null)
  const [usernames, setUsernames] = useState<Record<string, string>>({})
  const [form] = Form.useForm()
  const { userId } = useSelector((state: RootState) => state.auth)
  const { showSuccess, showError } = useNotification()

  // Fetch surveys data
  const fetchSurveys = useCallback(async () => {
    setLoading(true)
    try {
      const response = await getSurveysList()
      setSurveys(response.data)
    } catch (error) {
      showError("Error", "Failed to fetch surveys")
      console.error("Error fetching surveys:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch usernames for userIDs in surveys
  useEffect(() => {
    const userIds = Array.from(
      new Set(surveys.map((s: any) => s.userID).filter(Boolean))
    )
    userIds.forEach((userId) => {
      if (!usernames[userId]) {
        getAuthorName(userId)
          .then((res) => {
            setUsernames((prev) => ({
              ...prev,
              [userId]: res.data?.fullName || userId,
            }))
          })
          .catch(() => {
            setUsernames((prev) => ({ ...prev, [userId]: userId }))
          })
      }
    })
  }, [surveys, usernames])

  useEffect(() => {
    fetchSurveys()
  }, [fetchSurveys])

  // Handle create survey
  const handleCreate = () => {
    setEditingSurvey(null)
    setModalVisible(true)
    form.resetFields()
  }

  // Handle edit survey
  const handleEdit = async (survey: Surveys) => {
    try {
      const response = await getSurveyById(survey.surveyID)
      const surveyData = response.data
      setEditingSurvey(surveyData)
      setModalVisible(true)
      form.setFieldsValue({
        title: surveyData.title,
        description: surveyData.description,
        type: surveyData.type,
      })
    } catch (error) {
      showError("Error", "Failed to load survey details")
      console.error("Error loading survey:", error)
    }
  }

  // Handle delete survey
  const handleDelete = async (surveyId: string) => {
    try {
      await deleteSurvey(surveyId)
      showSuccess("Success", "Survey deleted successfully")
      fetchSurveys()
    } catch (error) {
      showError("Error", "Failed to delete survey")
      console.error("Error deleting survey:", error)
    }
  }

  // Handle form submit
  const handleSubmit = async (values: any) => {
    try {
      const surveyData = {
        userID: userId || "",
        title: values.title,
        description: values.description,
        publishDate:
          values.publishDate?.format("YYYY-MM-DD") ||
          new Date().toISOString().split("T")[0],
        type: parseInt(values.type),
        status: parseInt(values.status),
      }

      if (editingSurvey) {
        // Update existing survey
        await updateSurvey({
          ...surveyData,
          surveyID: editingSurvey.surveyID,
        })
        showSuccess("Success", "Survey updated successfully")
      } else {
        // Create new survey
        await createSurvey({ ...surveyData, status: 0 })
        showSuccess("Success", "Survey created successfully")
      }

      setModalVisible(false)
      form.resetFields()
      fetchSurveys()
    } catch (error) {
      showError("Error", "Failed to save survey")
      console.error("Error saving survey:", error)
    }
  }

  // Get survey type text
  const getSurveyTypeText = (type: number) => {
    switch (type) {
      case 0:
        return "Pre-Program"
      case 1:
        return "Post-Program"
      default:
        return type || "Unknown"
    }
  }

  // Get survey type color
  const getSurveyTypeColor = (type: number) => {
    switch (type) {
      case 0:
        return "blue"
      case 1:
        return "green"
      default:
        return "default"
    }
  }

  // Table columns
  const columns: ColumnsType<Surveys> = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      render: (description: string) => description || "-",
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      width: 120,
      render: (type: number) => (
        <Tag color={getSurveyTypeColor(type)}>{getSurveyTypeText(type)}</Tag>
      ),
    },
    {
      title: "Created By",
      dataIndex: "userID",
      key: "userID",
      width: 120,
      render: (userID: string) => usernames[userID] || userID || "-",
    },
    {
      title: "Actions",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="Edit"
          />
          <Popconfirm
            title="Are you sure to delete this survey?"
            onConfirm={() => handleDelete(record.surveyID)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              title="Delete"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className="staff-survey-management">
      <Card>
        <div className="page-header">
          <Title level={2}>Survey Management</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Create Survey
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={surveys}
          rowKey="surveyID"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} surveys`,
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <SurveyModal
        visible={modalVisible}
        form={form}
        editingSurvey={editingSurvey}
        onCancel={() => {
          setModalVisible(false)
          form.resetFields()
        }}
        onFinish={handleSubmit}
      />
    </div>
  )
}

export default StaffSurveyManagement
