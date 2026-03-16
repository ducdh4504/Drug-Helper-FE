import React, { useState, useEffect } from "react"
import { Modal, Input, Button, Spin } from "antd"
import { getSurveyById, updateSurveyResult } from "../../services/surveyAPI"
import { useNotification } from "../../hooks/useNotification"
import "./SurveyModal.scss"

const { TextArea } = Input

interface SurveyModalProps {
  visible: boolean
  onClose: () => void
  surveyId: string
  programId: string
  surveyTitle: string
}

const SurveyModal: React.FC<SurveyModalProps> = ({
  visible,
  onClose,
  surveyId,
  programId,
  surveyTitle,
}) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [surveyData, setSurveyData] = useState<{
    title: string
    description: string | null
  } | null>(null)
  const [response, setResponse] = useState("")
  const notification = useNotification()

  useEffect(() => {
    if (error) {
      notification.showError("Load failed", error)
    }
  }, [error, notification])

  useEffect(() => {
    if (!visible) return
    setSurveyData(null)
    setResponse("")
    const fetchSurveyData = async () => {
      if (!surveyId) return
      setLoading(true)
      try {
        const { data } = await getSurveyById(surveyId)
        setSurveyData({
          title: data.title,
          description: data.description,
        })
      } catch (error: any) {
        const errorMessage =
          error?.response?.data?.message ||
          error?.message ||
          "Error loading survey"
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchSurveyData()
  }, [surveyId, visible])

  const handleSubmit = async () => {
    if (!response.trim()) {
      notification.showError("Error", "Please provide a response")
      return
    }

    setSubmitting(true)
    try {
      await updateSurveyResult({
        surveyID: surveyId,
        programID: programId,
        responseData: response,
      })

      notification.showSuccess(
        "Success",
        "Your survey response has been submitted"
      )
      setResponse("")
      onClose()
    } catch (error: any) {
      notification.showError(
        "Submission failed",
        error?.response?.data?.message || "Failed to submit survey response"
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={visible}
      title={surveyTitle}
      onCancel={onClose}
      footer={null}
      className="survey-modal"
    >
      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
          <p>Loading survey...</p>
        </div>
      ) : (
        <div className="survey-content">
          <div className="survey-question">
            <p>{surveyData?.description || "No description available"}</p>
          </div>
          <div className="survey-response">
            <TextArea
              rows={6}
              value={response}
              onChange={(e) => setResponse(e.target.value)}
              placeholder="Enter your response here..."
            />
          </div>
          <div className="survey-actions">
            <Button onClick={onClose}>Cancel</Button>
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={submitting}
              disabled={!response.trim()}
            >
              Submit
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )
}

export default SurveyModal
