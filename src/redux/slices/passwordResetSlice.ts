// src/store/slices/passwordResetSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { sendPasswordResetEmail } from 'firebase/auth'
import actionCodeSettings, { auth } from '../../utils/filebaseConfig'

interface PasswordResetState {
  loading: boolean
  error: string | null
  message: string
}

const initialState: PasswordResetState = {
  loading: false,
  error: null,
  message: '',
}

export const resetPassword = createAsyncThunk(
  'passwordReset/resetPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      await sendPasswordResetEmail(auth, email, actionCodeSettings)
      return 'Đã gửi email đặt lại mật khẩu. Vui lòng kiểm tra hộp thư!'
    } catch (error: unknown) {
      let errorMessage = 'Đã xảy ra lỗi không xác định.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      return rejectWithValue(errorMessage)
    }
  }
)

const passwordResetSlice = createSlice({
  name: 'passwordReset',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(resetPassword.pending, (state) => {
        state.loading = true
        state.error = null
        state.message = ''
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.loading = false
        state.message = action.payload as string
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
  },
})

export default passwordResetSlice.reducer
