import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { 
  registerCourse, 
  getCourseRegistration, 
  getUserCourseRegistrations 
} from '../../services/courseAPI'
import type { CourseRegistrations } from '../../types/interfaces/Courses'

interface CourseRegistrationState {
  registrations: Record<string, CourseRegistrations> 
  userRegistrations: CourseRegistrations[]
  loading: boolean
  error: string | null
  registeringCourseId: string | null
}

const initialState: CourseRegistrationState = {
  registrations: {},
  userRegistrations: [],
  loading: false,
  error: null,
  registeringCourseId: null,
}

// Async thunks
export const fetchUserRegistrations = createAsyncThunk(
  'courseRegistration/fetchUserRegistrations',
  async (userId: string) => {
    const response = await getUserCourseRegistrations(userId)
    return response.data as CourseRegistrations[]
  }
)

export const fetchCourseRegistrationStatus = createAsyncThunk(
  'courseRegistration/fetchCourseRegistrationStatus',
  async ({ userId, courseId }: { userId: string; courseId: string }) => {
    const response = await getCourseRegistration(userId, courseId)
    return { courseId, registration: response.data as CourseRegistrations }
  }
)

export const registerForCourse = createAsyncThunk(
  'courseRegistration/registerForCourse',
  async ({ userId, courseId }: { userId: string; courseId: string }) => {
    await registerCourse({ userId, courseId })
    
    const response = await getCourseRegistration(userId, courseId)
    return { courseId, registration: response.data as CourseRegistrations }
  }
)

const courseRegistrationSlice = createSlice({
  name: 'courseRegistration',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearRegistrations: (state) => {
      state.registrations = {}
      state.userRegistrations = []
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user registrations
      .addCase(fetchUserRegistrations.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserRegistrations.fulfilled, (state, action) => {
        state.loading = false
        const registrations = Array.isArray(action.payload) ? action.payload : []
        state.userRegistrations = registrations
        registrations.forEach(reg => {
          state.registrations[reg.courseId] = reg
        })
      })
      .addCase(fetchUserRegistrations.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch user registrations'
      })

      // Fetch course registration status
      .addCase(fetchCourseRegistrationStatus.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCourseRegistrationStatus.fulfilled, (state, action) => {
        state.loading = false
        const { courseId, registration } = action.payload
        state.registrations[courseId] = registration
      })
      .addCase(fetchCourseRegistrationStatus.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch registration status'
      })

      // Register for course
      .addCase(registerForCourse.pending, (state, action) => {
        state.registeringCourseId = action.meta.arg.courseId
        state.error = null
      })
      .addCase(registerForCourse.fulfilled, (state, action) => {
        state.registeringCourseId = null
        const { courseId, registration } = action.payload
        state.registrations[courseId] = registration
        
        // Update userRegistrations array
        const existingIndex = state.userRegistrations.findIndex(reg => reg.courseId === courseId)
        if (existingIndex >= 0) {
          state.userRegistrations[existingIndex] = registration
        } else {
          state.userRegistrations.push(registration)
        }
      })
      .addCase(registerForCourse.rejected, (state, action) => {
        state.registeringCourseId = null
        state.error = action.error.message || 'Failed to register for course'
      })
  },
})

export const { clearError, clearRegistrations } = courseRegistrationSlice.actions

// Selectors
export const selectCourseRegistration = (courseId: string) => (state: any) => 
  state.courseRegistration.registrations[courseId] || null

export const selectIsRegisteredForCourse = (courseId: string) => (state: any) => 
  !!state.courseRegistration.registrations[courseId]

export const selectIsRegisteringForCourse = (courseId: string) => (state: any) => 
  state.courseRegistration.registeringCourseId === courseId

export default courseRegistrationSlice.reducer