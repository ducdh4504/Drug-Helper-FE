import React, { useState, useEffect } from "react"
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  DatePicker,
  Upload,
  Image,
  Popconfirm,
  Space,
  Tag,
  Card,
  Typography,
  Row,
  Col,
  Spin,
} from "antd"
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  EyeOutlined,
} from "@ant-design/icons"
import { useDispatch, useSelector } from "react-redux"
import type { RootState, AppDispatch } from "../../redux/store"
import {
  fetchConsultantCertificates,
  createCertificate,
  updateCertificate,
  deleteCertificate,
  selectConsultantCertificates,
  selectConsultantCertificatesLoading,
  selectConsultantsError,
} from "../../redux/slices/consultantSlice"
import {
  uploadCertificateImage,
  deleteCertificateImage,
  extractFilenameFromUrl,
} from "../../utils/helpers/firebaseUpload"
import { ActivityStatus } from "../../types/enums/ActitvityStatusEnum"
import type { Certificates } from "../../types/interfaces/Certificates"
import type { UploadFile } from "antd/es/upload/interface"
import dayjs from "dayjs"
import "./certificateManagement.scss"
import { useNotification } from "../../hooks/useNotification"

const { Title } = Typography

const CertificateManagement: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { showSuccess, showError } = useNotification()
  const currentUserId = useSelector((state: RootState) => state.auth.userId)
  const certificates = useSelector(
    selectConsultantCertificates(currentUserId || "")
  )
  const loading = useSelector(selectConsultantCertificatesLoading)
  const error = useSelector(selectConsultantsError)

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [editingCertificate, setEditingCertificate] =
    useState<Certificates | null>(null)
  const [form] = Form.useForm()
  const [uploading, setUploading] = useState(false)
  const [imageUrl, setImageUrl] = useState<string>("")
  const [fileList, setFileList] = useState<UploadFile[]>([])

  useEffect(() => {
    if (currentUserId) {
      dispatch(fetchConsultantCertificates(currentUserId))
    }
  }, [dispatch, currentUserId])

  const getStatusTag = (status: ActivityStatus) => {
    const statusConfig = {
      [ActivityStatus.OPEN]: { color: "green", text: "Active" },
      [ActivityStatus.CLOSED]: { color: "red", text: "Closed" },
      [ActivityStatus.UPCOMING]: { color: "blue", text: "Upcoming" },
      [ActivityStatus.FINISHED]: { color: "gray", text: "Finished" },
    }

    const config = statusConfig[status]
    return <Tag color={config.color}>{config.text}</Tag>
  }

  const handleUpload = async (file: File): Promise<string> => {
    setUploading(true)
    try {
      const url = await uploadCertificateImage(file)
      setImageUrl(url)
      return url
    } catch (error) {
      showError("Upload failed", "Failed to upload image")
      throw error
    } finally {
      setUploading(false)
    }
  }

  const uploadProps = {
    fileList,
    beforeUpload: (file: File) => {
      const isImage = file.type.startsWith("image/")
      if (!isImage) {
        showError("Invalid file", "Only image files are allowed!")
        return false
      }
      const isLt5M = file.size / 1024 / 1024 < 5
      if (!isLt5M) {
        showError("File too large", "Image must be smaller than 5MB!")
        return false
      }
      return false // Prevent auto upload
    },
    onChange: async (info: any) => {
      const { fileList: newFileList } = info
      setFileList(newFileList)

      if (newFileList.length > 0) {
        const file = newFileList[0].originFileObj
        if (file) {
          try {
            await handleUpload(file)
          } catch (error) {
            showError("Upload failed", "Failed to upload image")
          }
        }
      } else {
        setImageUrl("")
      }
    },
    onRemove: () => {
      setImageUrl("")
      setFileList([])
    },
  }

  const showModal = (certificate?: Certificates) => {
    setIsModalVisible(true)
    if (certificate) {
      setIsEditing(true)
      setEditingCertificate(certificate)
      setImageUrl(certificate.imgUrl)
      form.setFieldsValue({
        certificateName: certificate.certificateName,
        dateAcquired: certificate.dateAcquired
          ? dayjs(certificate.dateAcquired)
          : null,
        status: certificate.status,
      })
    } else {
      setIsEditing(false)
      setEditingCertificate(null)
      setImageUrl("")
      form.resetFields()
    }
    setFileList([])
  }

  const handleCancel = () => {
    setIsModalVisible(false)
    setIsEditing(false)
    setEditingCertificate(null)
    setImageUrl("")
    setFileList([])
    form.resetFields()
  }

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields()

      if (!imageUrl) {
        showError("Missing Image", "Please upload a certificate image")
        return
      }

      // If editing and we have a new image, delete the old one
      if (
        isEditing &&
        editingCertificate?.imgUrl &&
        imageUrl !== editingCertificate.imgUrl
      ) {
        try {
          const oldFileName = extractFilenameFromUrl(editingCertificate.imgUrl)
          if (oldFileName) {
            await deleteCertificateImage(oldFileName)
          }
        } catch (e) {
          console.warn("Failed to delete old certificate image:", e)
        }
      }

      const certificateData = {
        imgUrl: imageUrl,
        certificateName: values.certificateName,
        dateAcquired: values.dateAcquired.format("YYYY-MM-DD"),
        status: values.status || ActivityStatus.OPEN,
      }

      if (isEditing && editingCertificate) {
        await dispatch(
          updateCertificate({
            certificateId: editingCertificate.certificateID,
            data: certificateData,
          })
        ).unwrap()
        showSuccess("Success", "Certificate updated successfully!")
      } else {
        await dispatch(
          createCertificate({
            userID: currentUserId!,
            ...certificateData,
          })
        ).unwrap()
        await dispatch(fetchConsultantCertificates(currentUserId!))
        showSuccess("Success", "Certificate added successfully!")
      }

      handleCancel()
    } catch (error: any) {
      showError("Error", error.message || "An error occurred")
    }
  }

  const handleDelete = async (certificateId: string) => {
    try {
      // Find the certificate to get the image URL before deleting
      const certificateToDelete = certificates?.find(
        (cert: Certificates) => cert.certificateID === certificateId
      )

      await dispatch(
        deleteCertificate({
          certificateId,
          userID: currentUserId!,
        })
      ).unwrap()

      // Delete associated image from Firebase
      if (certificateToDelete?.imgUrl) {
        try {
          const fileName = extractFilenameFromUrl(certificateToDelete.imgUrl)
          if (fileName) {
            await deleteCertificateImage(fileName)
          }
        } catch (e) {
          console.error("Error deleting certificate image:", e)
        }
      }

      showSuccess("Success", "Certificate deleted successfully!")
    } catch (error: any) {
      showError("Error", error.message || "Failed to delete certificate")
    }
  }

  const columns = [
    {
      title: "Image",
      dataIndex: "imgUrl",
      key: "imgUrl",
      width: 120,
      render: (imgUrl: string) => (
        <Image
          width={80}
          height={60}
          src={imgUrl}
          style={{ objectFit: "cover", borderRadius: 4 }}
        />
      ),
    },
    {
      title: "Certificate Name",
      dataIndex: "certificateName",
      key: "certificateName",
    },
    {
      title: "Date Acquired",
      dataIndex: "dateAcquired",
      key: "dateAcquired",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: ActivityStatus) => getStatusTag(status),
    },
    {
      title: "Actions",
      key: "action",
      width: 200,
      render: (_: any, record: Certificates) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => {
              Modal.info({
                title: record.certificateName,
                content: (
                  <div style={{ textAlign: "center" }}>
                    <Image
                      src={record.imgUrl}
                      style={{ maxWidth: "100%", marginTop: 16 }}
                    />
                    <p style={{ marginTop: 16 }}>
                      Date acquired:{" "}
                      {dayjs(record.dateAcquired).format("DD/MM/YYYY")}
                    </p>
                  </div>
                ),
                width: 600,
              })
            }}
          >
            View
          </Button>
          <Button
            type="default"
            icon={<EditOutlined />}
            size="small"
            onClick={() => showModal(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete certificate"
            description="Are you sure you want to delete this certificate?"
            onConfirm={() => handleDelete(record.certificateID)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              size="small"
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  if (!currentUserId) {
    return (
      <Card>
        <div style={{ textAlign: "center", padding: "50px 0" }}>
          <Typography.Text type="danger">
            Please login to view certificates
          </Typography.Text>
        </div>
      </Card>
    )
  }

  return (
    <div className="certificate-management">
      <Card>
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 24 }}
        >
          <Col>
            <Title level={3}>Certificate Management</Title>
          </Col>
          <Col>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => showModal()}
              size="large"
            >
              Add Certificate
            </Button>
          </Col>
        </Row>

        {error && (
          <div style={{ marginBottom: 16 }}>
            <Typography.Text type="danger">{error}</Typography.Text>
          </div>
        )}

        <Table
          columns={columns}
          dataSource={certificates || []}
          rowKey="certificateID"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} certificates`,
          }}
          locale={{
            emptyText: "No certificates found",
          }}
        />
      </Card>

      <Modal
        title={isEditing ? "Edit Certificate" : "Add New Certificate"}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={handleCancel}
        confirmLoading={loading || uploading}
        width={600}
        okText={isEditing ? "Update" : "Add"}
        cancelText="Cancel"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
          <Form.Item label="Certificate Image" required>
            <Upload
              {...uploadProps}
              listType="picture-card"
              maxCount={1}
              accept="image/*"
            >
              {fileList.length === 0 && !imageUrl && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload</div>
                </div>
              )}
            </Upload>
            {uploading && (
              <div style={{ marginTop: 8 }}>
                <Spin size="small" /> Uploading...
              </div>
            )}
            {imageUrl && !uploading && (
              <div style={{ marginTop: 8 }}>
                <Image
                  src={imageUrl}
                  width={100}
                  height={100}
                  style={{ objectFit: "cover", borderRadius: 4 }}
                />
              </div>
            )}
          </Form.Item>

          <Form.Item
            name="certificateName"
            label="Certificate Name"
            rules={[
              { required: true, message: "Please enter certificate name" },
              {
                min: 3,
                message: "Certificate name must be at least 3 characters",
              },
            ]}
          >
            <Input placeholder="Enter certificate name" />
          </Form.Item>

          <Form.Item
            name="dateAcquired"
            label="Date Acquired"
            rules={[
              {
                required: true,
                message: "Please select the date acquired",
              },
            ]}
          >
            <DatePicker
              style={{ width: "100%" }}
              format="DD/MM/YYYY"
              placeholder="Select date acquired"
              disabledDate={(current) =>
                current && current > dayjs().endOf("day")
              }
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default CertificateManagement
