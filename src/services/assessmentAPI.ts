import axiosClient from "./axiosClient";

export const getAssessmentsList = () => {
  return axiosClient.get('/Assessments');
}

export const getAssessmentById = (assessmentId: string) => {
  return axiosClient.get(`/Assessments/${assessmentId}`);
};

export const submitAssessment = (data: {
  userId: string;
  assessmentId: string;
  answers: { questionId: string; answerId: string }[];
}) => {
  console.log("submitAssessment", data)
  return axiosClient.post('/Assessments/submit', data);
};

export const getAssessmentResult = (resultId: string) => {
  console.log("getAssessmentResult", resultId)
  return axiosClient.get('/Assessments/result', {
    params: {
      resultId,
    },
  });
};

export const getRecommandations = (resultId: string) => {
  return axiosClient.get('/Assessments/recommend', {
    params: {
      resultId,
    },
  });
};

export const createAssessment = (data: {
  assessmentName: string
}) => {
  return axiosClient.post("/Assessments/create", data)
}

export const updateAssessment = (
  id: string,
  data: {
    assessmentName: string
    status: number
  }
) => {
  return axiosClient.put(`/Assessments/${id}`, data)
}

export const linkRandomQuestions = (
  assessmentId: string,
  questionCount: number = 1
) => {
  return axiosClient.post(
    `/Assessments/${assessmentId}/link-random-questions?questionCount=${questionCount}`
  )
}

export const linkQuestion = (data: {
  assessmentId: string
  questionId: string
  randomQuestionCount: number
}) => {
  return axiosClient.post("/Assessments/link-question", data)
}

export const unlinkQuestion = (assessmentId: string, questionId: string) => {
  return axiosClient.delete(`/Assessments/${assessmentId}/question/${questionId}`)
}