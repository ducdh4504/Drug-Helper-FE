import "./CourseSpecifies.scss"
import vector from "../../assets/icons/Vector.png"
interface CourseSpecifiesProps {
  title: string
  desc: string
  className?: string
}

const CourseSpecifies: React.FC<CourseSpecifiesProps> = ({
  title,
  desc,
  className = "",
}) => {
  return (
    <div className={`course-specifies-item single ${className}`}>
      <img className="logo-drugs-specifies" src={vector} alt="icon" />
      <h3 className="course-specifies-item-title">{title}</h3>
      <p className="course-specifies-item-desc">{desc}</p>
    </div>
  )
}

export default CourseSpecifies
