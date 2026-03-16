import "./Footer.scss"
import { RiInstagramFill } from "react-icons/ri"
import { IoLogoFacebook } from "react-icons/io"
import { FaYoutube } from "react-icons/fa"
import { useNavigate } from "react-router-dom"

const Footer: React.FC = () => {
  const navigate = useNavigate()
  return (
    <footer className="footer">
      <div className="footer__container">
        <div className="footer__top">
          <div className="footer__left">
            <div className="footer__brand">DRUG-HELPER</div>
            <div className="footer__desc">
              Drug-helper is an online drug education and prevention platform to
              help educate people of all ages and fields of work on drug and
              alcohol use.
            </div>
          </div>

          <div className="footer__right">
            <div className="footer__quicklinks">
              <div className="footer__quicklinks-title">Quick Links</div>
              <div className="footer__quicklinks-list">
                <a
                  href="/course-catalog"
                  onClick={() => navigate("/course-catalog")}
                >
                  Course
                </a>
                <a href="#" onClick={() => navigate("/program")}>
                  Workshop
                </a>
                <a href="/consultants" onClick={() => navigate("/consultants")}>
                  Consultant
                </a>
                <a href="/test" onClick={() => navigate("/test")}>
                  Test
                </a>
                <a href="#" onClick={() => navigate("/blog")}>
                  Blogs
                </a>
                <a href="/about-us" onClick={() => navigate("/about-us")}>
                  About Us
                </a>
              </div>
            </div>

            <div className="footer__social-section">
              <div className="footer__social-title">Follow Us</div>
              <div className="footer__social">
                <a
                  href="#"
                  className="footer__social-link"
                  aria-label="Facebook"
                >
                  <IoLogoFacebook className="footer__icon" />
                </a>
                <a
                  href="#"
                  className="footer__social-link"
                  aria-label="Instagram"
                >
                  <RiInstagramFill className="footer__icon" />
                </a>
                <a
                  href="#"
                  className="footer__social-link"
                  aria-label="YouTube"
                >
                  <FaYoutube className="footer__icon" />
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="footer__bottom">
          <div className="footer__copyright">
            © 2025 Drug Helper. All rights reserved
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
