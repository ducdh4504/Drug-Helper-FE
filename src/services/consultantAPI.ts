import type { Users } from '../types/interfaces/User';
import axiosClient from './axiosClient';


// Consultant APIs
export const getConsultantsList = async () => {
  return axiosClient.get('/User/consultants');
};

export const getConsultantById = async (consultantId: string) => {
  return axiosClient.get(`/User/consultants/${consultantId}`);
};


// Schedule management
export const getScheduleInfo = async (scheduleId: string) => {
  return axiosClient.get(`/ConsultantSchedules/schedule/${scheduleId}`);
}

export const createConsultantSchedule = async (data: {
  consultantId: string;
  dayOfWeek: number;
  date: string;      
  startTime: string; 
  endTime: string;
  notes?: string;
}) => {   
  return axiosClient.post('/ConsultantSchedules', data );
};

export const deleteConsultantSchedule = async (scheduleId: string) => {
  return axiosClient.delete(`/ConsultantSchedules/${scheduleId}`);
}

export const updateConsultantSchedule = async (
  scheduleId: string,
  data: {
    consultantId: string;
    dayOfWeek: number;
    date: string;
    startTime: string;
    endTime: string;
    notes?: string;
  }
) => {
  return axiosClient.put(`/ConsultantSchedules/${scheduleId}`, data);
};

export const getConsultantSchedules = async (consultantId: string) => {
  return axiosClient.get(`/ConsultantSchedules/${consultantId}`);
};

// Link appointment to schedule
export const linkAppointmentToSchedule = async (scheduleId: string, appointmentId: string) => {
  return axiosClient.post('/ConsultantSchedules/link-appointment', null, 
  {
    params: { scheduleId, appointmentId }
  });
};

// Certificate
export const getConsultantCertificatesById = async (consultantId: string) => {
  const res = await axiosClient.get('/Certificate');
  const allCertificates = res.data;
  const certificates = Array.isArray(allCertificates)
    ? allCertificates.filter((c: Users) => c.userID === consultantId)
    : [];
  return { data: certificates };
};

export const createConsultantCertificate = async (data: {
  userID: string;
  imgUrl: string;
  certificateName: string;
  dateAcquired: string;
  status: number;
}) => {
  return axiosClient.post('/Certificate', data);
};

export const deleteConsultantCertificate = async (certificateId: string) => {
  return axiosClient.delete(`/Certificate/${certificateId}`);
};

export const updateConsultantCertificate = async (
  certificateId: string,
  data: {
    imgUrl: string;
    certificateName: string;
    dateAcquired: string;
    status: number;
  }
) => {
  return axiosClient.put(`/Certificate/${certificateId}`, data);
};

export const getConsultantCertificates = async () => {
  return axiosClient.get('/Certificates');
}