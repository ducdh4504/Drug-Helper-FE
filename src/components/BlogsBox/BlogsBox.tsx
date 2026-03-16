import React, { useEffect, useState } from "react"
import type { Blogs } from "../../types/interfaces/Blogs"
import "./BlogsBox.scss"
import { formatDate } from "../../utils/helpers/dateUtils"
import { getAuthorName } from "../../services/userAPI"
import { useNavigate } from "react-router-dom"

interface BlogsBoxProps {
  blog: Blogs
  onClick?: () => void
}

const BlogsBox: React.FC<BlogsBoxProps> = ({ blog, onClick }) => {
  const navigate = useNavigate()

  const imgUrl =
    blog.imgUrl && blog.imgUrl.startsWith("http")
      ? blog.imgUrl
      : "https://firebasestorage.googleapis.com/v0/b/drug-helper-1c86b.firebasestorage.app/o/courseImage%2FcourseImage_fallback1.png?alt=media&token=daa6c640-923e-445e-8a0b-6cc0385a4c93"

  const [authorName, setAuthorName] = useState<string>("Loading...")

  useEffect(() => {
    let ignore = false
    getAuthorName(blog.userID)
      .then((res) => {
        if (!ignore) setAuthorName(res.data.fullName || "Unknown Author")
      })
      .catch(() => {
        if (!ignore) setAuthorName("Unknown Author")
      })
    return () => {
      ignore = true
    }
  }, [blog.userID])

  return (
    <div className="blogs-container-blogs-box" onClick={onClick}>
      <div
        className="blogs-image"
        style={{ backgroundImage: `url(${imgUrl})` }}
        role="img"
        aria-label={blog.title || "Blog Image"}
      />

      <div className="blogs-content">
        <div className="blogs-main-content">
          <h3
            className="blogs-title"
            onClick={() => navigate(`/blogs/${blog.blogID}`)}
          >
            {blog.title || "Untitled Blog"}
          </h3>
          <p className="blogs-description">
            {blog.content || "No content available"}
          </p>
        </div>

        <div className="blogs-meta">
          <p className="blogs-author">
            <strong>Author:</strong> {authorName}
          </p>
          <p className="blogs-date">
            <strong>Date:</strong> {formatDate(blog.publishDate)}
          </p>
        </div>
      </div>
    </div>
  )
}

export default BlogsBox
