import type { DayOfWeek } from "../enums/DayOfWeekEnum";

export interface ConsultantSchedules {
  consultantScheduleID: string;
  userID: string;
  appointmentID: string;
  dayOfWeek: DayOfWeek;
  date: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  notes: string | null;
}
