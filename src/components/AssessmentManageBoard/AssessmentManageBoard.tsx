import React, { useEffect, useState } from "react"
import { Card, Tag, Form } from "antd"
import { useNotification } from "../../hooks/useNotification"
import type { Assessments, Questions } from "../../types/interfaces/Assessments"
import {
  getAssessmentsList,
  createAssessment,
  updateAssessment,
  linkRandomQuestions,
  linkQuestion,
  getAssessmentById,
  unlinkQuestion,
} from "../../services/assessmentAPI"
import { getQuestionsList } from "../../services/questionAPI"
import AssessmentHeaderSection from "./AssessmentHeaderSection"
import AssessmentTable from "./AssessmentTable"
import AssessmentModal from "./AssessmentModal"
import LinkRandomQuestionsModal from "./LinkRandomQuestionsModal"
import ManageQuestionsModal from "./ManageQuestionModal"
import "./AssessmentManageBoard.scss"

interface AssessmentFormData {
  assessmentName: string
  status: number
}

interface TransferItem {
  key: string
  title: string
  description: string
}

const AssessmentManageBoard: React.FC = () => {
  const notification = useNotification()
  const [assessments, setAssessments] = useState<Assessments[]>([])
  const [questions, setQuestions] = useState<Questions[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [linkModalVisible, setLinkModalVisible] = useState(false)
  const [manageQuestionsModalVisible, setManageQuestionsModalVisible] =
    useState(false)
  const [editingAssessment, setEditingAssessment] =
    useState<Assessments | null>(null)
  const [selectedAssessment, setSelectedAssessment] = useState<
    Assessments | null | undefined
  >(null)
  const [targetKeys, setTargetKeys] = useState<React.Key[]>([])
  const [form] = Form.useForm()
  const [linkForm] = Form.useForm()

  // Fetch assessments list
  const fetchAssessments = async () => {
    setLoading(true)
    try {
      const response = await getAssessmentsList()
      setAssessments(
        response.data.map((item: any) => ({
          ...item,
          assessmentId: item.assessmentId || item.assessmentID || item.id,
        }))
      )
    } catch (error) {
      notification.showError("Fetch failed", "Failed to fetch assessments")
      console.error("Error fetching assessments:", error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch questions list
  const fetchQuestions = async () => {
    try {
      const response = await getQuestionsList()
      setQuestions(response.data)
    } catch (error) {
      console.error("Error fetching questions:", error)
    }
  }

  useEffect(() => {
    fetchAssessments()
    fetchQuestions()
  }, [])

  const handleSubmit = async (values: AssessmentFormData) => {
    try {
      if (editingAssessment) {
        await updateAssessment(editingAssessment.assessmentId, {
          assessmentName: values.assessmentName,
          status: values.status,
        })
        notification.showSuccess("Success", "Assessment updated successfully")
      } else {
        await createAssessment({
          assessmentName: values.assessmentName,
        })
        notification.showSuccess("Success", "Assessment created successfully")
      }

      setModalVisible(false)
      setEditingAssessment(null)
      form.resetFields()
      fetchAssessments()
    } catch (error) {
      notification.showError("Save failed", "Failed to save assessment")
      console.error("Error saving assessment:", error)
    }
  }

  const handleEdit = (assessment: Assessments) => {
    setEditingAssessment(assessment)
    form.setFieldsValue({
      assessmentName: assessment.assessmentName,
      status: assessment.status,
    })
    setModalVisible(true)
  }

  const handleAdd = () => {
    setEditingAssessment(null)
    form.resetFields()
    setModalVisible(true)
  }

  const handleModalCancel = () => {
    setModalVisible(false)
    setEditingAssessment(null)
    form.resetFields()
  }

  const handleLinkQuestions = (assessment: Assessments) => {
    setSelectedAssessment(assessment)
    linkForm.resetFields()
    setLinkModalVisible(true)
  }

  const handleLinkSubmit = async (values: { questionCount: number }) => {
    if (!selectedAssessment) return

    try {
      await linkRandomQuestions(
        selectedAssessment.assessmentId,
        values.questionCount
      )
      notification.showSuccess(
        "Success",
        "Random questions linked successfully"
      )
      setLinkModalVisible(false)
      setSelectedAssessment(null)
      linkForm.resetFields()
    } catch (error) {
      notification.showError("Link failed", "Failed to link random questions")
      console.error("Error linking random questions:", error)
    }
  }

  const handleManageQuestions = async (assessment: Assessments) => {
    setSelectedAssessment(assessment)
    try {
      const response = await getAssessmentById(assessment.assessmentId)
      const linkedQuestions = response.data.linkedQuestions || []
      setTargetKeys(linkedQuestions.map((q: any) => q.questionID))
      setManageQuestionsModalVisible(true)
    } catch (error) {
      notification.showError("Fetch failed", "Failed to fetch linked questions")
      setTargetKeys([])
      setManageQuestionsModalVisible(true)
    }
  }

  const handleQuestionsTransferChange = (
    targetKeys: React.Key[],
    _direction: any,
    _moveKeys: any
  ) => {
    setTargetKeys(targetKeys)
  }

  const handleSaveQuestionLinks = async () => {
    if (!selectedAssessment) return

    try {
      // Lấy danh sách questionID đã liên kết trước đó
      const response = await getAssessmentById(selectedAssessment.assessmentId)
      const prevLinked = (response.data.linkedQuestions || []).map(
        (q: any) => q.questionID
      )

      // Những question mới được thêm vào
      const toAdd = targetKeys.filter((id) => !prevLinked.includes(id))

      // Những question bị bỏ chọn (cần xóa liên kết)
      const toRemove = prevLinked.filter(
        (id: string) => !targetKeys.includes(id)
      )

      // Thêm liên kết mới
      await Promise.all(
        toAdd.map((questionId) =>
          linkQuestion({
            assessmentId: selectedAssessment.assessmentId,
            questionId: String(questionId),
            randomQuestionCount: 0,
          }).catch((error) => {
            if (
              error.response &&
              error.response.status === 400 &&
              typeof error.response.data === "string" &&
              error.response.data.includes(
                "Question đã được liên kết với Assessment này"
              )
            ) {
              return null
            }
            throw error
          })
        )
      )

      // Xóa liên kết bị bỏ chọn
      await Promise.all(
        toRemove.map((questionId: string) =>
          unlinkQuestion(selectedAssessment.assessmentId, questionId).catch(
            (error) => {
              console.error("Error unlinking question:", error)
            }
          )
        )
      )

      notification.showSuccess("Success", "Questions linked successfully")
      setManageQuestionsModalVisible(false)
      setSelectedAssessment(null)
      setTargetKeys([])
    } catch (error) {
      notification.showError("Save failed", "Failed to save question links")
      console.error("Error saving question links:", error)
    }
  }

  const getStatusTag = (status: number) => {
    switch (status) {
      case 0:
        return <Tag color="green">Active</Tag>
      case 1:
        return <Tag color="red">Inactive</Tag>
      default:
        return <Tag color="orange">Unknown</Tag>
    }
  }

  // Prepare data for Transfer component
  const transferData: TransferItem[] = questions.map((question) => ({
    key: question.questionID,
    title: question.content
      ? `${question.content.substring(0, 50)}${
          question.content.length > 50 ? "..." : ""
        }`
      : "No content",
    description: `Max Score: ${question.maxScore}`,
  }))

  return (
    <div className="assessment-manage-board-container">
      <Card>
        <AssessmentHeaderSection onAdd={handleAdd} />
        <AssessmentTable
          assessments={assessments}
          loading={loading}
          onEdit={handleEdit}
          onLinkRandom={handleLinkQuestions}
          onManageQuestions={handleManageQuestions}
          getStatusTag={getStatusTag}
        />
      </Card>

      <AssessmentModal
        visible={modalVisible}
        onCancel={handleModalCancel}
        onFinish={handleSubmit}
        form={form}
        editingAssessment={editingAssessment}
      />

      <LinkRandomQuestionsModal
        visible={linkModalVisible}
        onCancel={() => {
          setLinkModalVisible(false)
          setSelectedAssessment(null)
          linkForm.resetFields()
        }}
        onFinish={handleLinkSubmit}
        form={linkForm}
      />

      <ManageQuestionsModal
        visible={manageQuestionsModalVisible}
        onCancel={() => {
          setManageQuestionsModalVisible(false)
          setSelectedAssessment(null)
          setTargetKeys([])
        }}
        onOk={handleSaveQuestionLinks}
        transferData={transferData}
        targetKeys={targetKeys}
        onTransferChange={handleQuestionsTransferChange}
        selectedAssessmentName={selectedAssessment?.assessmentName}
      />
    </div>
  )
}

export default AssessmentManageBoard
