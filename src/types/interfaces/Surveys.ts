import type { SurveyTypeEnum } from "../enums/SurveyTypeEnum";

export interface Surveys {
  surveyID: string;
  userID: string | null;
  title: string;
  type: SurveyTypeEnum;
  description: string | null;
}

export interface SurveyResults {
  surveyID: string;
  programID: string;
  response_data: string | null;
  submitTime: string | null;
}

export interface SurveyResultCount {
  count: number;
}
