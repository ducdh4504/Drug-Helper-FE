import React, { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import "./ProgramRegister.scss"
import { Spin, Button, Tag } from "antd"
import { ExclamationCircleOutlined } from "@ant-design/icons"
import { useSelector } from "react-redux"
import { FaRegCalendarAlt, FaClock, FaPoll } from "react-icons/fa"
import OfflineOnlineAddress from "../../components/Program-Onl-Off/OfflineOnlineAddress"
import SurveyModal from "../../components/SurveyModal/SurveyModal"
import {
  createProgramParticipation,
  getCommunicationProgramById,
  getProgramParticipationById,
  updateProgramParticipationStatus,
} from "../../services/programAPI"
import {
  getSurveyResultsByProgramId,
  getSurveyById,
} from "../../services/surveyAPI"
import type { RootState } from "../../redux/store"
import { useNotification } from "../../hooks/useNotification"
import { formatTime } from "../../utils/helpers/timeUtils"
import { formatDate } from "../../utils/helpers/dateUtils"
import { ActivityStatus } from "../../types/enums/ActitvityStatusEnum"
import type { CommunicationPrograms } from "../../types/interfaces/CommunicationPrograms"
import BackLink from "../../components/BackLink/BackLink"
import GoogleMapComponent from "../../components/GoogleMap/GoogleMap"
import { SurveyTypeEnum } from "../../types/enums/SurveyTypeEnum"

const ProgramRegister: React.FC = () => {
  const { programId } = useParams<{ programId: string }>()
  const userId = useSelector((state: RootState) => state.auth.userId)
  const [program, setProgram] = useState<CommunicationPrograms | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [registering, setRegistering] = useState(false)
  const [participation, setParticipation] = useState<any>(null)
  const [participationLoading, setParticipationLoading] = useState(false)
  const [surveyModalVisible, setSurveyModalVisible] = useState(false)
  const [activeSurveyId, setActiveSurveyId] = useState("")
  const [activeSurveyTitle, setActiveSurveyTitle] = useState("")
  const [preSurvey, setPreSurvey] = useState<any>(null)
  const [postSurvey, setPostSurvey] = useState<any>(null)

  const notification = useNotification()
  const navigate = useNavigate()

  useEffect(() => {
    if (error) {
      notification.showError("Load failed", error)
    }
  }, [error, notification])

  useEffect(() => {
    const fetchProgram = async () => {
      if (!programId) return
      setLoading(true)
      setError("")
      try {
        const response = await getCommunicationProgramById(programId)
        const programData = {
          ...response.data,
          programId: response.data.programID || response.data.programId,
        }
        setProgram(programData)

        const surveyResultsRes = await getSurveyResultsByProgramId(programId)
        const surveyIds: string[] = surveyResultsRes.data
        const surveyPromises = surveyIds.map((id) =>
          getSurveyById(id).then((res) => res.data)
        )
        const surveys = await Promise.all(surveyPromises)
        const pre = surveys.find((s) => s.type === SurveyTypeEnum.pre)
        const post = surveys.find((s) => s.type === SurveyTypeEnum.post)
        setPreSurvey(pre || null)
        setPostSurvey(post || null)
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load program details!"
        setError(errorMessage)
      } finally {
        setLoading(false)
      }
    }

    fetchProgram()
  }, [programId])

  // Fetch participation info
  useEffect(() => {
    const fetchParticipation = async () => {
      if (!userId || !programId) {
        setParticipation(null)
        return
      }
      setParticipationLoading(true)
      try {
        const res = await getProgramParticipationById(userId, programId)
        setParticipation(res.data)
      } catch {
        setParticipation(null)
      } finally {
        setParticipationLoading(false)
      }
    }
    fetchParticipation()
  }, [userId, programId, registering])

  const handleRegister = async () => {
    if (!program || !programId) return
    if (!userId) {
      notification.showWarning(
        "Not logged in",
        "Please login to register for the program!"
      )
      navigate("/login")
      return
    }
    setRegistering(true)
    try {
      // Nếu chưa có participation thì tạo mới
      if (!participation) {
        await createProgramParticipation({ userId, programId })
      } else {
        // Nếu đã cancel thì đăng ký lại (status = 0)
        await updateProgramParticipationStatus({ userId, programId, status: 0 })
      }
      notification.showSuccess(
        "Registration successful",
        "You have successfully registered for the program!"
      )
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || "Registration failed!"
      notification.showError("Registration failed", errorMessage)
    } finally {
      setRegistering(false)
    }
  }

  // Cancel participation
  const handleCancel = async () => {
    if (!program || !programId || !userId) return
    setRegistering(true)
    try {
      await updateProgramParticipationStatus({ userId, programId, status: 1 })
      notification.showSuccess(
        "Canceled",
        "You have canceled your registration."
      )
    } catch (err: any) {
      const errorMessage =
        err?.response?.data?.message || err?.message || "Cancel failed!"
      notification.showError("Cancel failed", errorMessage)
    } finally {
      setRegistering(false)
    }
  }

  if (loading) {
    return (
      <div className="program-register">
        <BackLink />
        <div className="loading-container">
          <Spin size="large" />
          <div style={{ textAlign: "center", marginTop: 16, color: "#666" }}>
            Loading program details...
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="program-register">
        <BackLink />
        <div className="error-container">
          <ExclamationCircleOutlined className="error-icon" />
          <h3>Oops! There is an error</h3>
          <p>{error}</p>
        </div>
      </div>
    )
  }

  if (!program) {
    return (
      <div className="program-register">
        <BackLink />
        <div className="error-container">
          <h3>Program not found</h3>
          <p>
            The program you are looking for does not exist or has been deleted.
          </p>
        </div>
      </div>
    )
  }

  const renderStatus = (status: ActivityStatus) => {
    switch (status) {
      case ActivityStatus.OPEN:
        return (
          <Tag color="success" style={{ fontWeight: 500 }}>
            🟢 Registration open
          </Tag>
        )
      case ActivityStatus.CLOSED:
        return (
          <Tag color="error" style={{ fontWeight: 500 }}>
            🔴 Registration closed
          </Tag>
        )
      case ActivityStatus.UPCOMING:
        return (
          <Tag color="processing" style={{ fontWeight: 500 }}>
            🔵 Upcoming
          </Tag>
        )
      case ActivityStatus.FINISHED:
        return (
          <Tag color="default" style={{ fontWeight: 500 }}>
            ⚪ Finished
          </Tag>
        )
      default:
        return (
          <Tag color="default" style={{ fontWeight: 500 }}>
            ❓ Unspecified
          </Tag>
        )
    }
  }

  const isRegistrationDisabled =
    program?.status === ActivityStatus.CLOSED ||
    program?.status === ActivityStatus.FINISHED

  const handleOpenSurvey = (type: "pre" | "post") => {
    if (!programId) return
    let surveyId = ""
    let title = ""
    if (type === "pre" && preSurvey) {
      surveyId = preSurvey.surveyID
      title = preSurvey.title || "Pre-Program Survey"
    } else if (type === "post" && postSurvey) {
      surveyId = postSurvey.surveyID
      title = postSurvey.title || "Post-Program Survey"
    } else {
      notification.showError(
        "Survey not found",
        "No survey available for this program."
      )
      return
    }
    setActiveSurveyId(surveyId)
    setActiveSurveyTitle(title)
    setSurveyModalVisible(true)
  }

  const handleCloseSurveyModal = () => {
    setSurveyModalVisible(false)
  }

  if (!program) return null

  return (
    <div className="program-register">
      <BackLink />
      <img
        className="banner"
        src={
          program.imgUrl ||
          "https://via.placeholder.com/900x400?text=No+Image&bg=f8f9fa&color=6c757d"
        }
        alt={program.name}
        onError={(e) => {
          e.currentTarget.src =
            "https://via.placeholder.com/900x400?text=No+Image&bg=f8f9fa&color=6c757d"
        }}
      />
      <h1>{program.name}</h1>
      <div className="details">
        <div className="datetime-info">
          <div className="date-item">
            <FaRegCalendarAlt className="icon" />
            <span className="label">Date:</span>
            <span className="value">{formatDate(program.date)}</span>
          </div>
          <div className="time-item">
            <FaClock className="icon" />
            <span className="label">Time:</span>
            <span className="value">
              {formatTime(program.startTime)} - {formatTime(program.endTime)}
            </span>
          </div>
        </div>
        <div className="status-info">{renderStatus(program.status)}</div>
      </div>

      {/* Nút đăng ký/cancel cải tiến */}
      {participationLoading ? (
        <Button
          className="register-btn"
          type="primary"
          size="large"
          loading
          block
        >
          Loading...
        </Button>
      ) : participation && participation.status === 0 ? (
        <Button
          className="register-btn"
          type="default"
          size="large"
          danger
          onClick={handleCancel}
          loading={registering}
          disabled={isRegistrationDisabled}
          block
        >
          {registering ? "Canceling..." : "Cancel registration"}
        </Button>
      ) : (
        <Button
          className="register-btn"
          type="primary"
          size="large"
          onClick={handleRegister}
          loading={registering}
          disabled={isRegistrationDisabled}
          block
        >
          {isRegistrationDisabled
            ? "Registration closed"
            : registering
            ? "Registering..."
            : "Register to join"}
        </Button>
      )}

      <section className="about-section">
        <h2>About the program</h2>
        <p>{program.description}</p>
      </section>

      {program.speaker && (
        <section className="speakers-section">
          <h2>Speaker</h2>
          <div className="speaker-card">
            <div className="speaker-avatar">
              {program.speakerImageUrl && (
                <img
                  src={program.speakerImageUrl}
                  alt={program.speaker}
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://via.placeholder.com/64?text=No+Image"
                  }}
                />
              )}
            </div>
            <div className="speaker-info">
              <h3>{program.speaker}</h3>
            </div>
          </div>
        </section>
      )}

      <section className="program-address">
        <h2>Location</h2>
        <OfflineOnlineAddress program={program} />
        {program.locationType === 1 && (
          <GoogleMapComponent address={program.location} />
        )}
      </section>

      <section className="survey-section">
        <h2>Survey</h2>
        <div className="survey-links">
          <div className="survey-link" onClick={() => handleOpenSurvey("pre")}>
            <FaPoll className="survey-icon" />
            <strong>Pre-program survey</strong>
            <p>Take now</p>
          </div>
          <div className="survey-link" onClick={() => handleOpenSurvey("post")}>
            <FaPoll className="survey-icon" />
            <strong>Post-program survey</strong>
            <p>Take now</p>
          </div>
        </div>

        <SurveyModal
          visible={surveyModalVisible}
          onClose={handleCloseSurveyModal}
          surveyId={activeSurveyId}
          programId={programId || ""}
          surveyTitle={activeSurveyTitle}
        />
      </section>
    </div>
  )
}

export default ProgramRegister
