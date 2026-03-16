import React, { useEffect, useState } from "react"
import SearchBar from "../../components/Search/SearchBar"
import ProgramBox from "../../components/ProgramBox/ProgramBox"
import { getCommunicationProgramsList } from "../../services/programAPI"
import { Spin, message } from "antd"
import { ExclamationCircleOutlined, InboxOutlined } from "@ant-design/icons"
import "./CommunicationProgram.scss"

const CommunicationProgram: React.FC = () => {
  const [programs, setPrograms] = useState<any[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchPrograms = async () => {
      setLoading(true)
      setError("")
      try {
        const res = await getCommunicationProgramsList()
        const data = (res.data || []).map((item: any) => ({
          programID: item.programID,
          name: item.name,
          description: item.description,
          image:
            item.imgUrl ||
            item.image ||
            "https://via.placeholder.com/350x220?text=No+Image&bg=f8f9fa&color=6c757d",
          status: item.status,
          date: item.date,
          startTime: item.startTime,
          endTime: item.endTime,
          speaker: item.speaker,
          location: item.location,
          locationType: item.locationType,
          meetingLink: item.meetingLink,
        }))
        setPrograms(data)
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load program data!"
        )
        message.error(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to load program data!"
        )
      } finally {
        setLoading(false)
      }
    }
    fetchPrograms()
  }, [])

  const handleSearch = (term: string) => {
    setSearchTerm(term)
  }

  const filteredPrograms = programs.filter(
    (program) =>
      program.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      program.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (program.speaker &&
        program.speaker.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="communicate-program-container">
      <SearchBar onSearch={handleSearch} initialValue={searchTerm} />
      <h2 className="communicate-program-title">
        Community Communication Programs
      </h2>

      {loading ? (
        <div className="loading-container">
          <Spin size="large" />
          <div style={{ textAlign: "center", marginTop: 16, color: "#666" }}>
            Loading program list...
          </div>
        </div>
      ) : error ? (
        <div className="error-container">
          <ExclamationCircleOutlined className="error-icon" />
          <h3>Oops! An error occurred</h3>
          <p>{error}</p>
        </div>
      ) : (
        <div className="communicate-program-grid">
          {filteredPrograms.length === 0 ? (
            <div className="empty-state">
              <InboxOutlined className="empty-icon" />
              <h3>No programs found</h3>
              <p>
                {searchTerm
                  ? `No results found for "${searchTerm}". Try different keywords.`
                  : "No programs are currently being organized."}
              </p>
            </div>
          ) : (
            filteredPrograms.map((program) => (
              <ProgramBox key={program.programID} program={program} />
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default CommunicationProgram
