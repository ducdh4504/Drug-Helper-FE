import type { AppointmentResponseEnum } from "../enums/AppointmentResponseEnum";

export interface Appointments {
  appointmentID: string;
  memberID: string;
  consultantID: string;
  startTime: string;
  endTime: string;
  date: string;
  status: AppointmentResponseEnum;
  note: string | null;
}
