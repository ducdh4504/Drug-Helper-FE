import React, { useEffect, useState } from "react"
import "./AppointmentProgramHistory.scss"
import type { Appointments } from "../../types/interfaces/Appointments"
import { useSelector } from "react-redux"
import { getAppointmentsByMember } from "../../services/appointmentAPI"
import { getUserById } from "../../services/userAPI"
import { getHourMinuteFromISO } from "../../utils/helpers/timeUtils"

interface AppointmentProgramHistoryProps {
  loading?: boolean
}

const AppointmentProgramHistory: React.FC<AppointmentProgramHistoryProps> = ({
  loading = false,
}) => {
  const userId = useSelector((state: any) => state.auth?.userId || "")
  const [appointments, setAppointments] = useState<Appointments[]>([])
  const [appointmentsLoading, setAppointmentsLoading] = useState(false)
  const [consultantNames, setConsultantNames] = useState<{
    [id: string]: string
  }>({})

  useEffect(() => {
    if (!userId) return
    setAppointmentsLoading(true)
    getAppointmentsByMember(userId)
      .then(async (res) => {
        const data = res.data || []
        setAppointments(data)

        const uniqueConsultantIds = Array.from(
          new Set(data.map((a: any) => a.consultantID))
        )
        const missingIds = uniqueConsultantIds.filter(
          (id) => !consultantNames[id as string]
        )

        if (missingIds.length > 0) {
          const nameMap: { [id: string]: string } = {}
          await Promise.all(
            missingIds.map(async (id) => {
              const idStr = id as string
              try {
                const res = await getUserById(idStr)
                nameMap[idStr] = res.data.fullName || idStr
              } catch {
                nameMap[idStr] = idStr
              }
            })
          )
          setConsultantNames((prev) => ({ ...prev, ...nameMap }))
        }
      })
      .catch(() => setAppointments([]))
      .finally(() => setAppointmentsLoading(false))
  }, [userId])

  const getStatusClass = (status: number) => {
    switch (status) {
      case 1:
        return "approved"
      case 0:
        return "pending"
      case 2:
        return "rejected"
      default:
        return "pending"
    }
  }

  const getStatusText = (status: number) => {
    switch (status) {
      case 1:
        return "Approved"
      case 0:
        return "Pending"
      case 2:
        return "Rejected"
      default:
        return status
    }
  }

  if (loading || appointmentsLoading) {
    return (
      <div className="activity-loading">
        <div className="loading-spinner"></div>
        <p>Loading activity history...</p>
      </div>
    )
  }

  return (
    <div className="activity-history">
      {/* Booking History Section */}
      <div className="activity-section">
        <h3 className="section-title">Booking History</h3>
        <div className="table-container">
          <table className="activity-table">
            <thead>
              <tr>
                <th>Consultant</th>
                <th>Date</th>
                <th>Time</th>
                <th>Notes</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center" }}>
                    No booking history found.
                  </td>
                </tr>
              ) : (
                appointments.map((booking) => (
                  <tr key={booking.appointmentID}>
                    <td className="consultant-name">
                      {consultantNames[booking.consultantID] ||
                        booking.consultantID}
                    </td>
                    <td className="booking-date">
                      {booking.date?.slice(0, 10)}
                    </td>
                    <td className="booking-time">
                      {getHourMinuteFromISO(booking.startTime)} -{" "}
                      {getHourMinuteFromISO(booking.endTime)}
                    </td>
                    <td className="booking-note">
                      {booking.note || "No notes"}
                    </td>
                    <td>
                      <span
                        className={`status-badge ${getStatusClass(
                          booking.status
                        )}`}
                      >
                        {getStatusText(booking.status)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {appointments.length === 0 && (
          <div className="empty-state">
            <p>No booking history found.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AppointmentProgramHistory
