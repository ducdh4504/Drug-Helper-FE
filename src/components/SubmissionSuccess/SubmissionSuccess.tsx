import React, { forwardRef } from "react"
import "./SubmissionSuccess.scss"

interface SubmissionSuccessProps {
  onViewResult: () => void
}

const SubmissionSuccess = forwardRef<HTMLDivElement, SubmissionSuccessProps>(({ onViewResult }, ref) => {
  return (
    <div className="submission-success" ref={ref}>
      <div className="success-icon">✓</div>
      <h2>Submission Successful!</h2>
      <p>Thank you for completing the assessment.</p>
      <button
        className="view-result-button"
        onClick={() => {
          console.log("View Results button clicked")
          onViewResult()
        }}
      >
        View Results
      </button>
    </div>
  )
})

export default SubmissionSuccess
