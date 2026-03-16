import React, { useEffect, useState } from "react"
import { getBlogsList } from "../../services/blogAPI"
import BlogsBox from "../../components/BlogsBox/BlogsBox"
import SearchBar from "../../components/Search/SearchBar"
import "./BlogCatalog.scss"
import { useNavigate } from "react-router-dom"

const BlogsCatalog: React.FC = () => {
  const navigate = useNavigate()
  const [blogs, setBlogs] = useState<any[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string>("")

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true)
        const response = await getBlogsList()
        const data = Array.isArray(response.data) ? response.data : []
        setBlogs(data)
      } catch (err) {
        setError("Failed to load blogs")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchBlogs()
  }, [])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  const filteredBlogs = blogs.filter(
    (blog) =>
      blog.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.content?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) return <div className="blogs-catalog">Loading...</div>
  if (error) return <div className="blogs-catalog">Error: {error}</div>

  return (
    <div className="blogs-catalog">
      <section className="header-blog-section">
        <div className="image-background">
          <img
            src="https://firebasestorage.googleapis.com/v0/b/drug-helper-1c86b.firebasestorage.app/o/courseImage%2FcourseImage_fallback1.png?alt=media&token=daa6c640-923e-445e-8a0b-6cc0385a4c93"
            alt="Blog visual"
          />
        </div>
        <div className="image-blog">
          <img
            src="https://firebasestorage.googleapis.com/v0/b/drug-helper-1c86b.firebasestorage.app/o/blogImage%2Fblogtitle.png?alt=media&token=4c7aac40-0167-483a-923d-4f8bdc5ea7f9"
            alt="Blog illustration"
          />
        </div>
        <div className="title-blog-box">
          <h2>BLOGS</h2>
          <p className="tags-summary">
            Our blog covers a wide range of topics related to drug awareness,
            treatment strategies, and personal recovery experiences. Whether
            you're seeking help or looking to support others, there's something
            here for you.
          </p>
        </div>
      </section>
      <SearchBar onSearch={handleSearch} />
      <div className="blogs-grid">
        {filteredBlogs.map((blog) => (
          <BlogsBox
            key={blog.blogID}
            blog={blog}
            onClick={() => navigate(`/blog/${blog.blogID}`)}
          />
        ))}
      </div>
    </div>
  )
}

export default BlogsCatalog
