import React, { useEffect, useState, useCallback } from "react"
import {
  Table,
  Button,
  Space,
  Form,
  Typography,
  Popconfirm,
  Tag,
  Card,
  Image,
} from "antd"
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  FormOutlined,
} from "@ant-design/icons"
import type { ColumnsType } from "antd/es/table"
import type {
  CommunicationPrograms,
  ProgramParticipation,
} from "../../types/interfaces/CommunicationPrograms"
import type { Surveys } from "../../types/interfaces/Surveys"
import { ActivityStatus } from "../../types/enums/ActitvityStatusEnum"
import { LocationType } from "../../types/enums/LocationTypeEnum"
import {
  getCommunicationProgramsList,
  createCommunicationProgram,
  updateCommunicationProgram,
  deleteCommunicationProgram,
  getCommunicationProgramById,
  getUserProgramParticipationByProgramId,
} from "../../services/programAPI"
import {
  getSurveysList,
  getSurveyResultsByProgramId,
  linkSurveyResult,
  getSurveyById,
} from "../../services/surveyAPI"
import {
  uploadProgramImage,
  uploadSpeakerImage,
  deleteProgramImage,
  deleteSpeakerImage,
  extractFilenameFromUrl,
} from "../../utils/helpers/firebaseUpload"
import { useNotification } from "../../hooks/useNotification"
import dayjs from "dayjs"
import { getUserById } from "../../services/userAPI"
import "./StaffProgramManagement.scss"
import { SurveyTypeEnum } from "../../types/enums/SurveyTypeEnum"
import ProgramModal from "../../components/ProgramManagement/ProgramModal"
import ParticipationsDrawer from "../../components/ProgramManagement/ParticipationsDrawer"
import SurveyManagementModal from "../../components/ProgramManagement/SurveyManagementModal"

const { Title } = Typography

