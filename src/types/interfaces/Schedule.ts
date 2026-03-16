import type { AppointmentResponseEnum } from '../enums/AppointmentResponseEnum';
import type { Appointments } from './Appointments';
import type { ConsultantSchedules } from './ConsultantSchedules';

// Interface cho events trong calendar
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: {
    status?: AppointmentResponseEnum;
    appointmentId?: string;
    userId?: string;
    userFullName?: string;
    notes?: string;
    isFromAppointment?: boolean;
    scheduleType?: 'personal' | 'appointment';
  };
}

// Re-export các interface có sẵn để dễ import
export type { ConsultantSchedules };
export type { Appointments };
