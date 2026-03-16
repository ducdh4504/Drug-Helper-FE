import type { ActivityStatus } from "../enums/ActitvityStatusEnum";
import type { LearningStatus } from "../enums/LearningStatusEnum";
import type { LevelTarget } from "../enums/LevelTargetEnum";

export interface Courses {
  courseId: string;
  imgUrl: string | null;
  title: string;
  contentSummary: string;
  content: CourseContent[];
  description: string | null;
  startDate: string;
  endDate: string;
  status: ActivityStatus;
  levelTarget?: LevelTarget;
  ageMin: number | null;
  capacity: number | null;
}

export interface CourseRegistrations {
  userID: string;
  courseId: string;
  registerTime: string;
  learningStatus: LearningStatus;
}

export interface CourseContent {
  courseContentID: string;
  title: string;
  content: string;
}
