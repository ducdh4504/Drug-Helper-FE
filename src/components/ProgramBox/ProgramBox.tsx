import React from "react"
import { useNavigate } from "react-router-dom"
import { Tag } from "antd"
import OfflineOnlineAddress from "../Program-Onl-Off/OfflineOnlineAddress"
import "./ProgramBox.scss"

interface ProgramBoxProps {
  program: {
    programID: string
    name: string
    description: string
    image: string
    imgUrl?: string
    status: number
    date?: string
    startTime?: string
    endTime?: string
    speaker?: string
    speakerImageUrl?: string
    location?: string
    locationType?: string
    meetingLink?: string
  }
  onClick?: (programId: string) => void
}

const ProgramBox: React.FC<ProgramBoxProps> = ({ program, onClick }) => {
  const navigate = useNavigate()

  const renderStatus = (status: number) => {
    switch (status) {
      case 0:
        return (
          <Tag color="success" style={{ fontWeight: 500 }}>
            🟢 Open for registration
          </Tag>
        )
      case 1:
        return (
          <Tag color="error" style={{ fontWeight: 500 }}>
            🔴 Registration closed
          </Tag>
        )
      case 2:
        return (
          <Tag color="processing" style={{ fontWeight: 500 }}>
            🔵 Coming soon
          </Tag>
        )
      case 3:
        return (
          <Tag color="default" style={{ fontWeight: 500 }}>
            ⚪ Finished
          </Tag>
        )
      default:
        return (
          <Tag color="default" style={{ fontWeight: 500 }}>
            ❓ Unknown status
          </Tag>
        )
    }
  }

  const handleClick = () => {
    if (onClick) {
      onClick(program.programID)
    } else {
      navigate(`/program-register/${program.programID}`)
    }
  }

  return (
    <div className="program-box">
      <img
        src={program.image}
        alt={program.name}
        onError={(e) => {
          e.currentTarget.src =
            "https://via.placeholder.com/350x220?text=No+Image&bg=f8f9fa&color=6c757d"
        }}
      />
      <div className="card-content">
        <h3>{program.name}</h3>
        <p>{program.description}</p>
        <OfflineOnlineAddress
          program={{
            programID: program.programID,
            name: program.name,
            description: program.description,
            imgUrl: program.imgUrl || program.image || null,
            speakerImageUrl: program.speakerImageUrl || null,
            date: program.date || "",
            startTime: program.startTime || "",
            endTime: program.endTime || "",
            speaker: program.speaker || "",
            location: program.location || "",
            locationType: (program.locationType as any) || "",
            status: program.status,
          }}
        />
        <div className="status-container">{renderStatus(program.status)}</div>
        <button
          onClick={handleClick}
          disabled={program.status === 2 || program.status === 4}
        >
          {program.status === 2 || program.status === 4
            ? "Registration closed"
            : "Register to join"}
        </button>
      </div>
    </div>
  )
}

export default ProgramBox
