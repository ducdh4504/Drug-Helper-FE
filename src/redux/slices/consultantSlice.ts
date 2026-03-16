import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { 
  getConsultantsList, 
  getConsultantById, 
  getConsultantCertificatesById, 
  getConsultantSchedules,
  createConsultantCertificate,
  updateConsultantCertificate,
  deleteConsultantCertificate
} from "../../services/consultantAPI"
import type { Users } from "../../types/interfaces/User"
import type { Certificates } from "../../types/interfaces/Certificates"
import type { ConsultantSchedules } from "../../types/interfaces/ConsultantSchedules"

// Async thunks
export const fetchConsultants = createAsyncThunk(
  "consultants/fetchConsultants", 
  async () => {
    const res = await getConsultantsList()
    return res.data as Users[]
  }
)

export const fetchConsultantById = createAsyncThunk(
  "consultants/fetchConsultantById",
  async (consultantId: string) => {
    const res = await getConsultantById(consultantId)
    return res.data as Users
  }
)

export const fetchConsultantCertificates = createAsyncThunk(
  "consultants/fetchConsultantCertificates",
  async (consultantId: string) => {
    const res = await getConsultantCertificatesById(consultantId)
    return { consultantId, certificates: res.data as Certificates[] }
  }
)

export const fetchConsultantSchedules = createAsyncThunk(
  "consultants/fetchConsultantSchedules",
  async (consultantId: string) => {
    const res = await getConsultantSchedules(consultantId)
    return { consultantId, schedules: res.data as ConsultantSchedules[] }
  }
)

// Certificate management thunks
export const createCertificate = createAsyncThunk(
  "consultants/createCertificate",
  async (data: {
    userID: string;
    imgUrl: string;
    certificateName: string;
    dateAcquired: string;
    status: number;
  }) => {
    const res = await createConsultantCertificate(data)
    return res.data as Certificates
  }
)

export const updateCertificate = createAsyncThunk(
  "consultants/updateCertificate",
  async ({
    certificateId,
    data
  }: {
    certificateId: string;
    data: {
      imgUrl: string;
      certificateName: string;
      dateAcquired: string;
      status: number;
    };
  }) => {
    const res = await updateConsultantCertificate(certificateId, data)
    return { certificateId, certificate: res.data as Certificates }
  }
)

export const deleteCertificate = createAsyncThunk(
  "consultants/deleteCertificate",
  async ({ certificateId, userID }: { certificateId: string; userID: string }) => {
    await deleteConsultantCertificate(certificateId)
    return { certificateId, userID }
  }
)

interface ConsultantState {
  consultantList: Users[]
  selectedConsultant: Users | null
  consultantCertificates: Record<string, Certificates[]>
  consultantSchedules: Record<string, ConsultantSchedules[]>
  loadingConsultantList: boolean
  loadingConsultantById: boolean
  loadingSchedules: boolean
  loadingCertificates: boolean
  error: string | null
}

const initialState: ConsultantState = {
  consultantList: [],
  selectedConsultant: null,
  consultantCertificates: {},
  consultantSchedules: {},
  loadingConsultantList: false,
  loadingConsultantById: false,
  loadingSchedules: false,
  loadingCertificates: false,
  error: null,
}

