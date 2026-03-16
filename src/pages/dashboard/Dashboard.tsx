import "./Dashboard.scss"
import { useEffect, useState } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { getAgeGroupStats } from "../../services/userAPI"
import { getSurveyResultCountByProgram } from "../../services/surveyAPI"
import { getCommunicationProgramsList } from "../../services/programAPI"
import type { AgeGroupStat } from "../../types/interfaces/User"

type ProgramSurveyStat = {
  programId: string
  programName: string
  surveyResultCount: number
}

const Dashboard = () => {
  // Program survey statistics state
  const [programSurveyStats, setProgramSurveyStats] = useState<
    ProgramSurveyStat[]
  >([])

  // Age group statistics state
  const [ageGroupStats, setAgeGroupStats] = useState<AgeGroupStat[]>([])

  const [loadingAgeStats, setLoadingAgeStats] = useState(true)
  const [loadingProgramStats, setLoadingProgramStats] = useState(true)

  // Fetch Age Group Statistics
  useEffect(() => {
    const fetchAgeGroupStats = async () => {
      try {
        setLoadingAgeStats(true)
        const response = await getAgeGroupStats()
        console.log("Age Group API Response:", response)

        // Nếu response.data là object, chuyển thành mảng
        if (
          response?.data &&
          typeof response.data === "object" &&
          !Array.isArray(response.data)
        ) {
          // Không lọc key, giữ lại tất cả các nhóm tuổi kể cả Unknown, Under 18, Above 60
          const validKeys = Object.keys(response.data).filter(
            (key) => key !== "Total"
          )
          const transformedData: AgeGroupStat[] = validKeys.map((key) => {
            const item = response.data[key]
            return {
              ageGroup: key,
              count:
                typeof item.count === "number"
                  ? item.count
                  : parseInt(item.count) || 0,
              percentage:
                typeof item.percent === "number"
                  ? item.percent
                  : parseFloat(item.percent) || 0,
            }
          })
          setAgeGroupStats(transformedData)
        } else if (Array.isArray(response?.data) && response.data.length > 0) {
          // Trường hợp API trả về dạng mảng
          const transformedData: AgeGroupStat[] = response.data.map(
            (item: any) => ({
              ageGroup:
                item.ageGroup || item.ageRange || item.group || "Unknown",
              count: parseInt(item.count) || parseInt(item.userCount) || 0,
              percentage: parseFloat(item.percentage) || 0,
            })
          )
          setAgeGroupStats(transformedData)
        } else {
          // fallback
          setAgeGroupStats([])
        }
      } catch (error) {
        console.error("Error fetching age group stats:", error)
        setAgeGroupStats([])
      } finally {
        setLoadingAgeStats(false)
      }
    }

    fetchAgeGroupStats()
  }, []) // Empty dependency array to run only once

  // Fetch Program Survey Statistics
  useEffect(() => {
    const fetchProgramSurveyStats = async () => {
      try {
        setLoadingProgramStats(true)

        // First, get all communication programs
        const programsResponse = await getCommunicationProgramsList()

        if (programsResponse.data && Array.isArray(programsResponse.data)) {
          const programs = programsResponse.data

          // For each program, get survey result count
          const statsPromises = programs.map(async (program: any) => {
            try {
              const surveyCountResponse = await getSurveyResultCountByProgram(
                program.programID || program.id
              )
              return {
                programId: program.programID || program.id,
                programName: program.name || "Unknown Program",
                surveyResultCount: surveyCountResponse.data?.count || 0,
              }
            } catch (error) {
              console.error(
                `Error fetching survey count for program ${
                  program.programID || program.id
                }:`,
                error
              )
              return {
                programId: program.programID || program.id,
                programName: program.name || "Unknown Program",
                surveyResultCount: 0,
              }
            }
          })

          const resolvedStats = await Promise.all(statsPromises)
          setProgramSurveyStats(resolvedStats)
        } else {
          setProgramSurveyStats([])
        }
      } catch (error) {
        console.error("Error fetching program survey stats:", error)
        // Don't show error notification to avoid infinite loop
        // Just log the error and set empty data
        setProgramSurveyStats([])
      } finally {
        setLoadingProgramStats(false)
      }
    }

    fetchProgramSurveyStats()
  }, []) // Empty dependency array to run only once

  // Colors for the age group chart
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

  return (
    <div className="dashboard-container">
      <h1>Program Dashboard</h1>

      {/* Program Survey Statistics Section */}
      <section className="dashboard-section">
        <h2>Survey Results by Program</h2>
        {loadingProgramStats ? (
          <div className="loading-indicator">
            Loading program survey statistics...
          </div>
        ) : (
          <div className="stats-table-container">
            {programSurveyStats.length > 0 ? (
              <table className="stats-table">
                <thead>
                  <tr>
                    <th>Program Name</th>
                    <th>Survey Results Count</th>
                  </tr>
                </thead>
                <tbody>
                  {programSurveyStats.map((stat) => (
                    <tr key={stat.programId}>
                      <td>{stat.programName}</td>
                      <td>
                        <div className="count-display">
                          <span className="count-number">
                            {stat.surveyResultCount}
                          </span>
                          <span className="count-label">results</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-data-message">No program data available</div>
            )}
          </div>
        )}
      </section>

      {/* Age Group Statistics Section */}
      <section className="dashboard-section">
        <h2>Participant Age Distribution</h2>
        {loadingAgeStats ? (
          <div className="loading-indicator">
            Loading age group statistics...
          </div>
        ) : (
          <div className="charts-container">
            {ageGroupStats.length > 0 ? (
              <>
                <div className="chart-wrapper">
                  <h3>Age Group Count</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={ageGroupStats}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="ageGroup" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="count"
                        fill="#8884d8"
                        name="Number of Participants"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-wrapper">
                  <h3>Age Group Percentage</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={ageGroupStats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="percentage"
                        nameKey="ageGroup"
                        label={({ name, percent, value }) =>
                          value === 0
                            ? ""
                            : `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {ageGroupStats.map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, _name, props) => [
                          `${value}%`,
                          props.payload.ageGroup,
                        ]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : (
              <div className="no-data-message">No age group data available</div>
            )}
          </div>
        )}
      </section>

      {/* Program Survey Stats Chart */}
      {!loadingProgramStats && programSurveyStats.length > 0 && (
        <section className="dashboard-section">
          <h2>Survey Results by Program (Chart)</h2>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={programSurveyStats}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="programName"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="surveyResultCount"
                  fill="#82ca9d"
                  name="Survey Results Count"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}
    </div>
  )
}

export default Dashboard
