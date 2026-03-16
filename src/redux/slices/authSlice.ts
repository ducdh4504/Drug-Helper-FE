import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { getRoleFromToken, getUserIdFromToken } from '../../utils/helpers/getRoleJwt'
import { setAuthToken } from '../../services/axiosClient'

const exprireMinute = 30

interface AuthState {
  isLoggedIn: boolean
  token?: string
  role?: string
  userId?: string
  expiresAt?: number 
}

interface AuthPayload {
  token: string
  expiresIn?: number 
}

const initialState: AuthState = {
  isLoggedIn: false,
  token: undefined,
  role: undefined,
  userId: undefined,
  expiresAt: undefined,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<AuthPayload>) {
      state.isLoggedIn = true
      state.token = action.payload.token
      state.role = getRoleFromToken(action.payload.token)
      state.userId = getUserIdFromToken(action.payload.token)
      
      const expiresIn = action.payload.expiresIn || exprireMinute * 60 * 1000;
      state.expiresAt = Date.now() + (expiresIn > 1000000000 ? expiresIn : expiresIn * 1000);
      setAuthToken(action.payload.token) 
    },
    logout(state) {
      state.isLoggedIn = false
      state.token = undefined
      state.role = undefined
      state.userId = undefined
      state.expiresAt = undefined
      setAuthToken(undefined) 
    },
  },
})

export const { loginSuccess, logout } = authSlice.actions

export default authSlice.reducer
