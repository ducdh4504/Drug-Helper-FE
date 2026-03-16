import axiosClient from "./axiosClient";

export const createSurvey = async (data: {
  userID: string;
  title: string;
  description: string;
  publishDate: string;
  type: number;
  status: number;
}) => {
  return axiosClient.post("/Survey/create", data);
};

export const getSurveysList = () => {
  return axiosClient.get("/Survey/list");
};

export const getSurveyById = (surveyId: string) => {
  return axiosClient.get(`/Survey/${surveyId}`);
};

export const updateSurvey = async (data: {
  surveyID: string;
  userID: string;
  title: string;
  description: string;
  publishDate: string;
  type: number;
  status: number;
}) => {
  return axiosClient.put("/Survey", data);
};

export const deleteSurvey = (surveyId: string) => {
  return axiosClient.delete(`/Survey/${surveyId}`);
};


// Survey results
export const getSurveyResult = async (surveyID: string, programID: string) => {
  return axiosClient.get("/SurveyResults", {
    params: {
      surveyid: surveyID,
      programid: programID,
    },
  });
};

export const getSurveyResultsBySurveyId = async (surveyId: string) => {
  return axiosClient.get(`/SurveyResults/by-survey/${surveyId}`);
};

export const getSurveyResultsByProgramId = async (programId: string) => {
  return axiosClient.get(`/SurveyResults/by-program/${programId}`);
};

export const updateSurveyResult = async (data: {
  surveyID: string;
  programID: string;
  responseData: string;
}) => {
  return axiosClient.put("/SurveyResults", data);
};

export const linkSurveyResult = async (data: {
  surveyID: string;
  programID: string;
}) => {
  return axiosClient.post("/SurveyResults/link", data);
};

export const getSurveyResultCountByProgram = async (programId: string) => {
  return axiosClient.get(`/SurveyResults/count-by-program/${programId}`);
};

