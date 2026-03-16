import React, { useState, useEffect } from "react"
import "./Question.scss"
import ProgressBar from "../ProgressBar/ProgressBar"
import type { Questions, Answers } from "../../types/interfaces/Assessments"

interface QuestionProps {
  question: Questions & { answers: Answers[] }
  onAnswer: (answer: Answers) => void
  currentQuestion: number
  totalQuestions: number
  onPrevious: () => void
  onNext: () => void
  selectedAnswer?: Answers
}

const Question: React.FC<QuestionProps> = ({
  question,
  onAnswer,
  currentQuestion,
  totalQuestions,
  onPrevious,
  onNext,
  selectedAnswer,
}) => {
  const [animation, setAnimation] = useState<"next" | "prev" | "none">("none")
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<number>>(
    new Set()
  )

  useEffect(() => {
    setAnimation("none")
  }, [currentQuestion])

  // Tự động cuộn lên đầu trang khi chuyển câu hỏi
  useEffect(() => {
    window.scrollTo({ top: 260, behavior: "smooth" })
  }, [currentQuestion])

  useEffect(() => {
    if (selectedAnswer) {
      setAnsweredQuestions((prev) => {
        const newSet = new Set(prev)
        newSet.add(currentQuestion)
        return newSet
      })
    }
  }, [selectedAnswer, currentQuestion])

  const percent = Math.round((answeredQuestions.size / totalQuestions) * 100)

  const handlePrevious = () => {
    setAnimation("prev")
    onPrevious()
  }

  const handleNext = () => {
    setAnimation("next")
    onNext()
  }

  return (
    <div className={`question-container ${animation}`}>
      <ProgressBar percent={percent} />
      <div className="question-progress">
        Question {currentQuestion + 1} of {totalQuestions}
      </div>
      <h2 className="question-title">{question.content}</h2>
      <div className="question-options">
        {question.answers.map((answer) => (
          <button
            key={answer.answerID}
            className={`question-option ${
              selectedAnswer && selectedAnswer.answerID === answer.answerID
                ? "selected"
                : ""
            }`}
            onClick={() => onAnswer(answer)}
          >
            {answer.content}
          </button>
        ))}
      </div>
      <div className="question-navigation">
        <button
          className="nav-button prev-button"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          Previous
        </button>
        <button
          className="nav-button next-button"
          onClick={handleNext}
          disabled={!selectedAnswer}
        >
          {currentQuestion === totalQuestions - 1 ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  )
}

export default Question
