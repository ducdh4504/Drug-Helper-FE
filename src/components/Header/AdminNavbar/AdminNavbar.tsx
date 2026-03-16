import React from "react"
import { useNavigate } from "react-router-dom"
import UserDropdown from "../../UserDropdown/UserDropdown"
import "./AdminNavbar.scss"
import { RxHamburgerMenu } from "react-icons/rx"

interface AdminNavbarProps {
  onToggleSidebar?: () => void
  isSidebarOpen?: boolean
}

const AdminNavbar: React.FC<AdminNavbarProps> = ({
  onToggleSidebar,
  isSidebarOpen = false,
}) => {
  const navigate = useNavigate()

  return (
    <header className="admin-header">
      <div className="admin-header__container">
        <div className="admin-header__left">
          <button
            className={`sidebar-toggle-btn ${isSidebarOpen ? "open" : ""}`}
            onClick={onToggleSidebar}
            aria-label="Toggle sidebar"
          >
            <div className="hamburger-icon">
              <RxHamburgerMenu />
            </div>
          </button>

          <div className="admin-logo" onClick={() => navigate("/admin")}>
            DRUG-HELPER
          </div>
        </div>

        <div className="admin-header__right">
          <UserDropdown imageSource={""} />
        </div>
      </div>
    </header>
  )
}

export default AdminNavbar