const consultantSlice = createSlice({
  name: "consultants",
  initialState,
  reducers: {
    clearSelectedConsultant: (state) => {
      state.selectedConsultant = null
    },
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch consultants list
      .addCase(fetchConsultants.pending, (state) => {
        state.loadingConsultantList = true;
        state.error = null;
      })
      .addCase(fetchConsultants.fulfilled, (state, action) => {
        state.consultantList = Array.isArray(action.payload)
          ? action.payload
          : ((action.payload as any)?.data || []);
        state.loadingConsultantList = false;
      })
      .addCase(fetchConsultants.rejected, (state, action) => {
        state.loadingConsultantList = false;
        state.error = action.error.message || "Failed to fetch consultants";
      })

      // Fetch consultant by ID
      .addCase(fetchConsultantById.pending, (state) => {
        state.loadingConsultantById = true;
        state.error = null;
      })
      .addCase(fetchConsultantById.fulfilled, (state, action) => {
        state.selectedConsultant = action.payload;
        state.loadingConsultantById = false;
      })
      .addCase(fetchConsultantById.rejected, (state, action) => {
        state.loadingConsultantById = false;
        state.error = action.error.message || "Failed to fetch consultant details";
      })

      // Fetch consultant certificates
      .addCase(fetchConsultantCertificates.pending, (state) => {
        state.loadingCertificates = true;
        state.error = null;
      })
      .addCase(fetchConsultantCertificates.fulfilled, (state, action) => {
        const { consultantId, certificates } = action.payload;
        state.consultantCertificates[consultantId] = certificates;
        state.loadingCertificates = false;
      })
      .addCase(fetchConsultantCertificates.rejected, (state, action) => {
        state.loadingCertificates = false;
        const errorMessage = action.error.message || '';
        if (errorMessage.includes('404')) {
          state.error = "Không tìm thấy chứng chỉ cho consultant này."
        } else if (errorMessage.includes('network') || errorMessage.includes('timeout')) {
          state.error = "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet."
        } else {
          state.error = "Không thể tải chứng chỉ của consultant. Vui lòng thử lại sau."
        }
      })

      // Fetch consultant schedules
      .addCase(fetchConsultantSchedules.pending, (state) => {
        state.loadingSchedules = true;
        state.error = null;
      })
      .addCase(fetchConsultantSchedules.fulfilled, (state, action) => {
        const { consultantId, schedules } = action.payload;
        state.consultantSchedules[consultantId] = schedules;
        state.loadingSchedules = false;
      })
      .addCase(fetchConsultantSchedules.rejected, (state, action) => {
        state.loadingSchedules = false;
        const errorMessage = action.error.message || '';
        
        // Sử dụng thông báo lỗi từ backend nếu có
        if (errorMessage.includes('no available schedules') || errorMessage.includes('There are currently no available schedules')) {
          state.error = "Hiện tại không có lịch hẹn nào khả dụng. Vui lòng thử lại sau."
        } else if (errorMessage.includes('404') || errorMessage.includes('Resource not found')) {
          state.error = "Không tìm thấy lịch hẹn cho consultant này."
        } else if (errorMessage.includes('Network error') || errorMessage.includes('timeout')) {
          state.error = "Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet."
        } else {
          // Sử dụng thông báo lỗi từ backend hoặc thông báo mặc định
          state.error = errorMessage || "Không thể tải lịch hẹn của consultant. Vui lòng thử lại sau."
        }
      })

      // Create certificate
      .addCase(createCertificate.pending, (state) => {
        state.loadingCertificates = true;
        state.error = null;
      })
      .addCase(createCertificate.fulfilled, (state, action) => {
        state.loadingCertificates = false;
        const newCertificate = action.payload;
        const consultantId = newCertificate.userID;
        if (!state.consultantCertificates[consultantId]) {
          state.consultantCertificates[consultantId] = [];
        }
        state.consultantCertificates[consultantId].push(newCertificate);
      })
      .addCase(createCertificate.rejected, (state, action) => {
        state.loadingCertificates = false;
        state.error = action.error.message || "Không thể tạo chứng chỉ mới.";
      })

      // Update certificate
      .addCase(updateCertificate.pending, (state) => {
        state.loadingCertificates = true;
        state.error = null;
      })
      .addCase(updateCertificate.fulfilled, (state, action) => {
        state.loadingCertificates = false;
        const { certificateId, certificate } = action.payload;
        const consultantId = certificate.userID;
        if (state.consultantCertificates[consultantId]) {
          const index = state.consultantCertificates[consultantId].findIndex(
            cert => cert.certificateID === certificateId
          );
          if (index !== -1) {
            state.consultantCertificates[consultantId][index] = certificate;
          }
        }
      })
      .addCase(updateCertificate.rejected, (state, action) => {
        state.loadingCertificates = false;
        state.error = action.error.message || "Không thể cập nhật chứng chỉ.";
      })

      // Delete certificate
      .addCase(deleteCertificate.pending, (state) => {
        state.loadingCertificates = true;
        state.error = null;
      })
      .addCase(deleteCertificate.fulfilled, (state, action) => {
        state.loadingCertificates = false;
        const { certificateId, userID } = action.payload;
        if (state.consultantCertificates[userID]) {
          state.consultantCertificates[userID] = state.consultantCertificates[userID].filter(
            cert => cert.certificateID !== certificateId
          );
        }
      })
      .addCase(deleteCertificate.rejected, (state, action) => {
        state.loadingCertificates = false;
        state.error = action.error.message || "Không thể xóa chứng chỉ.";
      })
  },
})

export const { clearSelectedConsultant, clearError } = consultantSlice.actions

// Selectors
export const selectConsultants = (state: any) => state.consultants.consultantList
export const selectSelectedConsultant = (state: any) => state.consultants.selectedConsultant
export const selectConsultantCertificates = (consultantId: string) => (state: any) => 
  state.consultants.consultantCertificates[consultantId] || []
export const selectConsultantSchedules = (consultantId: string) => (state: any) => 
  state.consultants.consultantSchedules[consultantId] || []
export const selectConsultantsLoading = (state: any) => state.consultants.loadingConsultantList
export const selectConsultantSchedulesLoading = (state: any) => state.consultants.loadingSchedules
export const selectConsultantCertificatesLoading = (state: any) => state.consultants.loadingCertificates
export const selectConsultantsError = (state: any) => state.consultants.error
export const selectConsultantByIdLoading = (state: any) => state.consultants.loadingConsultantById

export default consultantSlice.reducer