import Navbar from "../components/Header/MainNavbar/MainNavbar"
import Footer from "../components/Footer/Footer"
import { Outlet } from "react-router-dom"

const MainLayout = () => {
  return (
    <>
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

export default MainLayout
