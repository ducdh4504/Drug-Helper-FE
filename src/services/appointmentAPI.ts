import axiosClient from "./axiosClient";

export const getAppointmentsByMember = (memberId: string) => {
  return axiosClient.get(`/Appointments/by-member/${memberId}`);
}

export const getAppointments = () => {
  return axiosClient.get('/Appointments');
}

export const getAppointmentById = (appointmentId: string) => {
  return axiosClient.get(`/Appointments/${appointmentId}`);
};

export const getConsultantAppointments = (consultantId: string) => {
  return axiosClient.get(`/Appointments/consultant/${consultantId}`);
};

// Thêm API để lấy appointments của consultant với thông tin user
export const getConsultantAppointmentsWithUserInfo = (consultantId: string) => {
  return axiosClient.get(`/Appointments/consultant/${consultantId}/with-user-info`);
};

// Thêm API để lấy appointments với thông tin user (tất cả)
export const getAppointmentsWithUserInfo = () => {
  return axiosClient.get('/Appointments/with-user-info');
};  

export const updateAppointmentStatus = async (data: {
  appointmentId: string;
  status: number;
}) => {
  return axiosClient.put("/Appointments/status", data);
};

export const createAppointment = async (data: {
  userId: string;
  consultantId: string;
  note: string;
  startTime: string;
  endTime: string;
  date: string;
}) => {
  console.log("Creating appointment with data:", data);
  return axiosClient.post('/Appointments', data);
};

export const getAppointmentsByConsultant = (consultantId: string) => {
  return axiosClient.get(`/Appointments/by-consultant/${consultantId}`);
};