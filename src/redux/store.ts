import { configureStore } from '@reduxjs/toolkit'
import { persistReducer, persistStore } from 'redux-persist'
import storage from 'redux-persist/lib/storage' 
import authReducer from './slices/authSlice'
import passwordResetReducer from './slices/passwordResetSlice'
import coursesReducer from "./slices/courseSlice"
import notificationReducer from './slices/notificationSlice'
import courseRegistrationReducer from './slices/courseRegistrationSlice'
import consultantReducer from './slices/consultantSlice'

const persistConfig = {
  key: 'auth',
  storage,
  whitelist: ['isLoggedIn', 'user', 'token'],
}

const persistedAuthReducer = persistReducer(persistConfig, authReducer)

export const store = configureStore({
  reducer: {
    auth: persistedAuthReducer,
    passwordReset: passwordResetReducer,
    courses: coursesReducer,
    notification: notificationReducer,
    courseRegistration: courseRegistrationReducer,
    consultants: consultantReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
})

export const persistor = persistStore(store)
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
