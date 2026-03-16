import axios from "axios";
import type { Certificates } from "../types/interfaces/Certificates";

const API_URL = "/api/Certificate";

export const createCertificate = async (data: Omit<Certificates, "certificateID">) => {
  const response = await axios.post(API_URL, data);
  return response.data;
};

export const getCertificatesList = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const getCertificateById = async (certificateID: string) => {
    const response = await axios.get(`${API_URL}/${certificateID}`);
    return response.data;
}

export const updateCertificate = async (
  certificateID: string,
  data: { certificateName: string; dateAcquired: string; status: number }
) => {
  const response = await axios.put(`${API_URL}/${certificateID}`, data);
  return response.data;
};

export const deleteCertificate = async (certificateID: string) => {
  const response = await axios.delete(`${API_URL}/${certificateID}`);
  return response.data;
};