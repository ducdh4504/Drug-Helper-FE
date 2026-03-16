import React, { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import BlogsBox from "../../components/BlogsBox/BlogsBox"
import BackLink from "../../components/BackLink/BackLink"
import type { Blogs } from "../../types/interfaces/Blogs"
import { getBlogById, getBlogsList } from "../../services/blogAPI"
import { getAuthorName } from "../../services/userAPI"
import "./BlogDetail.scss"
import { formatDate } from "../../utils/helpers/dateUtils"

const BlogDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [blog, setBlog] = useState<Blogs | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [relatedBlogs, setRelatedBlogs] = useState<Blogs[]>([])
  const [authorName, setAuthorName] = useState<string>("Loading...")

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        setLoading(true)
        if (id) {
          // Fetch blog details
          const response = await getBlogById(id)
          setBlog(response.data)

          // Fetch author name
          if (response.data.userID) {
            try {
              const authorResponse = await getAuthorName(response.data.userID)
              setAuthorName(authorResponse.data.fullName || "Unknown Author")
            } catch {
              setAuthorName("Unknown Author")
            }
          }

          // Fetch related blogs
          const blogsResponse = await getBlogsList()
          const allBlogs = Array.isArray(blogsResponse.data)
            ? blogsResponse.data
            : []
          const filteredBlogs = allBlogs
            .filter((b) => b.blogID !== id)
            .slice(0, 2)
          setRelatedBlogs(filteredBlogs)
        }
      } catch (err) {
        setError("Failed to load blog data")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchBlog()
  }, [id])

  if (loading) {
    return (
      <div className="blog-detail-container">
        <div className="background-blog-detail-overlay"></div>
        <div className="blog-details">
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            Loading...
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="blog-detail-container">
        <div className="background-blog-detail-overlay"></div>
        <div className="blog-details">
          <div
            style={{ textAlign: "center", padding: "40px 0", color: "#e74c3c" }}
          >
            Error: {error}
          </div>
        </div>
      </div>
    )
  }

  if (!blog) {
    return (
      <div className="blog-detail-container">
        <div className="background-blog-detail-overlay"></div>
        <div className="blog-details">
          <div style={{ textAlign: "center", padding: "40px 0" }}>
            Blog not found
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="blog-detail-container">
      <div className="background-blog-detail-overlay"></div>

      <div className="blog-details">
        <BackLink to="/blog" />

        <h1 className="blog-title">{blog.title}</h1>

        {blog.imgUrl && (
          <img
            alt={blog.title || "Blog Image"}
            className="blog-image"
            src={blog.imgUrl}
            onError={(e) => {
              e.currentTarget.src =
                "https://firebasestorage.googleapis.com/v0/b/drug-helper-1c86b.firebasestorage.app/o/courseImage%2FcourseImage_fallback1.png?alt=media&token=daa6c640-923e-445e-8a0b-6cc0385a4c93"
            }}
          />
        )}

        <div className="blog-meta">
          <p className="meta-author">Author: {authorName}</p>
          <p className="meta-date">
            Date: {formatDate(blog.publishDate) || "N/A"}
          </p>
        </div>

        <div className="blog-content">
          {blog.content || "No content available"}
        </div>
      </div>

      {/* Other blogs section */}
      {relatedBlogs.length > 0 && (
        <div className="other-blog-section">
          <h2 className="other-blog-title">Other blog</h2>
          <div className="other-blog-list">
            {relatedBlogs.map((relatedBlog) => (
              <div key={relatedBlog.blogID} className="other-blog-item">
                <BlogsBox
                  blog={relatedBlog}
                  onClick={() => navigate(`/blog/${relatedBlog.blogID}`)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default BlogDetail
