import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { getCoursesList } from "../../services/courseAPI"
import type { Courses } from "../../types/interfaces/Courses"

export const fetchCourses = createAsyncThunk("courses/fetchCourses", async () => {
  const res = await getCoursesList()
  return res.data as Courses[]
})

const coursesSlice = createSlice({
  name: "courses",
  initialState: {
    courseList: [] as Courses[],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCourses.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchCourses.fulfilled, (state, action) => {
        state.courseList = action.payload
        state.loading = false
      })
      .addCase(fetchCourses.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || "Failed to fetch courses"
      })
  },
})

export default coursesSlice.reducer