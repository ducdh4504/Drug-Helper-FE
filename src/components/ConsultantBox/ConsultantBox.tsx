import React from "react"
import "./ConsultantBox.scss"
import nullAvatar from "../../assets/images/null_avatar.png"
import type { Users } from "../../types/interfaces/User"

type ConsultantBoxProps = {
  user: Users
  onBooking?: () => void
  onMore?: () => void
}

const ConsultantBox: React.FC<ConsultantBoxProps> = ({
  user,
  onBooking,
  onMore,
}) => {
  const displayName = user.fullName || user.userName
  const avatar = user.imgUrl || nullAvatar
  return (
    <div className="container-consultant-box">
      <div
        className="container-consultant-box_image"
        style={{ backgroundImage: `url(${avatar})` }}
        role="img"
        aria-label={displayName}
      />
      <div className="consultant-info">
        <h2 className="consultant-name">{displayName}</h2>
        <p className="consultant-email">{user.email}</p>
        <div className="consultant-actions">
          <a
            className="more-link"
            href="#"
            onClick={(e) => {
              e.preventDefault()
              onMore && onMore()
            }}
          >
            More about {displayName}
          </a>
          <button className="book-button" onClick={onBooking}>
            Booking
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConsultantBox
