import React, { useEffect, useState, useCallback } from "react"
import { Table, Button, Space, Popconfirm, Card, Tag, Typography } from "antd"
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
} from "@ant-design/icons"
import type { ColumnsType } from "antd/es/table"
import dayjs from "dayjs"
import type { Courses, CourseContent } from "../../types/interfaces/Courses"
import {
  getCoursesList,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseContent,
} from "../../services/courseAPI"
import CourseModal from "../../components/CourseManagement/CourseModal"
import CourseContentModal from "../../components/CourseContentModal/CourseContentModal"
import CourseContentExpanded from "../../components/CourseContentExpanded/CourseContentExpanded"
import {
  uploadCourseImage,
  fallbackCoursesImages,
  deleteCourseImage,
  extractFilenameFromUrl,
} from "../../utils/helpers/firebaseUpload"
import { useNotification } from "../../hooks/useNotification"
import {
  getResultLevelFromLevelTarget,
  LevelTarget,
  mapCoursesFromApi,
} from "../../types/enums/LevelTargetEnum"
import "./StaffCourseManagement.scss"

const { Title } = Typography

interface CourseFormData {
  title: string
  contentSummary: string
  description: string
  startDate: string
  endDate: string
  ageMin: number
  capacity: number
  levelTarget?: LevelTarget
}