const StaffProgramManagement: React.FC = () => {
  const [programs, setPrograms] = useState<CommunicationPrograms[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingProgram, setEditingProgram] =
    useState<CommunicationPrograms | null>(null)
  const [participationsDrawer, setParticipationsDrawer] = useState(false)
  const [participations, setParticipations] = useState<ProgramParticipation[]>(
    []
  )
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [speakerImageFile, setSpeakerImageFile] = useState<File | null>(null)
  const [usernames, setUsernames] = useState<{ [userId: string]: string }>({})
  const [surveyModalVisible, setSurveyModalVisible] = useState(false)
  const [selectedProgram, setSelectedProgram] =
    useState<CommunicationPrograms | null>(null)
  const [availableSurveys, setAvailableSurveys] = useState<Surveys[]>([])
  const [linkedSurveys, setLinkedSurveys] = useState<any[]>([])
  const [linkedSurveyDetails, setLinkedSurveyDetails] = useState<any[]>([])
  const [surveyLoading, setSurveyLoading] = useState(false)
  const [form] = Form.useForm()
  const [surveyForm] = Form.useForm()
  const { showSuccess, showError } = useNotification()

  // Fetch programs data
  const fetchPrograms = useCallback(async () => {
    setLoading(true)
    try {
      const response = await getCommunicationProgramsList()
      setPrograms(response.data)
    } catch (error) {
      showError("Error", "Failed to fetch programs")
      console.error("Error fetching programs:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPrograms()
  }, [fetchPrograms])

  // Handle create program
  const handleCreate = () => {
    setEditingProgram(null)
    setModalVisible(true)
    setImageFile(null)
    setSpeakerImageFile(null)
    form.resetFields()
  }

  // Handle edit program
  const handleEdit = async (program: CommunicationPrograms) => {
    try {
      const response = await getCommunicationProgramById(program.programID)
      const programData = response.data
      setEditingProgram(programData)
      setModalVisible(true)
      setImageFile(null)
      setSpeakerImageFile(null)
      form.setFieldsValue({
        name: programData.name,
        description: programData.description,
        date: dayjs(programData.date),
        startTime: dayjs(`2000-01-01 ${programData.startTime}`),
        endTime: dayjs(`2000-01-01 ${programData.endTime}`),
        speaker: programData.speaker,
        locationType: programData.locationType,
        location: programData.location,
      })
    } catch (error) {
      showError("Error", "Failed to load program details")
      console.error("Error loading program:", error)
    }
  }

  // Handle delete program
  const handleDelete = async (programId: string) => {
    try {
      // Get program details to delete associated images
      const programResponse = await getCommunicationProgramById(programId)
      const programData = programResponse.data

      // Delete program from database first
      await deleteCommunicationProgram(programId)

      // Delete associated images from Firebase
      if (programData?.imgUrl) {
        try {
          const fileName = extractFilenameFromUrl(programData.imgUrl)
          console.log("Deleting program image:", fileName)
          if (fileName) {
            await deleteProgramImage(fileName)
          }
        } catch (e) {
          console.error("Error deleting program image:", e)
        }
      }

      if (programData?.speakerImageUrl) {
        try {
          const fileName = extractFilenameFromUrl(programData.speakerImageUrl)
          console.log("Deleting speaker image:", fileName)
          if (fileName) {
            await deleteSpeakerImage(fileName)
          }
        } catch (e) {
          console.error("Error deleting speaker image:", e)
        }
      }

      showSuccess("Success", "Program deleted successfully")
      fetchPrograms()
    } catch (error) {
      showError("Error", "Failed to delete program")
      console.error("Error deleting program:", error)
    }
  }

  // Handle view participations
  const handleViewParticipations = async (programId: string) => {
    try {
      const response = await getUserProgramParticipationByProgramId(programId)
      console.log("Participations response:", response.data)
      setParticipations(response.data || [])
      setParticipationsDrawer(true)
    } catch (error) {
      showError("Error", "Failed to fetch participations")
      console.error("Error fetching participations:", error)
    }
  }

  // Handle manage surveys
  const handleManageSurveys = async (program: CommunicationPrograms) => {
    setSelectedProgram(program)
    setSurveyModalVisible(true)
    setSurveyLoading(true)

    try {
      // Fetch available surveys and linked surveys
      const [surveysResponse, linkedResponse] = await Promise.all([
        getSurveysList(),
        getSurveyResultsByProgramId(program.programID),
      ])
      setAvailableSurveys(surveysResponse.data || [])
      setLinkedSurveys(linkedResponse.data || [])

      // Fetch survey details for each linked surveyId
      if (Array.isArray(linkedResponse.data)) {
        const detailResults = await Promise.all(
          linkedResponse.data.map(async (surveyId: string) => {
            try {
              const res = await getSurveyById(surveyId)
              return res.data
            } catch {
              return { surveyID: surveyId, title: "Unknown", type: null }
            }
          })
        )
        setLinkedSurveyDetails(detailResults)
      } else {
        setLinkedSurveyDetails([])
      }
    } catch (error) {
      showError("Error", "Failed to fetch survey data")
      console.error("Error fetching survey data:", error)
    } finally {
      setSurveyLoading(false)
    }
  }

  // Handle link survey
  const handleLinkSurvey = async (values: any) => {
    if (!selectedProgram) return

    try {
      await linkSurveyResult({
        surveyID: values.surveyId,
        programID: selectedProgram.programID,
      })

      showSuccess("Success", "Survey linked successfully")

      const linkedResponse = await getSurveyResultsByProgramId(
        selectedProgram.programID
      )
      setLinkedSurveys(linkedResponse.data || [])
      surveyForm.resetFields()
    } catch (error) {
      showError("Error", "Failed to link survey")
      console.error("Error linking survey:", error)
    }
  }

  // Handle form submit
  const handleSubmit = async (values: any) => {
    try {
      let imgUrl = editingProgram?.imgUrl || ""
      let speakerImageUrl = editingProgram?.speakerImageUrl || ""

      // Handle program image upload
      if (imageFile) {
        try {
          // Delete old image if exists and we're editing
          if (editingProgram?.imgUrl) {
            const oldFileName = extractFilenameFromUrl(editingProgram.imgUrl)
            if (oldFileName) {
              await deleteProgramImage(oldFileName)
            }
          }
          // Upload new image
          imgUrl = await uploadProgramImage(imageFile)
        } catch (e) {
          showError("Error", "Failed to upload program image")
          console.error("Program image upload error:", e)
        }
      }

      // Handle speaker image upload
      if (speakerImageFile) {
        try {
          if (editingProgram?.speakerImageUrl) {
            const oldFileName = extractFilenameFromUrl(
              editingProgram.speakerImageUrl
            )
            if (oldFileName) {
              await deleteSpeakerImage(oldFileName)
            }
          }
          // Upload new speaker image
          speakerImageUrl = await uploadSpeakerImage(speakerImageFile)
        } catch (e) {
          showError("Error", "Failed to upload speaker image")
          console.error("Speaker image upload error:", e)
        }
      }

      const programData = {
        name: values.name,
        description: values.description,
        imgUrl,
        date: values.date.format("YYYY-MM-DD"),
        startTime: values.startTime.format("HH:mm:ss"),
        endTime: values.endTime.format("HH:mm:ss"),
        speaker: values.speaker || "",
        speakerImageUrl,
        locationType: parseInt(values.locationType),
        location: values.location,
      }

      if (editingProgram) {
        await updateCommunicationProgram({
          ...programData,
          programID: editingProgram.programID,
          status: editingProgram.status,
        })
        showSuccess("Success", "Program updated successfully")
      } else {
        await createCommunicationProgram(programData)
        showSuccess("Success", "Program created successfully")
      }

      setModalVisible(false)
      setImageFile(null)
      setSpeakerImageFile(null)
      form.resetFields()
      fetchPrograms()
    } catch (error) {
      showError("Error", "Failed to save program")
      console.error("Error saving program:", error)
    }
  }

  const getSurveyTypeText = (type: SurveyTypeEnum) => {
    switch (type) {
      case 0:
        return "Pre-Program"
      case 1:
        return "Post-Program"
      default:
        return String(type ?? "Unknown")
    }
  }

  // Get status text and color
  const getStatusText = (status: ActivityStatus) => {
    switch (status) {
      case ActivityStatus.OPEN:
        return "Active"
      case ActivityStatus.CLOSED:
        return "Inactive"
      default:
        return "Unknown"
    }
  }

  const getStatusColor = (status: ActivityStatus) => {
    switch (status) {
      case ActivityStatus.OPEN:
        return "green"
      case ActivityStatus.CLOSED:
        return "red"
      default:
        return "default"
    }
  }

  // Get location type text and color
  const getLocationTypeText = (locationType: LocationType) => {
    switch (locationType) {
      case LocationType.ONLINE:
        return "Online"
      case LocationType.OFFLINE:
        return "Offline"
      default:
        return "Unknown"
    }
  }

  const getLocationTypeColor = (locationType: LocationType) => {
    switch (locationType) {
      case LocationType.ONLINE:
        return "blue"
      case LocationType.OFFLINE:
        return "orange"
      default:
        return "default"
    }
  }

  // Table columns
  const columns: ColumnsType<CommunicationPrograms> = [
    {
      title: "Image",
      dataIndex: "imgUrl",
      key: "imgUrl",
      width: 100,
      render: (imgUrl: string) =>
        imgUrl ? (
          <Image
            width={60}
            height={40}
            src={imgUrl}
            style={{ objectFit: "cover", borderRadius: 4 }}
          />
        ) : (
          <div
            style={{
              width: 60,
              height: 40,
              backgroundColor: "#f5f5f5",
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            No Image
          </div>
        ),
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      ellipsis: true,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      width: 120,
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Time",
      key: "time",
      width: 150,
      render: (_, record) => (
        <span>
          {dayjs(`2000-01-01 ${record.startTime}`).format("HH:mm")} -{" "}
          {dayjs(`2000-01-01 ${record.endTime}`).format("HH:mm")}
        </span>
      ),
    },
    {
      title: "Speaker",
      dataIndex: "speaker",
      key: "speaker",
      width: 120,
      render: (speaker: string) => speaker || "-",
    },
    {
      title: "Location Type",
      dataIndex: "locationType",
      key: "locationType",
      width: 120,
      render: (locationType: LocationType) => (
        <Tag color={getLocationTypeColor(locationType)}>
          {getLocationTypeText(locationType)}
        </Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status: ActivityStatus) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<UserOutlined />}
            onClick={() => handleViewParticipations(record.programID)}
            title="View Participations"
          />
          <Button
            type="text"
            icon={<FormOutlined />}
            onClick={() => handleManageSurveys(record)}
            title="Manage Surveys"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => {
              handleEdit(record)
            }}
            title="Edit"
          />
          <Popconfirm
            title="Are you sure to delete this program?"
            onConfirm={() => handleDelete(record.programID)}
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

  // Fetch usernames for participations
  useEffect(() => {
    const fetchUsernames = async () => {
      const missingUserIds = participations
        .map((p) => p.userID)
        .filter((id) => id && !usernames[id])
      if (missingUserIds.length === 0) return
      const newUsernames: { [userId: string]: string } = { ...usernames }
      await Promise.all(
        missingUserIds.map(async (userId) => {
          try {
            const res = await getUserById(userId)
            newUsernames[userId] =
              res.data?.fullName || res.data?.username || userId
          } catch {
            newUsernames[userId] = userId
          }
        })
      )
      setUsernames(newUsernames)
    }
    if (participations.length > 0) fetchUsernames()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [participations])

  return (
    <div className="staff-program-management">
      <Card>
        <div className="page-header">
          <Title level={2}>Communication Program Management</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Create Program
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={programs}
          rowKey="programID"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} programs`,
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <ProgramModal
        visible={modalVisible}
        form={form}
        editingProgram={editingProgram}
        imageFile={imageFile}
        speakerImageFile={speakerImageFile}
        setImageFile={setImageFile}
        setSpeakerImageFile={setSpeakerImageFile}
        onCancel={() => {
          setModalVisible(false)
          setImageFile(null)
          setSpeakerImageFile(null)
          form.resetFields()
        }}
        onSubmit={handleSubmit}
      />

      {/* Participations Drawer */}
      <ParticipationsDrawer
        visible={participationsDrawer}
        onClose={() => setParticipationsDrawer(false)}
        participations={participations}
        usernames={usernames}
        getStatusColor={getStatusColor}
        getStatusText={getStatusText}
      />

      {/* Survey Management Modal */}
      <SurveyManagementModal
        visible={surveyModalVisible}
        onCancel={() => {
          setSurveyModalVisible(false)
          setSelectedProgram(null)
          surveyForm.resetFields()
        }}
        selectedProgram={selectedProgram}
        surveyForm={surveyForm}
        handleLinkSurvey={handleLinkSurvey}
        availableSurveys={availableSurveys}
        linkedSurveys={linkedSurveys}
        linkedSurveyDetails={linkedSurveyDetails}
        surveyLoading={surveyLoading}
        getSurveyTypeText={getSurveyTypeText}
      />
    </div>
  )
}

export default StaffProgramManagement
