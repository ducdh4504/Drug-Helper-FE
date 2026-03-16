import React from "react";
import type { Users } from "../../../types/interfaces/User";
import "./ConfirmBookingModal.scss";

interface ConfirmBookingModalProps {
  user: Users;
  selectedDate: string;
  startTime: string;
  endTime: string;
  description: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmBookingModal: React.FC<ConfirmBookingModalProps> = ({
  user,
  selectedDate,
  startTime,
  endTime,
  description,
  onConfirm,
  onCancel,
}) => {
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel()
    }
  }

  return (
    <div className="confirm-booking-modal-overlay" onClick={handleOverlayClick}>
      <div className="confirm-booking-modal-box">
        <h2>Confirm Your Booking</h2>
        <div className="confirmation-details">
          <p><strong>Consultant:</strong> {user.fullName || user.userName}</p>
          <p><strong>Date:</strong> {selectedDate}</p>
          <p><strong>Time:</strong> {startTime} - {endTime}</p>
          <p><strong>Description:</strong> {description}</p>
        </div>
        <div className="confirmation-actions">
          <button onClick={onConfirm} className="confirm2-btn">
            Confirm Booking
          </button>
          <button onClick={onCancel} className="cancel-btn">
            Back to Edit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmBookingModal; 