const StaffCourseManagement: React.FC = () => {
  const { showSuccess, showError, showWarning } = useNotification()
  const [courses, setCourses] = useState<Courses[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [contentModalVisible, setContentModalVisible] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Courses | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<{
    id: string
    name: string
  } | null>(null)
  const [expandedRowsContent, setExpandedRowsContent] = useState<{
    [key: string]: CourseContent[]
  }>({})
  const [expandedRowsLoading, setExpandedRowsLoading] = useState<{
    [key: string]: boolean
  }>({})
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([])

  // Fetch courses list
  const fetchCourses = useCallback(async () => {
    setLoading(true)
    try {
      const response = await getCoursesList()
      console.log("Fetched courses:", response.data)
      setCourses(mapCoursesFromApi(response.data))
    } catch (error) {
      showError("Error", "Failed to fetch courses")
    } finally {
      setLoading(false)
    }
  }, [])

  // Fetch course content for expanded row
  const fetchCourseContentForRow = async (courseId: string) => {
    setExpandedRowsLoading((prev) => ({ ...prev, [courseId]: true }))
    try {
      const response = await getCourseContent(courseId)
      setExpandedRowsContent((prev) => ({
        ...prev,
        [courseId]: response.data || [],
      }))
    } catch (error) {
      console.error("Error fetching course content:", error)
      setExpandedRowsContent((prev) => ({
        ...prev,
        [courseId]: [],
      }))
    } finally {
      setExpandedRowsLoading((prev) => ({ ...prev, [courseId]: false }))
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [fetchCourses])

  const handleSubmit = async (
    values: CourseFormData & { imageFile?: File }
  ) => {
    try {
      let imgUrl = editingCourse?.imgUrl || ""

      // Nếu có file mới và đang edit course có ảnh cũ, xóa ảnh cũ
      if (values.imageFile && editingCourse?.imgUrl) {
        try {
          const fileName = extractFilenameFromUrl(editingCourse.imgUrl)
          if (fileName) {
            await deleteCourseImage(fileName)
          }
        } catch (e) {
          console.warn("Failed to delete old image:", e)
        }
      }

      if (values.imageFile) {
        try {
          imgUrl = await uploadCourseImage(values.imageFile)
        } catch (e) {
          imgUrl =
            fallbackCoursesImages[
              Math.floor(Math.random() * fallbackCoursesImages.length)
            ]
          showWarning("Warning", "Upload failed, using fallback image.")
        }
      } else if (!imgUrl) {
        imgUrl =
          fallbackCoursesImages[
            Math.floor(Math.random() * fallbackCoursesImages.length)
          ]
      }

      // Map levelTarget (chuỗi) sang resultLevel (số) cho backend
      const resultLevel = getResultLevelFromLevelTarget(values.levelTarget)

      const courseData = {
        title: values.title,
        contentSummary: values.contentSummary,
        description: values.description,
        startDate: values.startDate,
        endDate: values.endDate,
        ageMin: values.ageMin,
        capacity: values.capacity,
        imgUrl: imgUrl,
        resultLevel,
      }

      if (editingCourse) {
        await updateCourse(editingCourse.courseId, courseData)
        showSuccess("Success", "Course updated successfully")
      } else {
        await createCourse(courseData)
        showSuccess("Success", "Course created successfully")
      }

      setModalVisible(false)
      setEditingCourse(null)
      fetchCourses()
    } catch (error) {
      showError("Error", "Failed to save course")
      console.error("Error saving course:", error)
      throw error
    }
  }

  // Handle delete course
  const handleDelete = async (courseId: string) => {
    try {
      await deleteCourse(courseId)
      showSuccess("Success", "Course deleted successfully")
      fetchCourses()
    } catch (error) {
      showError("Error", "Failed to delete course")
      console.error("Error deleting course:", error)
    }
  }

  // Handle edit course
  const handleEdit = (course: Courses) => {
    setEditingCourse(course)
    setModalVisible(true)
  }

  // Handle add new course
  const handleAdd = () => {
    setEditingCourse(null)
    setModalVisible(true)
  }

  // Handle modal cancel
  const handleModalCancel = () => {
    setModalVisible(false)
    setEditingCourse(null)
  }

  // Handle manage content
  const handleManageContent = (course: Courses) => {
    setSelectedCourse({ id: course.courseId, name: course.title })
    setContentModalVisible(true)
  }

  // Handle content modal cancel
  const handleContentModalCancel = () => {
    setContentModalVisible(false)
    setSelectedCourse(null)

    if (selectedCourse?.id && expandedRowsContent[selectedCourse.id]) {
      fetchCourseContentForRow(selectedCourse.id)
    }
  }

  // Handle row expand
  const handleRowExpand = (expanded: boolean, record: Courses) => {
    if (expanded) {
      fetchCourseContentForRow(record.courseId)
    }
  }

  // Expandable row render - now using the separate component
  const expandedRowRender = (record: Courses) => {
    const courseContent = expandedRowsContent[record.courseId] || []
    const isLoading = expandedRowsLoading[record.courseId] || false

    return (
      <CourseContentExpanded
        course={record}
        courseContent={courseContent}
        isLoading={isLoading}
        onManageContent={handleManageContent}
      />
    )
  }

  // Table columns
  const columns: ColumnsType<Courses> = [
    {
      title: "Image",
      dataIndex: "imgUrl",
      key: "imgUrl",
      width: 90,
      render: (imgUrl: string | null) => (
        <img
          src={imgUrl || fallbackCoursesImages[0]}
          alt="course"
          style={{
            width: 60,
            height: 40,
            objectFit: "cover",
            borderRadius: 4,
            border: "1px solid #eee",
          }}
          onError={(e) => {
            e.currentTarget.onerror = null
            e.currentTarget.src = fallbackCoursesImages[0]
          }}
        />
      ),
      fixed: "left",
    },
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: 200,
      ellipsis: true,
      fixed: "left",
    },
    {
      title: "Summary",
      dataIndex: "contentSummary",
      key: "contentSummary",
      width: 200,
      ellipsis: true,
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      width: 120,
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      key: "endDate",
      width: 120,
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (statusNumber: number) => {
        const color =
          statusNumber === 0 ? "green" : statusNumber === 1 ? "red" : "orange"
        const statusText =
          statusNumber === 0
            ? "Active"
            : statusNumber === 1
            ? "Inactive"
            : "Pending"
        return <Tag color={color}>{statusText}</Tag>
      },
    },
    {
      title: "Age Min",
      dataIndex: "ageMin",
      key: "ageMin",
      width: 80,
      render: (age: number | null) => age || "N/A",
    },
    {
      title: "Capacity",
      dataIndex: "capacity",
      key: "capacity",
      width: 80,
      render: (capacity: number | null) => capacity || "N/A",
    },
    {
      title: "Level",
      dataIndex: "resultLevel",
      key: "resultLevel",
      width: 100,
      render: (levelNumber: number) => {
        switch (levelNumber) {
          case 1:
            return <Tag color="green">Low</Tag>
          case 2:
            return <Tag color="blue">Medium</Tag>
          case 3:
            return <Tag color="red">High</Tag>
        }
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      fixed: "right",
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<FileTextOutlined />}
            size="small"
            onClick={() => handleManageContent(record)}
            title="Manage Content"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => handleEdit(record)}
            title="Edit Course"
          />
          <Popconfirm
            title="Are you sure you want to delete this course?"
            onConfirm={() => handleDelete(record.courseId)}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              size="small"
              danger
              title="Delete Course"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className="staff-course-management-container">
      <Card>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <Title level={2} style={{ margin: 0 }}>
            Course Management
          </Title>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            Add New Course
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={courses}
          rowKey="courseId"
          loading={loading}
          scroll={{ x: 100, y: 500 }}
          expandable={{
            expandedRowRender,
            expandedRowKeys,
            onExpand: (expanded, record) => {
              setExpandedRowKeys(expanded ? [record.courseId] : [])
              handleRowExpand(expanded, record)
            },
            rowExpandable: () => true,
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} courses`,
          }}
        />
      </Card>

      <CourseModal
        visible={modalVisible}
        editingCourse={editingCourse}
        onCancel={handleModalCancel}
        onSubmit={handleSubmit}
      />

      <CourseContentModal
        visible={contentModalVisible}
        courseId={selectedCourse?.id || null}
        courseName={selectedCourse?.name || ""}
        onCancel={handleContentModalCancel}
      />
    </div>
  )
}

export default StaffCourseManagement
