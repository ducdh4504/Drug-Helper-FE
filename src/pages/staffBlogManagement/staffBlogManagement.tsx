import React, { useState, useEffect, useCallback } from "react"
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Typography,
  Popconfirm,
  Tag,
  Image,
  Card,
} from "antd"
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from "@ant-design/icons"
import { useSelector } from "react-redux"
import type { ColumnsType } from "antd/es/table"
import type { RootState } from "../../redux/store"
import type { Blogs } from "../../types/interfaces/Blogs"
import {
  getBlogsList,
  createBlog,
  updateBlog,
  deleteBlog,
  getBlogById,
} from "../../services/blogAPI"
import { useNotification } from "../../hooks/useNotification"
import dayjs from "dayjs"
import "./staffBlogManagement.scss"
import { PaperDraftEnum } from "../../types/enums/PaperDraftEnum"
import {
  uploadBlogImage,
  deleteBlogImage,
  extractFilenameFromUrl,
} from "../../utils/helpers/firebaseUpload"
import BlogModal from "../../components/BlogManagement/BlogModal"

const { Title } = Typography

const StaffBlogManagement: React.FC = () => {
  const [blogs, setBlogs] = useState<Blogs[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingBlog, setEditingBlog] = useState<Blogs | null>(null)
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewBlog, setPreviewBlog] = useState<Blogs | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [form] = Form.useForm()
  const { userId } = useSelector((state: RootState) => state.auth)
  const { showSuccess, showError } = useNotification()

  // Fetch blogs data
  const fetchBlogs = useCallback(async () => {
    setLoading(true)
    try {
      const response = await getBlogsList()
      setBlogs(response.data)
    } catch (error) {
      showError("Error", "Failed to fetch blogs")
      console.error("Error fetching blogs:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBlogs()
  }, [fetchBlogs])

  // Handle create blog
  const handleCreate = () => {
    setEditingBlog(null)
    setModalVisible(true)
    form.resetFields()
  }

  // Handle edit blog
  const handleEdit = async (blog: Blogs) => {
    try {
      const response = await getBlogById(blog.blogID)
      const blogData = response.data
      setEditingBlog(blogData)
      setModalVisible(true)
      // Reset image file to show existing image
      setImageFile(null)
      form.setFieldsValue({
        title: blogData.title,
        content: blogData.content,
        status: blogData.status,
        levelTarget: blogData.resultLevel,
        publishDate: blogData.publishDate ? dayjs(blogData.publishDate) : null,
        imgUrl: blogData.imgUrl,
      })
    } catch (error) {
      showError("Error", "Failed to load blog details")
      console.error("Error loading blog:", error)
    }
  }

  // Handle preview blog
  const handlePreview = async (blog: Blogs) => {
    try {
      const response = await getBlogById(blog.blogID)
      setPreviewBlog(response.data)
      setPreviewVisible(true)
    } catch (error) {
      showError("Error", "Failed to load blog details")
      console.error("Error loading blog:", error)
    }
  }

  // Handle delete blog
  const handleDelete = async (blogId: string) => {
    try {
      // Get blog details to delete associated image
      const blogResponse = await getBlogById(blogId)
      const blogData = blogResponse.data

      // Delete blog from database first
      await deleteBlog(blogId)

      // Delete associated image from Firebase
      if (blogData?.imgUrl) {
        try {
          const fileName = extractFilenameFromUrl(blogData.imgUrl)
          if (fileName) {
            await deleteBlogImage(fileName)
          }
        } catch (e) {
          console.error("Error deleting blog image:", e)
        }
      }

      showSuccess("Success", "Blog deleted successfully")
      fetchBlogs()
    } catch (error) {
      showError("Error", "Failed to delete blog")
      console.error("Error deleting blog:", error)
    }
  }

  // Handle form submit
  const handleSubmit = async (values: any) => {
    try {
      let imgUrl = editingBlog?.imgUrl || null

      if (imageFile) {
        try {
          if (editingBlog?.imgUrl) {
            const oldFileName = extractFilenameFromUrl(editingBlog.imgUrl)
            if (oldFileName) {
              await deleteBlogImage(oldFileName)
            }
          }
          imgUrl = await uploadBlogImage(imageFile)
        } catch (e) {
          showError("Error", "Failed to upload blog image")
          console.error("Blog image upload error:", e)
        }
      }

      const blogData: any = {
        title: values.title,
        content: values.content,
        status: values.status,
        levelTarget: values.levelTarget,
        publishDate: values.publishDate?.format("YYYY-MM-DD") || null,
        imgUrl,
      }

      if (editingBlog) {
        await updateBlog({
          ...blogData,
          blogID: editingBlog.blogID,
        })
        showSuccess("Success", "Blog updated successfully")
      } else {
        await createBlog({
          ...blogData,
          resultLevel: blogData.levelTarget,
          userId: userId || "",
        })
        showSuccess("Success", "Blog created successfully")
      }

      setModalVisible(false)
      setImageFile(null)
      form.resetFields()
      fetchBlogs()
    } catch (error) {
      showError("Error", "Failed to save blog")
      console.error("Error saving blog:", error)
    }
  }

  // Get status color
  const getStatusColor = (status: PaperDraftEnum) => {
    switch (status) {
      case PaperDraftEnum.Draft:
        return "yellow"
      case PaperDraftEnum.Opened:
        return "green"
      case PaperDraftEnum.Closed:
        return "red"
      default:
        return "default"
    }
  }

  // Get status text
  const getStatusText = (status: PaperDraftEnum) => {
    switch (status) {
      case PaperDraftEnum.Draft:
        return "Draft"
      case PaperDraftEnum.Opened:
        return "Opened"
      case PaperDraftEnum.Closed:
        return "Closed"
      default:
        return "Unknown"
    }
  }

  const getLevelTargetText = (level: number) => {
    switch (level) {
      case 1:
        return "Low"
      case 2:
        return "Medium"
      case 3:
        return "High"
      default:
        return "Unknown"
    }
  }

  // Get level target color
  const getLevelColor = (level?: number) => {
    switch (level) {
      case 1:
        return "green"
      case 2:
        return "orange"
      case 3:
        return "red"
      default:
        return "default"
    }
  }

  // Table columns
  const columns: ColumnsType<Blogs> = [
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
      title: "Title",
      dataIndex: "title",
      key: "title",
      ellipsis: true,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status: PaperDraftEnum) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
    {
      title: "Level Target",
      dataIndex: "resultLevel",
      key: "resultLevel",
      width: 120,
      render: (level?: number) =>
        level ? (
          <Tag color={getLevelColor(level)}>{getLevelTargetText(level)}</Tag>
        ) : (
          "-"
        ),
    },
    {
      title: "Publish Date",
      dataIndex: "publishDate",
      key: "publishDate",
      width: 120,
      render: (date: string) => (date ? dayjs(date).format("DD/MM/YYYY") : "-"),
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => handlePreview(record)}
            title="Preview"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            title="Edit"
          />
          <Popconfirm
            title="Are you sure to delete this blog?"
            onConfirm={() => handleDelete(record.blogID)}
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
    <div className="staff-blog-management">
      <Card>
        <div className="page-header">
          <Title level={2}>Blog Management</Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            Create Blog
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={blogs}
          rowKey="blogID"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <BlogModal
        visible={modalVisible}
        form={form}
        editingBlog={editingBlog}
        imageFile={imageFile}
        setImageFile={setImageFile}
        onCancel={() => {
          setModalVisible(false)
          setImageFile(null)
          form.resetFields()
        }}
        onFinish={handleSubmit}
      />

      {/* Preview Modal */}
      <Modal
        title="Blog Preview"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPreviewVisible(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {previewBlog && (
          <div className="blog-preview">
            <div className="blog-preview-header">
              <Title level={3}>{previewBlog.title}</Title>
              <div className="blog-meta">
                <Tag color={getStatusColor(previewBlog.status)}>
                  {getStatusText(previewBlog.status)}
                </Tag>
                {previewBlog.publishDate && (
                  <span className="publish-date">
                    Publish Date:{" "}
                    {dayjs(previewBlog.publishDate).format("DD/MM/YYYY")}
                  </span>
                )}
              </div>
            </div>

            {previewBlog.imgUrl && (
              <div className="blog-image-container">
                <Image
                  src={previewBlog.imgUrl}
                  style={{
                    width: "100%",
                    height: 300,
                    objectFit: "cover",
                  }}
                  preview={false}
                />
              </div>
            )}

            <div className="blog-content">{previewBlog.content}</div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default StaffBlogManagement
