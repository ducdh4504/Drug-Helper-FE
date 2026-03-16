import React, { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import type { AppDispatch, RootState } from "../../redux/store"
import type { Certificates } from "../../types/interfaces/Certificates"
import {
  fetchConsultantCertificates,
  selectConsultantCertificates,
  selectConsultantsLoading,
  selectConsultants,
  selectConsultantsError,
  fetchConsultants,
  fetchConsultantSchedules,
  selectConsultantSchedules,
} from "../../redux/slices/consultantSlice"
import { useNotification } from "../../hooks/useNotification"
import BackLink from "../../components/BackLink/BackLink"
import BookingModal from "../../components/BookingModal/MainBookingModal/BookingModal"
import "./ConsultantDetailPage.scss"
import { AiOutlineMail } from "react-icons/ai"
import Image from "antd/es/image"

const ConsultantDetailPage: React.FC = () => {
  const { id } = useParams()
  const [showBookingModal, setShowBookingModal] = useState(false)

  const dispatch = useDispatch<AppDispatch>()
  const { showError } = useNotification()

  const consultants = useSelector(selectConsultants) // Lấy danh sách consultants
  const certificates = useSelector(selectConsultantCertificates(id || ""))
  const loading = useSelector(selectConsultantsLoading)
  const error = useSelector(selectConsultantsError)
  const currentUserId = useSelector((state: RootState) => state.auth.userId)

  // Tìm consultant theo userID trong mảng consultants
  const displayConsultant = Array.isArray(consultants)
    ? consultants.find((c: any) => c.userID === id)
    : undefined

  useEffect(() => {
    if (!consultants || consultants.length === 0) {
      dispatch(fetchConsultants())
    }
  }, [consultants, dispatch])

  useEffect(() => {
    if (id) {
      if (!certificates || certificates.length === 0) {
        dispatch(fetchConsultantCertificates(id))
      }
    }
  }, [id, certificates, dispatch])

  // Hiển thị thông báo lỗi
  useEffect(() => {
    if (error) {
      showError("Lỗi tải dữ liệu", error)
    }
  }, [error, showError])

  if (loading || !consultants || consultants.length === 0) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading consultant details...</p>
      </div>
    )
  }

  if (
    !displayConsultant ||
    typeof displayConsultant !== "object" ||
    !displayConsultant.userID
  ) {
    return (
      <div className="error">
        <h2>Consultant Not Found</h2>
        <p>
          The consultant you're looking for doesn't exist or has been removed.
        </p>
        <BackLink />
      </div>
    )
  }

  return (
    <div className="consultant-detail-page">
      <BackLink />
      <div className="consultant-detail-main">
        <div
          className="consultant-detail-avatar"
          style={{ backgroundImage: `url(${displayConsultant.imgUrl})` }}
        />
        <div className="consultant-detail-info">
          <h1 className="consultant-detail-name">
            {displayConsultant.fullName || displayConsultant.userName}
          </h1>

          <div className="consultant-info-section">
            <div className="consultant-detail-email-row">
              <AiOutlineMail
                size={22}
                style={{ marginRight: 8, verticalAlign: "middle" }}
              />
              <span>{displayConsultant.email}</span>
            </div>
            {displayConsultant.phone && (
              <div className="consultant-detail-phone-row">
                <span>📞</span>
                <span>{displayConsultant.phone}</span>
              </div>
            )}
            {displayConsultant.dateOfBirth && (
              <div className="consultant-detail-dob-row">
                <span>🎂</span>
                <span>
                  Born:{" "}
                  {new Date(displayConsultant.dateOfBirth).toLocaleDateString(
                    "en-GB"
                  )}
                </span>
              </div>
            )}
          </div>

          <button
            className="booking-now-btn"
            onClick={() => {
              // Fetch consultant schedules before opening booking modal
              dispatch(fetchConsultantSchedules(displayConsultant.userID))
              setShowBookingModal(true)
            }}
          >
            Book Consultation
          </button>
        </div>
      </div>
      <div className="consultant-certificates">
        <h3>Professional Certificates</h3>
        {certificates && certificates.length > 0 ? (
          <ul className="consultant-certificates-list">
            {certificates.map((cert: Certificates) => (
              <li
                key={cert.certificateID}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 16,
                  marginBottom: 16,
                }}
              >
                <Image
                  src={cert.imgUrl}
                  width={64}
                  height={48}
                  style={{
                    objectFit: "cover",
                    borderRadius: 4,
                    cursor: "pointer",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                  }}
                  alt={cert.certificateName || "Certificate"}
                  preview={{ mask: <span>Click to preview</span> }}
                />
                <div>
                  <div style={{ fontWeight: 500 }}>{cert.certificateName}</div>
                  <div style={{ color: "#888", fontSize: 13 }}>
                    {cert.dateAcquired
                      ? new Date(cert.dateAcquired).toLocaleDateString("en-GB")
                      : ""}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: "#6c757d", fontStyle: "italic" }}>
            No certificates available
          </p>
        )}
      </div>

      <BookingModal
        open={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        memberId={currentUserId}
        consultant={displayConsultant}
      />
    </div>
  )
}

export default ConsultantDetailPage
