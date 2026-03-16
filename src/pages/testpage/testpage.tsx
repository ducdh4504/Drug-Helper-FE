import React, { useState, useEffect, useRef } from "react"
import "./testpage.scss"
import AssessmentReview from "../../components/AssessmentReview/AssessmentReview"
import Question from "../../components/Question/Question"
import Result from "../../components/Result/Result"
import SubmissionSuccess from "../../components/SubmissionSuccess/SubmissionSuccess"
import type { Questions, Answers } from "../../types/interfaces/Assessments"
import {
  getAssessmentsList,
  getAssessmentById,
  submitAssessment,
  getAssessmentResult,
  getRecommandations,
} from "../../services/assessmentAPI"
import { useSelector } from "react-redux"
import { useNavigate } from "react-router"
import { useNotification } from "../../hooks/useNotification"

const TestPage: React.FC = () => {
  const [testState, setTestState] = useState<
    "intro" | "question" | "submission" | "result"
  >("intro")
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [questions, setQuestions] = useState<
    (Questions & { answers: Answers[] })[]
  >([])
  const [answers, setAnswers] = useState<Answers[]>([])
  const [assessmentId, setAssessmentId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [recommend, setRecommend] = useState<any>(null)
  const [resultId, setResultId] = useState<string | null>(null)

  const submissionRef = useRef<HTMLDivElement>(null)
  const notification = useNotification()
  const navigate = useNavigate()

  // Lấy userId từ redux (nếu có đăng nhập)
  const userId = useSelector((state: any) => state.auth.userId)

  // Lấy danh sách assessment và chọn random 1 cái
  useEffect(() => {
    if (testState === "intro") {
      setLoading(true)
      getAssessmentsList()
        .then((res) => {
          const list = res.data
          if (Array.isArray(list) && list.length > 0) {
            // Lấy random 1 assessment
            const random = list[Math.floor(Math.random() * list.length)]
            // Ưu tiên các trường id phổ biến
            setAssessmentId(
              random.assessmentID || random.id || random.assessmentId
            )
          }
        })
        .finally(() => setLoading(false))
    }
  }, [testState])

  // Lấy câu hỏi/đáp án theo assessmentId
  useEffect(() => {
    if (assessmentId) {
      setLoading(true)
      getAssessmentById(assessmentId)
        .then((res) => {
          setQuestions(res.data.linkedQuestions || [])
        })
        .catch(() => setQuestions([]))
        .finally(() => setLoading(false))
    }
  }, [assessmentId])

  useEffect(() => {
    if (testState === "submission" && submissionRef.current) {
      submissionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      })
    }
  }, [testState])

  const handleStartTest = () => {
    setTestState("question")
    setCurrentQuestion(0)
    setAnswers([])
  }

  const handleAnswer = (answer: Answers) => {
    const newAnswers = [...answers]
    const questionId = questions[currentQuestion]?.questionID
    newAnswers[currentQuestion] = {
      ...answer,
      questionId: questionId,
    }
    setAnswers(newAnswers)
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleNext = () => {
    console.log("Current question:", currentQuestion)
    console.log("Total questions:", questions.length)
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      setTestState("submission")
      console.log(userId, assessmentId)
      if (userId && assessmentId) {
        submitAssessment({
          userId,
          assessmentId,
          answers: answers.map((a) => ({
            questionId: a.questionId,
            answerId: a.answerID,
          })),
        })
          .then((res) => {
            console.log("Assessment submitted successfully:", res)
            if (res.data?.resultId) setResultId(res.data.resultId)
          })
          .catch(() => {})
      }
    }
  }

  const handleViewResult = async () => {
    console.log("userId:", userId)
    if (!userId) {
      notification.showWarning(
        "Not logged in",
        "Please login to view the result!"
      )
      navigate("/login")
      return
    }
    setLoading(true)
    try {
      if (resultId) {
        const res = await getAssessmentResult(resultId)
        setResult(res.data)
        const recRes = await getRecommandations(resultId)
        setRecommend(recRes.data)
      }
    } catch {
      setResult(null)
      setRecommend(null)
    }
    setLoading(false)
    setTestState("result")
  }

  const handleRestart = () => {
    setTestState("intro")
    setCurrentQuestion(0)
    setAnswers([])
    setResult(null)
    setRecommend(null)
    setResultId(null)
    setAssessmentId(null)
  }

  return (
    <div className="testpage-bg-wrapper" role="main">
      {/* Background arcs */}
      <div className="testpage-arc testpage-arc1" aria-hidden="true" />
      <div className="testpage-arc testpage-arc2" aria-hidden="true" />
      <div className="testpage-arc testpage-arc3" aria-hidden="true" />

      {/* Title */}
      <h1 className="testpage-title">Drug Self-Assessment Test</h1>

      {loading && <div>Loading...</div>}

      {testState === "intro" && !loading && (
        <AssessmentReview onStartTest={handleStartTest} />
      )}

      {testState === "question" && questions.length > 0 && (
        <Question
          question={questions[currentQuestion]}
          onAnswer={handleAnswer}
          currentQuestion={currentQuestion}
          totalQuestions={questions.length}
          onPrevious={handlePrevious}
          onNext={handleNext}
          selectedAnswer={answers[currentQuestion]}
        />
      )}

      {testState === "submission" && (
        <SubmissionSuccess
          ref={submissionRef}
          onViewResult={handleViewResult}
        />
      )}

      {testState === "result" && (
        <Result
          answers={answers}
          result={result}
          recommend={recommend}
          onRestart={handleRestart}
        />
      )}
    </div>
  )
}

export default TestPage
