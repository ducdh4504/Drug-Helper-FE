import { useState, useRef, useEffect } from "react"
import { FaUser } from "react-icons/fa"
import { IoLogOutOutline } from "react-icons/io5"
import null_avatar from "../../assets/images/null_avatar.png"
import "./UserDropdown.scss"
import { useNavigate } from "react-router-dom"
import { logout } from "../../redux/slices/authSlice"
import { useDispatch, useSelector } from "react-redux"
import type { RootState } from "../../redux/store"

interface UserDropdownProps {
  imageSource?: string
}

const UserDropdown = ({ imageSource }: UserDropdownProps) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Get user role from redux
  const userRole = useSelector((state: RootState) => state.auth.role)

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setOpen(false)
    }
  }

  const handleLogout = () => {
    dispatch(logout())
    navigate("/login")
  }

  const handleProfileClick = () => {
    if (userRole === "Member") {
      navigate("/profile")
    } else if (userRole === "Staff" || userRole === "Manager") {
      navigate("/staff/profile")
    } else if (userRole === "Consultant") {
      navigate("/consultant/profile")
    } else if (userRole === "Admin") {
      navigate("/admin/profile")
    } else {
      // Default fallback
      navigate("/profile")
    }
    setOpen(false)
  }

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div className="user-dropdown" ref={dropdownRef}>
      <button onClick={() => setOpen(!open)} className="avatar-btn">
        <div className="avatar-img-wrapper">
          {imageSource ? (
            <img src={imageSource} alt="avatar" className="avatar-img" />
          ) : (
            <img src={null_avatar} alt="avatar" className="avatar-img" />
          )}
        </div>
      </button>

      {open && (
        <div className="dropdown-menu">
          <div className="dropdown-item" onClick={handleProfileClick}>
            <FaUser className="icon" />
            <span>My profile</span>
          </div>
          <div className="divider" />
          <div className="dropdown-item" onClick={handleLogout}>
            <IoLogOutOutline className="icon" />
            <span>Logout</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserDropdown
