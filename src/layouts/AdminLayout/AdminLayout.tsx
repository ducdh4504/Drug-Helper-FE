import { useState } from "react"
import AdminNavbar from "../../components/Header/AdminNavbar/AdminNavbar"
import SideTab from "../../components/SideTab/SideTab"
import { Outlet } from "react-router-dom"
import "./AdminLayout.scss"

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className="admin-layout">
      <AdminNavbar
        onToggleSidebar={toggleSidebar}
        isSidebarOpen={isSidebarOpen}
      />

      <div className={`admin-content ${isSidebarOpen ? "sidebar-open" : ""}`}>
        <SideTab isOpen={isSidebarOpen} />
        <main className="admin-main">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout
