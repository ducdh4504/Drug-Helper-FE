import type { Courses } from "../interfaces/Courses";

export enum LevelTarget {
  LOW = "Low", // =1
  MEDIUM = "Medium", // =2
  HIGH = "High", // =3
}

// Map số từ backend sang enum FE
const reverseLevelTargetMap: Record<number, LevelTarget> = {
  1: LevelTarget.LOW,
  2: LevelTarget.MEDIUM,
  3: LevelTarget.HIGH,
};

// Map enum FE sang số backend
const levelTargetMap: Record<LevelTarget, number> = {
  [LevelTarget.LOW]: 1,
  [LevelTarget.MEDIUM]: 2,
  [LevelTarget.HIGH]: 3,
};

// Chuyển đổi 1 course từ backend sang FE
export function mapCourseFromApi(apiCourse: any): Courses {
  return {
    ...apiCourse,
    levelTarget: reverseLevelTargetMap[apiCourse.resultLevel ?? 1],
  };
}

// Chuyển đổi mảng course từ backend sang FE
export function mapCoursesFromApi(apiCourses: any[]): Courses[] {
  return apiCourses.map(mapCourseFromApi);
}

// Lấy resultLevel từ levelTarget để gửi lên backend
export function getResultLevelFromLevelTarget(levelTarget?: LevelTarget): number | undefined {
  return levelTarget ? levelTargetMap[levelTarget] : undefined;
}
