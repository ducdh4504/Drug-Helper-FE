import React, { useState, useEffect } from "react"
import { useSelector, useDispatch } from "react-redux"
import SearchBar from "../../components/Search/SearchBar"
import ConsultantBox from "../../components/ConsultantBox/ConsultantBox"
import type { Users } from "../../types/interfaces/User"
import "./ConsultantPage.scss"
import type { AppDispatch, RootState } from "../../redux/store"
import {
  fetchConsultants,
  selectConsultants,
  selectConsultantsLoading,
  fetchConsultantSchedules,
} from "../../redux/slices/consultantSlice"
import BookingModal from "../../components/BookingModal/MainBookingModal/BookingModal"
import "antd/dist/reset.css"
import { useNavigate } from "react-router-dom"

const ConsultantPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("")
  const [bookingOpen, setBookingOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Users | null>(null)
  const navigate = useNavigate()

  const dispatch = useDispatch<AppDispatch>()
  const consultants = useSelector(selectConsultants)
  const loading = useSelector(selectConsultantsLoading)
  const currentUserId = useSelector((state: RootState) => state.auth.userId)

  useEffect(() => {
    dispatch(fetchConsultants())
  }, [dispatch])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  const handleBooking = (user: Users) => {
    // Fetch consultant schedules before opening booking modal
    dispatch(fetchConsultantSchedules(user.userID))
    setSelectedUser(user)
    setBookingOpen(true)
  }

  const handleCloseBooking = () => {
    setBookingOpen(false)
    setSelectedUser(null)
  }

  const filteredUsers = consultants.filter(
    (user: Users) =>
      (user.fullName || user.userName)
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="consultant-page">
      <SearchBar onSearch={handleSearch} initialValue={searchTerm} />

      <main className="consultant-main">
        <div className="consultant-container">
          <h2
            className="section-title clickable"
            onClick={() => setSearchTerm("")}
            style={{ cursor: "pointer" }}
            title="Xem tất cả consultant"
          >
            Our Consultants
          </h2>

          {loading ? (
            <div className="loading-container">
              <div className="loading-grid">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="consultant-skeleton">
                    <div className="skeleton-image"></div>
                    <div className="skeleton-content">
                      <div className="skeleton-title"></div>
                      <div className="skeleton-description"></div>
                      <div className="skeleton-description"></div>
                      <div className="skeleton-button"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="consultants-grid">
              {filteredUsers.map((user: Users, index: number) => (
                <div
                  key={user.userID}
                  className="consultant-item"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <ConsultantBox
                    user={user}
                    onBooking={() => handleBooking(user)}
                    onMore={() => navigate(`/consultant/${user.userID}`)}
                  />
                </div>
              ))}
            </div>
          )}

          {!loading && filteredUsers.length === 0 && (
            <div className="no-results">
              <div className="no-results-content">
                <h3>No consultants found</h3>
                <p>
                  Try adjusting your search terms or browse all available
                  consultants.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>

      <BookingModal
        open={bookingOpen}
        onClose={handleCloseBooking}
        memberId={currentUserId}
        consultant={selectedUser}
      />
    </div>
  )
}

export default ConsultantPage
