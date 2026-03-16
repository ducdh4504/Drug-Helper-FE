import React, { useEffect, useState } from "react"
import { Card, Form } from "antd"
import { useNotification } from "../../hooks/useNotification"
import type { Questions, Answers } from "../../types/interfaces/Assessments"
import {
  getQuestionsList,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} from "../../services/questionAPI"
import QuestionTable from "./QuestionTable"
import QuestionModal from "./QuestionModal"
import HeaderSection from "./QuestionHeaderSection"
import "./QuestionManageBoard.scss"

interface QuestionFormData {
  content: string
  maxScore: number
  answers: { content: string; score: number }[]
}

interface QuestionWithAnswers extends Questions {
  answers?: Answers[]
  assessmentName?: string
}

const QuestionManageBoard: React.FC = () => {
  const notification = useNotification()
  const [questions, setQuestions] = useState<QuestionWithAnswers[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingQuestion, setEditingQuestion] =
    useState<QuestionWithAnswers | null>(null)
  const [form] = Form.useForm()

  // Fetch questions list
  const fetchQuestions = async () => {
    setLoading(true)
    try {
      const response = await getQuestionsList()
      setQuestions(response.data)
    } catch (error) {
      notification.showError("Fetch failed", "Failed to fetch questions")
      console.error("Error fetching questions:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQuestions()
  }, [])

  const handleSubmit = async (values: QuestionFormData) => {
    try {
      const questionData = {
        content: values.content,
        maxScore: values.maxScore,
        answers: values.answers || [],
      }

      if (editingQuestion) {
        await updateQuestion(editingQuestion.questionID, questionData)
        notification.showSuccess("Success", "Question updated successfully")
      } else {
        await createQuestion(questionData)
        notification.showSuccess("Success", "Question created successfully")
      }

      setModalVisible(false)
      setEditingQuestion(null)
      form.resetFields()
      fetchQuestions()
    } catch (error) {
      notification.showError("Save failed", "Failed to save question")
      console.error("Error saving question:", error)
    }
  }

  const handleDelete = async (questionId: string) => {
    try {
      await deleteQuestion(questionId)
      notification.showSuccess("Success", "Question deleted successfully")
      fetchQuestions()
    } catch (error) {
      notification.showError("Delete failed", "Failed to delete question")
      console.error("Error deleting question:", error)
    }
  }

  const handleEdit = (question: QuestionWithAnswers) => {
    setEditingQuestion(question)
    form.setFieldsValue({
      content: question.content,
      maxScore: question.maxScore,
      answers: question.answers || [{ content: "", score: 0 }],
    })
    setModalVisible(true)
  }

  const handleAdd = () => {
    setEditingQuestion(null)
    form.resetFields()
    form.setFieldsValue({
      maxScore: 1,
      answers: [{ content: "", score: 0 }],
    })
    setModalVisible(true)
  }

  const handleModalCancel = () => {
    setModalVisible(false)
    setEditingQuestion(null)
    form.resetFields()
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return "green"
    if (score >= 5) return "orange"
    return "red"
  }

  return (
    <div className="question-manage-board-container">
      <Card className="main-card">
        <HeaderSection onAdd={handleAdd} />
        <QuestionTable
          questions={questions}
          loading={loading}
          onEdit={handleEdit}
          onDelete={handleDelete}
          getScoreColor={getScoreColor}
        />
      </Card>
      <QuestionModal
        visible={modalVisible}
        onCancel={handleModalCancel}
        onFinish={handleSubmit}
        form={form}
        editingQuestion={editingQuestion}
      />
    </div>
  )
}

export default QuestionManageBoard
