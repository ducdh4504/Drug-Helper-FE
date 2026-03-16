import axiosClient from "./axiosClient";

// Communication Program API
export const createCommunicationProgram = async (data: {
  name: string;
  description: string;
  imgUrl: string;
  date: string;
  startTime: string;
  endTime: string;
  speaker: string;
  speakerImageUrl: string;
  locationType: number;
  location: string;
}) => {
  return axiosClient.post("/CommunicationPrograms", data);
};

export const updateCommunicationProgram = async (data: {
  programID: string;
  name: string;
  description: string;
  imgUrl: string;
  date: string;
  startTime: string;
  endTime: string;
  speaker: string;
  speakerImageUrl: string;
  status: number;
  locationType: number;
  location: string;
}) => {
  return axiosClient.put("/CommunicationPrograms", data);
};

export const getCommunicationProgramsList = () => {
  return axiosClient.get("/CommunicationPrograms");
}

export const getCommunicationProgramById = (programId: string) => {
  return axiosClient.get(`/CommunicationPrograms/${programId}`);
};

export const deleteCommunicationProgram = async (programID: string) => {
  return axiosClient.delete("/CommunicationPrograms", {
    params: { ProgramID: programID }
  });
};


// Program participation
export const createProgramParticipation = async (data: {
  userId: string;
  programId: string;
}) => {
  return axiosClient.post("/ProgramParticipations", data);
};

export const getUserProgramParticipation = async (userId: string) => {
    return axiosClient.get(`/ProgramParticipations/user/${userId}`);
}

export const getProgramParticipationById = async (userId: string, programId: string) => {
  return axiosClient.get("/ProgramParticipations/info", {
    params: { userId, programId }
  });
};

export const updateProgramParticipationStatus = async (data: {
  userId: string;
  programId: string;
  status: number;
}) => {
  return axiosClient.put("/ProgramParticipations/status", data);
};

export const getUserProgramParticipationByProgramId = async (programId: string) => {
  return axiosClient.get(`/ProgramParticipations/by-program/${programId}`);
}