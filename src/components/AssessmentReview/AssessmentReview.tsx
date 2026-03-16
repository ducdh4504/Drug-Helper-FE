import React from 'react';
import './AssessmentReview.scss';

interface AssessmentReviewProps {
  onStartTest: () => void;
}

const AssessmentReview: React.FC<AssessmentReviewProps> = ({ onStartTest }) => {
  return (
    <div className="assessment-container">
      <div className="assessment-header">
        <div className="assessment-logo" aria-hidden="true" />
      </div>
      <div className="assessment-content">
        <h2 className="assessment-title">Drug Self-Assessment</h2>
        <p className="assessment-description">
          This test is designed to assess the level of dependence or risk of addiction to addictive substances in daily life.
        </p>
        <div className="assessment-info">
          <p>The test consists of 10 multiple-choice questions, focusing on:</p>
          <ul>
            <li>Frequency of stimulant use</li>
            <li>Feelings of craving or loss of control</li>
            <li>Impact on study, work and relationships</li>
          </ul>
        </div>
        <p className="assessment-advice">Based on the results the system will give you advice</p>
        <p className="assessment-ready">Are you ready?</p>
        <button 
          className="assessment-start-btn"
          aria-label="Start the assessment test"
          onClick={onStartTest}
        >
          Start Test
        </button>
      </div>
    </div>
  );
};

export default AssessmentReview; 