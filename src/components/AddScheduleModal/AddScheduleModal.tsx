import React from "react"
import { Modal, Form, DatePicker, Input, Button, message, Select } from "antd"
import { PlusOutlined } from "@ant-design/icons"
import dayjs, { Dayjs } from "dayjs"
import { createConsultantSchedule } from "../../services/consultantAPI"
import { DayOfWeek } from "../../types/enums/DayOfWeekEnum"
import "./AddScheduleModal.scss"

interface AddScheduleModalProps {
  visible: boolean
  onCancel: () => void
  onSuccess: () => void
  consultantId: string
}

const timeSlots = [
  { label: "6:00-7:00", value: { start: "06:00", end: "07:00" } },
  { label: "7:00-8:00", value: { start: "07:00", end: "08:00" } },
  { label: "8:00-9:00", value: { start: "08:00", end: "09:00" } },
  { label: "9:00-10:00", value: { start: "09:00", end: "10:00" } },
  { label: "10:00-11:00", value: { start: "10:00", end: "11:00" } },
  { label: "11:00-12:00", value: { start: "11:00", end: "12:00" } },
  { label: "14:00-15:00", value: { start: "14:00", end: "15:00" } },
  { label: "15:00-16:00", value: { start: "15:00", end: "16:00" } },
  { label: "16:00-17:00", value: { start: "16:00", end: "17:00" } },
  { label: "17:00-18:00", value: { start: "17:00", end: "18:00" } },
]

const AddScheduleModal: React.FC<AddScheduleModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  consultantId,
}) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = React.useState(false)

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true)
      const { date, timeSlot, notes } = values
      const { start, end } =
        timeSlots.find((slot) => slot.label === timeSlot)?.value || {}
      if (!start || !end) throw new Error("Invalid time slot")
      // Map dayjs().day() (0=Sunday) to enum (0=MONDAY, 6=SUNDAY)
      const dayjsDay = date.day() // 0 (Sunday) - 6 (Saturday)
      // Map dayjsDay to enum: dayjsDay 0=Sunday -> 6, 1=Monday -> 0, ..., 6=Saturday -> 5
      const dayOfWeekEnum = dayjsDay === 0 ? 6 : dayjsDay - 1
      const scheduleData = {
        consultantId: consultantId,
        dayOfWeek: dayOfWeekEnum,
        date: date.format("YYYY-MM-DD"),
        startTime: start + ":00",
        endTime: end + ":00",
        notes: notes || undefined,
      }
      await createConsultantSchedule(scheduleData)
      message.success("Personal schedule added successfully!")
      form.resetFields()
      onSuccess()
      onCancel()
    } catch (error) {
      console.error("Error creating schedule:", error)
      message.error("Failed to add personal schedule!")
    } finally {
      setLoading(false)
    }
  }

  const disabledDate = (current: Dayjs) => {
    return current && current < dayjs().startOf("day")
  }

  return (
    <Modal
      title={
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <PlusOutlined />
          Add Personal Schedule
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={500}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        style={{ marginTop: "20px" }}
      >
        <Form.Item
          name="date"
          label="Date"
          rules={[{ required: true, message: "Please select a date!" }]}
        >
          <DatePicker
            style={{ width: "100%" }}
            format="DD/MM/YYYY"
            disabledDate={disabledDate}
            placeholder="Select date"
          />
        </Form.Item>
        <Form.Item
          name="timeSlot"
          label="Time Slot"
          rules={[{ required: true, message: "Please select a time slot!" }]}
        >
          <Select placeholder="Select time slot">
            {timeSlots.map((slot) => (
              <Select.Option key={slot.label} value={slot.label}>
                {slot.label}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item name="notes" label="Note">
          <Input.TextArea
            rows={3}
            placeholder="Enter note (optional)"
            maxLength={500}
          />
        </Form.Item>
        <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
          <Button onClick={onCancel} style={{ marginRight: "8px" }}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Add Schedule
          </Button>
        </Form.Item>
      </Form>
    </Modal>
  )
}

export default AddScheduleModal
