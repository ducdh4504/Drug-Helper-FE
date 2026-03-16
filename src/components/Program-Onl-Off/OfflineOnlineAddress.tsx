import React from "react"
import "./OfflineOnlineAddress.scss"
import { FaMapMarkerAlt, FaVideo } from "react-icons/fa"
import { LocationType } from "../../types/enums/LocationTypeEnum"
import type { CommunicationPrograms } from "../../types/interfaces/CommunicationPrograms"

const OfflineOnlineAddress: React.FC<{ program: CommunicationPrograms }> = ({
  program,
}) => {
  const isOffline = program.locationType === LocationType.OFFLINE

  if (isOffline) {
    return (
      <div className="address-container offline">
        <div className="address-item">
          <FaMapMarkerAlt className="location-icon" />
          <div className="address-content">
            <span className="address-label">Offline</span>
            <span className="address-text">{program.location}</span>
          </div>
        </div>
      </div>
    )
  } else {
    const meetingLink =
      program.location || `https://googlemeet.com/${program.programID}`

    return (
      <div className="address-container online">
        <div className="address-item">
          <FaVideo className="location-icon" />
          <div className="address-content">
            <span className="address-label">Online</span>
            <a
              href={meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="meeting-link"
            >
              {meetingLink}
            </a>
          </div>
        </div>
      </div>
    )
  }
}

export default OfflineOnlineAddress
