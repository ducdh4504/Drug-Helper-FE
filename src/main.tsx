import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App.tsx"
import { Provider } from "react-redux"
import { persistor, store } from "./redux/store.ts"
import { GoogleOAuthProvider } from "@react-oauth/google"
import { PersistGate } from "redux-persist/integration/react"
import { googleClientId } from "./utils/constants/globalConstants.ts"
import { LoadScript } from "@react-google-maps/api"

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

createRoot(document.getElementById("root")!).render(
  <GoogleOAuthProvider clientId={googleClientId}>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
          <App />
        </LoadScript>
      </PersistGate>
    </Provider>
  </GoogleOAuthProvider>
)
