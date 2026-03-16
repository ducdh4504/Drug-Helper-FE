import React, { useState, useEffect, useCallback } from "react"
import { Calendar, momentLocalizer } from "react-big-calendar"
import { Table, Button, Tag, Space, Card, Tooltip, Modal } from "antd"
import {
  CalendarOutlined,
  PlusOutlined,
  CheckOutlined,
  CloseOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons"
import moment from "moment"
import { useNotification } from "../../hooks/useNotification"
import "moment/locale/vi"
import "react-big-calendar/lib/css/react-big-calendar.css"
import "./ScheduleManagement.scss"
import dayjs from "dayjs"
import { useSelector } from "react-redux"
import type { RootState } from "../../redux/store"
import {
  getConsultantSchedules,
  createConsultantSchedule,
  updateConsultantSchedule,
  deleteConsultantSchedule,
  linkAppointmentToSchedule,
} from "../../services/consultantAPI"
import {
  getAppointmentsByConsultant,
  updateAppointmentStatus,
} from "../../services/appointmentAPI"
import { getUserById } from "../../services/userAPI"
import type {
  ConsultantSchedules,
  CalendarEvent,
  Appointments,
} from "../../types/interfaces/Schedule"
import AddScheduleModal from "../../components/AddScheduleModal/AddScheduleModal"
import { Form, Input, TimePicker, DatePicker } from "antd"
import { AppointmentResponseEnum } from "../../types/enums/AppointmentResponseEnum"
import { getHourMinuteFromISO } from "../../utils/helpers/timeUtils"

moment.locale("en")

// Setup localizer for react-big-calendar
const localizer = momentLocalizer(moment)

const ScheduleManagement: React.FC = () => {
  const notification = useNotification()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [appointments, setAppointments] = useState<Appointments[]>([])
  const [usernames, setUsernames] = useState<{ [userId: string]: string }>({})
  const [loading, setLoading] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingSchedule, setEditingSchedule] =
    useState<ConsultantSchedules | null>(null)
  const [editingAppointment, setEditingAppointment] =
    useState<Appointments | null>(null)
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const [showAppointmentModal, setShowAppointmentModal] = useState(false)
  const [editForm] = Form.useForm()
  const [appointmentForm] = Form.useForm()

  const openEditModal = (schedule: ConsultantSchedules) => {
    setEditingSchedule(schedule)
    setShowScheduleModal(true)
    editForm.setFieldsValue({
      date: dayjs(schedule.date),
      startTime: dayjs(schedule.startTime, "HH:mm"),
      endTime: dayjs(schedule.endTime, "HH:mm"),
      notes: schedule.notes || "",
    })
  }

  const handleEditModalOk = async () => {
    try {
      const values = await editForm.validateFields()
      await handleEditSchedule({
        date: values.date.format("YYYY-MM-DD"),
        startTime: values.startTime.format("HH:mm"),
        endTime: values.endTime.format("HH:mm"),
        notes: values.notes,
      })
      setShowScheduleModal(false)
      setEditingSchedule(null)
      editForm.resetFields()
    } catch (err) {
      notification.showError("Validation failed", "Please check your input.")
    }
  }

  const handleEditModalCancel = () => {
    setShowScheduleModal(false)
    setEditingSchedule(null)
    editForm.resetFields()
  }

  const openAppointmentModal = (appointment: Appointments) => {
    setEditingAppointment(appointment)
    setShowAppointmentModal(true)
    appointmentForm.setFieldsValue({
      date: dayjs(appointment.date),
      startTime: dayjs(appointment.startTime, "HH:mm:ss"),
      endTime: dayjs(appointment.endTime, "HH:mm:ss"),
      notes: appointment.note || "",
      memberName: usernames[appointment.memberID] || appointment.memberID,
    })
  }

  const handleAppointmentModalOk = async () => {
    try {
      const values = await appointmentForm.validateFields()
      if (editingAppointment) {
        // Find the corresponding schedule from approved appointment
        const schedule = personalSchedules.find(
          (s) => s.appointmentID === editingAppointment.appointmentID
        )
        if (schedule) {
          // Temporarily set editingSchedule to use existing handleEditSchedule function
          setEditingSchedule(schedule)
          await handleEditSchedule({
            date: values.date.format("YYYY-MM-DD"),
            startTime: values.startTime.format("HH:mm"),
            endTime: values.endTime.format("HH:mm"),
            notes: values.notes,
          })
          setEditingSchedule(null)
        }
      }
      setShowAppointmentModal(false)
      setEditingAppointment(null)
      appointmentForm.resetFields()
    } catch (err) {
      notification.showError("Validation failed", "Please check your input.")
    }
  }

  const handleAppointmentModalCancel = () => {
    setShowAppointmentModal(false)
    setEditingAppointment(null)
    appointmentForm.resetFields()
  }

  const [personalSchedules, setPersonalSchedules] = useState<
    ConsultantSchedules[]
  >([])

  // Lấy userId từ Redux auth state
  const { userId } = useSelector((state: RootState) => state.auth)
  const consultantId = userId || ""

  // Load data
  const loadData = useCallback(async () => {
    if (!consultantId) {
      notification.showError(
        "Not logged in",
        "Please login to view your schedule!"
      )
      return
    }

    try {
      setLoading(true)

      const schedulesResponse = await getConsultantSchedules(consultantId)
      const schedules: ConsultantSchedules[] = schedulesResponse.data || []
      const appointmentsResponse = await getAppointmentsByConsultant(
        consultantId
      )
      const appointmentsList: Appointments[] = appointmentsResponse.data || []
      setAppointments(appointmentsList)

      // Fetch usernames for all memberIDs
      const missingUserIds = appointmentsList
        .map((a) => a.memberID)
        .filter((id) => id && !usernames[id])
      if (missingUserIds.length > 0) {
        const newUsernames = { ...usernames }
        await Promise.all(
          missingUserIds.map(async (userId) => {
            try {
              const res = await getUserById(userId)
              newUsernames[userId] =
                res.data?.userName || res.data?.fullName || userId
            } catch {
              newUsernames[userId] = userId
            }
          })
        )
        setUsernames(newUsernames)
      }

      const calendarEvents: CalendarEvent[] = []

      schedules.forEach((schedule) => {
        const dateOnly = schedule.date.split("T")[0]
        const startTime = dayjs(`${dateOnly}T${schedule.startTime}`)
        const endTime = dayjs(`${dateOnly}T${schedule.endTime}`)

        // Kiểm tra xem schedule này có phải từ appointment không
        const isFromAppointment =
          schedule.appointmentID !== null &&
          schedule.appointmentID !== undefined &&
          schedule.appointmentID !== ""

        let memberName = ""
        if (isFromAppointment) {
          const relatedAppointment = appointmentsList.find(
            (a) => a.appointmentID === schedule.appointmentID
          )
          if (relatedAppointment) {
            memberName =
              usernames[relatedAppointment.memberID] ||
              relatedAppointment.memberID
          }
        }

        calendarEvents.push({
          id: `schedule-${schedule.consultantScheduleID}`,
          title: isFromAppointment
            ? `Appointment: ${memberName}`
            : "Personal Schedule",
          start: startTime.toDate(),
          end: endTime.toDate(),
          resource: {
            notes: schedule.notes || undefined,
            isFromAppointment,
            appointmentId: schedule.appointmentID,
            scheduleType: isFromAppointment ? "appointment" : "personal",
            userFullName: memberName,
          },
        })
      })

      appointmentsList.forEach((appointment) => {
        const isAlreadySchedule = schedules.some(
          (s) => s.appointmentID === appointment.appointmentID
        )

        if (!isAlreadySchedule) {
          const startTime = dayjs(
            `${appointment.date} ${appointment.startTime}`
          )
          const endTime = dayjs(`${appointment.date} ${appointment.endTime}`)

          let title = ""
          const memberName =
            usernames[appointment.memberID] || appointment.memberID
          switch (appointment.status) {
            case AppointmentResponseEnum.ACCEPTED:
              title = `Appointment: ${memberName}`
              break
            case AppointmentResponseEnum.REJECTED:
              title = `Rejected: ${memberName}`
              break
            case AppointmentResponseEnum.NORESPONDED:
            default:
              title = `Pending: ${memberName}`
              break
          }

          calendarEvents.push({
            id: `appointment-${appointment.appointmentID}`,
            title,
            start: startTime.toDate(),
            end: endTime.toDate(),
            resource: {
              status: appointment.status,
              appointmentId: appointment.appointmentID,
              userId: appointment.memberID,
              userFullName: memberName,
              notes: appointment.note || undefined,
            },
          })
        }
      })

      setEvents(calendarEvents)
      setPersonalSchedules(schedules)
      notification.showSuccess("Success", "Schedule loaded successfully!")
    } catch (error: any) {
      console.error("Error loading data:", error)
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "An error occurred while loading data!"
      notification.showError("Load failed", errorMessage)

      // Reset data when error
      setEvents([])
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }, [consultantId, usernames, notification])

  useEffect(() => {
    loadData()
  }, [])

  // Handle appointment status update
  const handleUpdateAppointmentStatus = async (
    appointmentId: string,
    status: number
  ) => {
    try {
      setLoading(true)
      await updateAppointmentStatus({ appointmentId, status })

      const statusText = status === 1 ? "approve" : "reject"
      notification.showSuccess(
        "Success",
        `Successfully ${statusText} the appointment!`
      )

      await loadData()
    } catch (error: any) {
      console.error("Error updating appointment status:", error)
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "An error occurred while updating status!"
      notification.showError("Update failed", errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Confirm modal for status update
  const showConfirm = (
    appointmentId: string,
    status: number,
    userFullName: string
  ) => {
    const isApprove = status === 1
    Modal.confirm({
      title: `${isApprove ? "Approve" : "Reject"} appointment`,
      icon: <ExclamationCircleOutlined />,
      content: `Are you sure you want to ${
        isApprove ? "approve" : "reject"
      } the appointment with ${userFullName}?`,
      okText: isApprove ? "Approve" : "Reject",
      okType: isApprove ? "primary" : "danger",
      cancelText: "Cancel",
      async onOk() {
        try {
          await handleUpdateAppointmentStatus(appointmentId, status)
          const appointment = appointments.find(
            (a) => a.appointmentID === appointmentId
          )
          if (appointment) {
            const createdSchedule = await createConsultantSchedule({
              consultantId,
              dayOfWeek: dayjs(appointment.date).day(),
              date: appointment.date,
              startTime: getHourMinuteFromISO(appointment.startTime),
              endTime: getHourMinuteFromISO(appointment.endTime),
              notes: appointment.note ?? undefined,
            })
            await linkAppointmentToSchedule(
              createdSchedule.data.consultantScheduleID,
              appointment.appointmentID
            )

            await loadData()
          } else {
            notification.showError("Error", "Appointment not found!")
          }
        } finally {
          Modal.destroyAll()
        }
      },
    })
  }

  // Cập nhật lịch cá nhân
  const handleEditSchedule = async (values: any) => {
    if (!editingSchedule) return
    setLoading(true)
    try {
      await updateConsultantSchedule(editingSchedule.consultantScheduleID, {
        consultantId: consultantId,
        dayOfWeek: editingSchedule.dayOfWeek,
        date: `${values.date}T00:00:00`,
        startTime: `${values.startTime}:00`,
        endTime: `${values.endTime}:00`,
        notes: values.notes || "",
      })
      notification.showSuccess("Success", "Updated schedule successfully!")
      setShowScheduleModal(false)
      setEditingSchedule(null)
      loadData()
    } catch (e) {
      notification.showError("Update failed", "Failed to update schedule!")
    } finally {
      setLoading(false)
    }
  }

  // Xóa lịch cá nhân
  const handleDeleteSchedule = async (scheduleId: string) => {
    setLoading(true)
    try {
      await deleteConsultantSchedule(scheduleId)
      notification.showSuccess("Success", "Deleted schedule successfully!")
      loadData()
    } catch (e) {
      notification.showError("Delete failed", "Failed to delete schedule!")
    } finally {
      setLoading(false)
    }
  }

  // Custom event style getter
  const eventStyleGetter = (event: CalendarEvent) => {
    let backgroundColor = "#3174ad"

    // Nếu là personal schedule
    if (!event.resource || event.resource.scheduleType === "personal") {
      backgroundColor = "#87d068" // Xanh lá cho personal schedule
    }
    // Nếu là approved appointment schedule
    else if (event.resource.scheduleType === "appointment") {
      backgroundColor = "#1890ff" // Xanh dương cho appointment schedule
    }
    // Nếu là appointment chưa được approve
    else if (typeof event.resource.status === "number") {
      switch (event.resource.status) {
        case AppointmentResponseEnum.ACCEPTED:
          backgroundColor = "#52c41a"
          break
        case AppointmentResponseEnum.REJECTED:
          backgroundColor = "#ff4d4f"
          break
        case AppointmentResponseEnum.NORESPONDED:
        default:
          backgroundColor = "#faad14"
          break
      }
    }

    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        opacity: 0.8,
        color: "white",
        border: "0px",
        display: "block",
      },
    }
  }

  // Appointments table columns
  const appointmentColumns = [
    {
      title: "Member",
      dataIndex: "memberID",
      key: "memberID",
      render: (memberID: string) => usernames[memberID] || memberID,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Time",
      key: "time",
      render: (record: Appointments) =>
        `${getHourMinuteFromISO(record.startTime)} - ${getHourMinuteFromISO(
          record.endTime
        )}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: AppointmentResponseEnum) => {
        let color = "default"
        let text = ""
        switch (status) {
          case AppointmentResponseEnum.ACCEPTED:
            color = "green"
            text = "Approved"
            break
          case AppointmentResponseEnum.REJECTED:
            color = "red"
            text = "Rejected"
            break
          case AppointmentResponseEnum.NORESPONDED:
          default:
            color = "orange"
            text = "Pending"
            break
        }
        return <Tag color={color}>{text}</Tag>
      },
    },
    {
      title: "Note",
      dataIndex: "note",
      key: "note",
      render: (note: string | null) => note || "-",
    },
    {
      title: "Action",
      key: "action",
      render: (record: Appointments) => {
        if (record.status === AppointmentResponseEnum.NORESPONDED) {
          return (
            <Space>
              <Tooltip title="Approve appointment">
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckOutlined />}
                  onClick={() =>
                    showConfirm(
                      record.appointmentID,
                      AppointmentResponseEnum.ACCEPTED,
                      usernames[record.memberID] || record.memberID
                    )
                  }
                >
                  Approve
                </Button>
              </Tooltip>
              <Tooltip title="Reject appointment">
                <Button
                  type="primary"
                  danger
                  size="small"
                  icon={<CloseOutlined />}
                  onClick={() =>
                    showConfirm(
                      record.appointmentID,
                      AppointmentResponseEnum.REJECTED,
                      usernames[record.memberID] || record.memberID
                    )
                  }
                >
                  Reject
                </Button>
              </Tooltip>
            </Space>
          )
        }
        return <span>-</span>
      },
    },
  ]

  return (
    <div className="schedule-container">
      <div className="schedule-header">
        <h2 className="schedule-title">
          <CalendarOutlined style={{ marginRight: "8px" }} />
          Schedule Management
        </h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setShowAddModal(true)}
          className="schedule-add-button"
          disabled={!consultantId}
        >
          Add Personal Schedule
        </Button>
      </div>

      {/* Big Calendar */}
      <Card title="Work Schedule" className="calendar-card" loading={loading}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 900 }}
          eventPropGetter={eventStyleGetter}
          views={["month", "week", "day"]}
          step={60}
          showMultiDayTimes
          defaultView="week"
          messages={{
            next: "Next",
            previous: "Previous",
            today: "Today",
            month: "Month",
            week: "Week",
            day: "Day",
            agenda: "Agenda",
            date: "Date",
            time: "Time",
            event: "Event",
            noEventsInRange: "No events in this time range",
            showMore: (total) => `+ ${total} more events`,
          }}
          formats={{
            dayFormat: (date, culture, localizer) =>
              localizer?.format(date, "dddd DD/MM", culture) || "",
            dayRangeHeaderFormat: ({ start, end }, culture, localizer) =>
              `${localizer?.format(
                start,
                "DD/MM/YYYY",
                culture
              )} - ${localizer?.format(end, "DD/MM/YYYY", culture)}`,
            monthHeaderFormat: (date, culture, localizer) =>
              localizer?.format(date, "MMMM YYYY", culture) || "",
          }}
          onSelectEvent={(event) => {
            // Nếu là schedule event (personal hoặc appointment)
            if (event.id) {
              const scheduleId = String(event.id).replace("schedule-", "")
              const schedule = personalSchedules.find(
                (s) => s.consultantScheduleID === scheduleId
              )
              if (schedule) {
                // Nếu là appointment schedule thì mở appointment modal
                if (
                  event.resource?.scheduleType === "appointment" &&
                  event.resource?.appointmentId
                ) {
                  const appointment = appointments.find(
                    (a) => a.appointmentID === event.resource?.appointmentId
                  )
                  if (appointment) {
                    openAppointmentModal(appointment)
                  }
                } else {
                  // Nếu là personal schedule thì mở personal modal
                  openEditModal(schedule)
                }
              }
            }
          }}
        />
      </Card>

      {/* Appointments Table */}
      <Card title="Appointment List" style={{ marginTop: "24px" }}>
        <Table
          columns={appointmentColumns}
          dataSource={appointments}
          rowKey="appointmentID"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} appointments`,
          }}
        />
      </Card>
      {/* Edit Schedule Modal */}
      <Modal
        title="Edit Personal Schedule"
        open={showScheduleModal}
        onOk={handleEditModalOk}
        onCancel={handleEditModalCancel}
        okText="Save"
        cancelText="Cancel"
        destroyOnClose
        footer={[
          <Button
            key="delete"
            danger
            onClick={() => {
              if (editingSchedule)
                handleDeleteSchedule(editingSchedule.consultantScheduleID)
              setShowScheduleModal(false)
              setEditingSchedule(null)
              editForm.resetFields()
            }}
          >
            Delete
          </Button>,
          <Button key="cancel" onClick={handleEditModalCancel}>
            Cancel
          </Button>,
          <Button key="save" type="primary" onClick={handleEditModalOk}>
            Save
          </Button>,
        ]}
      >
        <Form form={editForm} layout="vertical">
          <Form.Item
            label="Date"
            name="date"
            rules={[{ required: true, message: "Please select date" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="Start Time"
            name="startTime"
            rules={[{ required: true, message: "Please select start time" }]}
          >
            <TimePicker format="HH:mm" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="End Time"
            name="endTime"
            rules={[{ required: true, message: "Please select end time" }]}
          >
            <TimePicker format="HH:mm" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Notes" name="notes">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Appointment Schedule Modal */}
      <Modal
        title="Edit Appointment Schedule"
        open={showAppointmentModal}
        onOk={handleAppointmentModalOk}
        onCancel={handleAppointmentModalCancel}
        okText="Save"
        cancelText="Cancel"
        destroyOnClose
        footer={[
          <Button key="cancel" onClick={handleAppointmentModalCancel}>
            Cancel
          </Button>,
          <Button key="save" type="primary" onClick={handleAppointmentModalOk}>
            Save
          </Button>,
        ]}
      >
        <Form form={appointmentForm} layout="vertical">
          <Form.Item label="Member" name="memberName">
            <Input disabled />
          </Form.Item>
          <Form.Item
            label="Date"
            name="date"
            rules={[{ required: true, message: "Please select date" }]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="Start Time"
            name="startTime"
            rules={[{ required: true, message: "Please select start time" }]}
          >
            <TimePicker format="HH:mm" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item
            label="End Time"
            name="endTime"
            rules={[{ required: true, message: "Please select end time" }]}
          >
            <TimePicker format="HH:mm" style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Notes" name="notes">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Schedule Modal */}
      <AddScheduleModal
        visible={showAddModal}
        onCancel={() => setShowAddModal(false)}
        onSuccess={loadData}
        consultantId={consultantId}
      />
    </div>
  )
}

export default ScheduleManagement
