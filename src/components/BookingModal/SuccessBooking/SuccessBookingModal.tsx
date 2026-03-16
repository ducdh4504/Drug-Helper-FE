import React, { useEffect, useState } from "react";
import type { Users } from "../../../types/interfaces/User";
import "./SuccessBookingModal.scss";

interface SuccessBookingModalProps {
  user: Users;
  selectedDate: string;
  startTime: string;
  endTime: string;
  onClose: () => void;
}

const SuccessBookingModal: React.FC<SuccessBookingModalProps> = ({
  user,
  selectedDate,
  startTime,
  endTime,
  onClose,
}) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClose = () => {
    setIsClosing(true);
    onClose();
  };

  return (
    <div className={`success-booking-modal-overlay ${isClosing ? 'closing' : ''}`}>
      <div className={`success-booking-modal-box ${isClosing ? 'closing' : ''}`}>
        <div className="countdown-bar" />
        <div className="success-icon">✓</div>
        <h2>Booking Successful!</h2>
        <p>Your consultation has been scheduled successfully.</p>
        <div className="success-details">
          <p><strong>Consultant:</strong> {user.fullName || user.userName}</p>
          <p><strong>Date:</strong> {selectedDate}</p>
          <p><strong>Time:</strong> {startTime} - {endTime}</p>
        </div>
        <button onClick={handleClose} className="confirm-btn">
          Close
        </button>
      </div>
    </div>
  );
};

export default SuccessBookingModal;