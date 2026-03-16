import React, { useState, useEffect, useMemo } from "react"
import "./BookingModal.scss"
import type { Users } from "../../../types/interfaces/User"
import ConfirmBookingModal from "../ConfirmBooking/ConfirmBookingModal"
import SuccessBookingModal from "../SuccessBooking/SuccessBookingModal"
import { createAppointment } from "../../../services/appointmentAPI"
import { useNavigate } from "react-router-dom"
import { useNotification } from "../../../hooks/useNotification"
import { useSelector } from "react-redux"
import { selectConsultantSchedules } from "../../../redux/slices/consultantSlice"
import "@mobiscroll/react/dist/css/mobiscroll.min.css"
import { Datepicker, setOptions } from "@mobiscroll/react"
import dayjs from "dayjs"
import {
  getHourMinuteFromISO,
  getEndTimeFromSlot,
  getTimeSpan,
} from "../../../utils/helpers/timeUtils"
import { formatDate } from "../../../utils/helpers/dateUtils"

setOptions({
  theme: "ios",
  themeVariant: "light",
})

interface BookingModalProps {
  open: boolean
  onClose: () => void
  memberId: string | null | undefined
  consultant: Users | null
}

const BookingModal: React.FC<BookingModalProps> = ({
  open,
  onClose,
  memberId,
  consultant,
}) => {
  const navigate = useNavigate()
  const { showSuccess, showError } = useNotification()
  const [selectedDateTime, setSelectedDateTime] = useState("")
  const [description, setDescription] = useState("")
  const [showConfirm, setShowConfirm] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  const schedules = useSelector(
    consultant ? selectConsultantSchedules(consultant.userID) : () => []
  )

  // Generate labels showing available slots
  const myLabels = useMemo(() => {
    if (!schedules || schedules.length === 0) return []

    const availableSlots = schedules.filter(
      (schedule: any) =>
        schedule.isAvailable === (true || 1) && !schedule.appointmentID
    )

    const slotsByDate = availableSlots.reduce((acc: any, schedule: any) => {
      const date = schedule.date ? schedule.date.slice(0, 10) : ""
      if (!acc[date]) acc[date] = 0
      acc[date]++
      return acc
    }, {})

    return Object.entries(slotsByDate).map(([date, count]) => ({
      start: date,
      textColor: "#e1528f",
      title: `${count} SPOTS`,
    }))
  }, [schedules])

  // Generate invalid time slots based on consultant schedules
  const myInvalid = useMemo(() => {
    if (!schedules || schedules.length === 0) return []

    const invalidSlots = schedules
      .filter(
        (schedule: any) =>
          schedule.isAvailable === false || schedule.appointmentID
      )
      .map((schedule: any) => {
        const date = schedule.date ? schedule.date.slice(0, 10) : ""
        const start = schedule.startTime
          ? `${date}T${schedule.startTime.slice(0, 5)}`
          : ""
        const end = `${date}T${schedule.startTime.slice(0, 2)}:59`
        return {
          start,
          end,
        }
      })

    const today = dayjs()
    const maxDate = today.add(6, "months")
    const sundays: { start: string }[] = []
    let d = today.startOf("day")
    while (d.isBefore(maxDate)) {
      if (d.day() === 0) {
        const dateStr = d.format("YYYY-MM-DD")
        sundays.push({
          start: dateStr,
        })
      }
      d = d.add(1, "day")
    }
    console.log(sundays)

    const lunchTimes: { start: string; end: string }[] = []
    d = today.startOf("day")
    while (d.isBefore(maxDate)) {
      const dateStr = d.format("YYYY-MM-DD")
      lunchTimes.push({
        start: `${dateStr}T12:00`,
        end: `${dateStr}T13:59`,
      })
      d = d.add(1, "day")
    }

    return [...invalidSlots, ...sundays, ...lunchTimes]
  }, [schedules])

  // Reset states when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedDateTime("")
      setDescription("")
      setShowConfirm(false)
      setShowSuccessModal(false)
    }
  }, [open])

  const handleDateTimeChange = (event: any) => {
    setSelectedDateTime(event.value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedDateTime) {
      showError(
        "Please select a date and time",
        "You must select a date and time to book an appointment."
      )
      return
    }
    setShowConfirm(true)
  }

  const handleConfirm = async () => {
    if (!memberId) {
      showError("Not logged in", "You must log in to book an appointment.")
      navigate("/login")
      return
    }
    if (!consultant || !selectedDateTime) return

    try {
      const dateTime = dayjs(selectedDateTime)
      const dateStr = dateTime.format("YYYY-MM-DD")
      const startTime = getTimeSpan(dateTime.hour(), dateTime.minute())
      const endTime = getTimeSpan(dateTime.hour() + 1, dateTime.minute())
      const isoDate = `${dateStr}T00:00:00`

      await createAppointment({
        userId: memberId,
        consultantId: consultant.userID,
        note: description,
        date: isoDate,
        startTime: `${dateStr}T${startTime}`,
        endTime: `${dateStr}T${endTime}`,
      })
      setShowConfirm(false)
      setShowSuccessModal(true)
      showSuccess("Booking successful", "Your appointment has been booked.")
    } catch (error) {
      showError(
        "Booking failed",
        "Could not book the appointment. Please try again."
      )
      setShowConfirm(false)
    }
  }

  const handleCancel = () => {
    setShowConfirm(false)
  }

  const handleCloseSuccess = () => {
    setShowSuccessModal(false)
    onClose()
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!open || !consultant) return null

  return (
    <>
      <div className="booking-modal-overlay" onClick={handleOverlayClick}>
        <div className="booking-modal-box">
          <button className="booking-modal-close" onClick={onClose}>
            ×
          </button>
          <h2>Booking with {consultant.fullName || consultant.userName}</h2>
          <p>Email: {consultant.email}</p>
          <form className="booking-form" onSubmit={handleSubmit}>
            <div className="calendar-section">
              <label>
                Select date and time:
                <Datepicker
                  controls={["calendar", "timegrid"]}
                  min={dayjs().format("YYYY-MM-DDTHH:mm")}
                  max={dayjs().add(6, "months").format("YYYY-MM-DDTHH:mm")}
                  minTime="07:00"
                  maxTime="17:59"
                  stepMinute={60}
                  labels={myLabels}
                  invalid={myInvalid}
                  value={selectedDateTime}
                  onChange={handleDateTimeChange}
                />
              </label>
              {selectedDateTime && (
                <div className="selected-slot-info">
                  <strong>Selected:</strong> {formatDate(selectedDateTime)} at{" "}
                  {getHourMinuteFromISO(selectedDateTime)}
                </div>
              )}
            </div>
            <div className="description-group">
              <label>
                Description:
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What do you need consultation for?"
                  rows={3}
                  required
                />
              </label>
              <button type="submit" className="confirm-btn">
                Book Now
              </button>
            </div>
          </form>
        </div>
      </div>

      {showConfirm && (
        <ConfirmBookingModal
          user={consultant}
          selectedDate={
            selectedDateTime ? dayjs(selectedDateTime).format("YYYY-MM-DD") : ""
          }
          startTime={
            selectedDateTime ? getHourMinuteFromISO(selectedDateTime) : ""
          }
          endTime={
            selectedDateTime
              ? getEndTimeFromSlot(getHourMinuteFromISO(selectedDateTime))
              : ""
          }
          description={description}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
        />
      )}

      {showSuccessModal && (
        <SuccessBookingModal
          user={consultant}
          selectedDate={
            selectedDateTime ? dayjs(selectedDateTime).format("YYYY-MM-DD") : ""
          }
          startTime={
            selectedDateTime ? getHourMinuteFromISO(selectedDateTime) : ""
          }
          endTime={
            selectedDateTime
              ? getEndTimeFromSlot(getHourMinuteFromISO(selectedDateTime))
              : ""
          }
          onClose={handleCloseSuccess}
        />
      )}
    </>
  )
}

export default BookingModal
