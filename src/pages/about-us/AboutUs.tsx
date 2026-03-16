import type { FC } from "react"
import "./AboutUS.scss"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import type { RootState } from "../../redux/store"
import BackLink from "../../components/BackLink/BackLink"

const AboutUs: FC = () => {
  const navigate = useNavigate()
  const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn)

  const handleJoin = () => {
    if (isLoggedIn) {
      navigate("/")
    } else {
      navigate("/login")
    }
  }

  return (
    <div className="about-us-container">
      <div className="about-us-content">
        <BackLink />
        
        <div className="hero-section">
          <h1 className="page-title">About Drug Helper</h1>
          <p className="hero-subtitle">
            Empowering communities through education, support, and prevention
          </p>
        </div>

        <div className="mission-section">
          <h2 className="section-title">Our Mission</h2>
          <div className="content-block">
            <div className="text-content">
              <p>
                At Drug-Helper, our mission is to educate, support, and empower
                individuals and communities in the fight against drug abuse. We
                believe that prevention is the most powerful tool in protecting lives,
                especially those of young people.
              </p>
            </div>
            <div className="image-content">
              <img
                src="https://firebasestorage.googleapis.com/v0/b/drug-helper-1c86b.firebasestorage.app/o/otherImage%2FaboutUs1.png?alt=media&token=724e905c-ff02-4f3b-8071-8cf15aba8c63"
                alt="Drug prevention mission"
                className="section-image"
              />
            </div>
          </div>
        </div>

        <div className="story-section">
          <h2 className="section-title">Our Story</h2>
          <div className="content-block reverse">
            <div className="image-content">
              <img
                src="https://firebasestorage.googleapis.com/v0/b/drug-helper-1c86b.firebasestorage.app/o/otherImage%2FaboutUs2.png?alt=media&token=e332970c-c1cb-4d98-94e7-1852808907a0"
                alt="Drug Helper story"
                className="section-image"
              />
            </div>
            <div className="text-content">
              <div className="story-text">
                <p className="highlight">
                  Drug-Helper began with a simple yet powerful idea: what if we could
                  stop drug abuse before it starts?
                </p>
                <p>
                  Founded by a group of educators, counselors, and concerned
                  individuals, Drug-Helper was created as a response to the growing
                  impact of drug use on young lives. We saw how easily misinformation,
                  peer pressure, and silence could lead to dangerous choices—and we
                  knew we had to do something.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="growth-section">
          <h2 className="section-title">Our Growth</h2>
          <div className="content-block">
            <div className="text-content">
              <p>
                What started as a small initiative quickly grew into a dedicated
                platform offering education, guidance, and support. We listened to
                real stories, collaborated with experts, and built resources that
                speak honestly and clearly to people who need them most.
              </p>
              <p>
                Today, Drug-Helper is more than a website. It's a community of
                people who care deeply about prevention, who believe in second
                chances, and who work every day to build a world where healthier
                choices are possible—and supported.
              </p>
            </div>
            <div className="image-content">
              <img
                src="https://firebasestorage.googleapis.com/v0/b/drug-helper-1c86b.firebasestorage.app/o/otherImage%2FaboutUs3.png?alt=media&token=df9d5b35-def9-4e39-a514-baa455eb89e6"
                alt="Community growth"
                className="section-image"
              />
            </div>
          </div>
        </div>

        <div className="values-section">
          <h2 className="section-title">Our Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">🎯</div>
              <h3>Prevention First</h3>
              <p>We believe prevention is more powerful than intervention</p>
            </div>
            <div className="value-card">
              <div className="value-icon">🤝</div>
              <h3>Community Support</h3>
              <p>Building strong networks of care and understanding</p>
            </div>
            <div className="value-card">
              <div className="value-icon">📚</div>
              <h3>Education</h3>
              <p>Providing accurate, accessible information for all</p>
            </div>
            <div className="value-card">
              <div className="value-icon">💪</div>
              <h3>Empowerment</h3>
              <p>Helping individuals make informed, healthy choices</p>
            </div>
          </div>
        </div>

        <div className="closing-section">
          <div className="closing-message">
            <h3>This is our story. And we hope it becomes part of yours.</h3>
          </div>
          
          <button className="join-button" onClick={handleJoin}>
            <span className="button-icon">🚀</span>
            Join our community
          </button>
        </div>
      </div>
    </div>
  )
}

export default AboutUs
