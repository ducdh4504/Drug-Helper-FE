import React from "react"
import { Drawer, Table, Tag } from "antd"
import dayjs from "dayjs"
import { ActivityStatus } from "../../types/enums/ActitvityStatusEnum"
import type { ProgramParticipation } from "../../types/interfaces/CommunicationPrograms"

interface ParticipationsDrawerProps {
  visible: boolean
  onClose: () => void
  participations: ProgramParticipation[]
  usernames: { [userId: string]: string }
  getStatusColor: (status: ActivityStatus) => string
  getStatusText: (status: ActivityStatus) => string
}

const ParticipationsDrawer: React.FC<ParticipationsDrawerProps> = ({
  visible,
  onClose,
  participations,
  usernames,
  getStatusColor,
  getStatusText,
}) => (
  <Drawer
    title="Program Participations"
    placement="right"
    size="large"
    onClose={onClose}
    open={visible}
  >
    <div>
      <p>Total Participants: {participations.length}</p>
      {participations.length > 0 ? (
        <Table
          dataSource={participations}
          rowKey={(record) => record.userID}
          pagination={false}
          columns={[
            {
              title: "Name",
              dataIndex: "userID",
              key: "userID",
              render: (userID: string) => usernames[userID],
            },
            {
              title: "Join Time",
              dataIndex: "joinTime",
              key: "joinTime",
              render: (time: string) =>
                time ? dayjs(time).format("DD/MM/YYYY HH:mm") : "-",
            },
            {
              title: "Status",
              dataIndex: "status",
              key: "status",
              render: (status: ActivityStatus) => (
                <Tag color={getStatusColor(status)}>
                  {getStatusText(status)}
                </Tag>
              ),
            },
          ]}
        />
      ) : (
        <p>No participants found for this program.</p>
      )}
    </div>
  </Drawer>
)

export default ParticipationsDrawer
