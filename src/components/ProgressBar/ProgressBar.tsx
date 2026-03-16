import React from 'react';
import './ProgressBar.scss';

interface ProgressBarProps {
  percent: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ percent }) => (
  <div className="progress-bar__wrapper">
    <div className="progress-bar__track">
      <div className="progress-bar__fill" style={{ width: `${percent}%` }} />
    </div>
    <span className="progress-bar__label">{percent}%</span>
  </div>
);

export default ProgressBar; 