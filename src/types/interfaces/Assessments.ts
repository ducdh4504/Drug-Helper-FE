import type { ActivityStatus } from "../enums/ActitvityStatusEnum";

export interface Assessments {
  assessmentId: string;
  assessmentName: string | null;
  status: ActivityStatus
}

export interface Questions {
  questionID: string;
  content: string;
  maxScore: number;
}

export interface Answers {
  answerID: string;
  questionId: string;
  content: string;
  score: number;
}

export interface AssessmentResults {
  resultId: string;
  assessmentId: string;
  userId: string;
  resultLevel: string;
  score: number;
  takeTime: string | null;
}

export interface AssessmentQuestionLink {
  assessmentId: string;
  questionId: string;
}