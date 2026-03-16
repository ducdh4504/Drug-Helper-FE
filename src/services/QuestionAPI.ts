import axiosClient from "./axiosClient"

export const getQuestionsList = () => {
  return axiosClient.get("/Questions")
}

export const createQuestion = (data: {
  content: string
  maxScore: number
  answers: { content: string; score: number }[]
}) => {
  return axiosClient.post("/Questions/create", data)
}

export const updateQuestion = (
  id: string,
  data: {
    content: string
    maxScore: number
    answers: { content: string; score: number }[]
  }
) => {
  return axiosClient.put(`/Questions/${id}`, data)
}

export const deleteQuestion = (id: string) => {
  return axiosClient.delete(`/Questions/${id}`)
}