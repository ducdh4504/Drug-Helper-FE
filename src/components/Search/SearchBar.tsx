import React, { useState } from "react"
import "./SearchBar.scss"
import { IoSearchOutline } from "react-icons/io5"

type SearchBarProps = {
  onSearch: (searchTerm: string) => void
  initialValue?: string
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  initialValue = "",
}) => {
  const [searchTerm, setSearchTerm] = useState(initialValue)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(searchTerm.trim())
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  return (
    <section className="search-bar-section">
      <div className="search-content">
        <h1 className="search-bar-title">Search for content</h1>
        <div className="search-bar-container">
          <form
            onSubmit={handleSearch}
            className="search-bar-form"
            role="search"
          >
            <input
              type="text"
              value={searchTerm}
              onChange={handleInputChange}
              placeholder="Keyword, topic, course name..."
              className="search-bar-input"
              autoComplete="off"
              aria-label="Search for courses and content"
            />
            <button
              type="submit"
              className="search-bar-button"
              aria-label="Search"
              title="Search"
            >
              <IoSearchOutline />
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default SearchBar
