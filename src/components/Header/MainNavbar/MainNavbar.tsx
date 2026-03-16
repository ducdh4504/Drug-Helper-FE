import { useSelector } from "react-redux"
import "./MainNavbar.scss"
import { useNavigate } from "react-router-dom"
import type { RootState } from "../../../redux/store"
import UserDropdown from "../../UserDropdown/UserDropdown"

const Navbar: React.FC = () => {
  const navigate = useNavigate()

  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn)

  return (
    <header className="header">
      <div className="header__container">
        <div
          className="logo"
          onClick={() => navigate("/")}
          style={{ cursor: "pointer" }}
        >
          DRUG-HELPER
        </div>

        <nav className="nav">
          <a href="#" onClick={() => navigate("/course-catalog")}>
            Course
          </a>
          <a href="#" onClick={() => navigate("/program")}>
            Workshop
          </a>
          <a href="#" onClick={() => navigate("/consultants")}>
            Consultant
          </a>
          <a href="#" onClick={() => navigate("/test")}>
            Test
          </a>
          <a href="#" onClick={() => navigate("/blog")}>
            Blogs
          </a>
        </nav>
        {isLoggedIn ? (
          <UserDropdown imageSource="" />
        ) : (
          <button className="login-btn" onClick={() => navigate("/login")}>
            LOGIN
          </button>
        )}
      </div>
    </header>
  )
}

export default Navbar
