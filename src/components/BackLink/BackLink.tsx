import React from "react"
import { useNavigate } from "react-router-dom"
import "./BackLink.scss"

interface BackLinkProps {
  to?: string
}

const BackLink: React.FC<BackLinkProps> = ({ to }) => {
  const navigate = useNavigate()

  const handleGoBack = () => {
    if (to) {
      navigate(to)
    } else {
      navigate(-1)
    }
  }

  return (
    <button className="back-link" onClick={handleGoBack}>
      <span className="back-icon">←</span>
      <span className="back-text">Back</span>
    </button>
  )
}

export default BackLink
