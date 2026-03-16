import React from "react"
import { Modal, Transfer } from "antd"

interface TransferItem {
  key: string
  title: string
  description: string
}

interface ManageQuestionsModalProps {
  visible: boolean
  onCancel: () => void
  onOk: () => void
  transferData: TransferItem[]
  targetKeys: React.Key[]
  onTransferChange: (
    targetKeys: React.Key[],
    direction: "left" | "right",
    moveKeys: React.Key[]
  ) => void
  selectedAssessmentName?: string | null
}

const ManageQuestionsModal: React.FC<ManageQuestionsModalProps> = ({
  visible,
  onCancel,
  onOk,
  transferData,
  targetKeys,
  onTransferChange,
  selectedAssessmentName,
}) => (
  <Modal
    title={`Manage Questions - ${selectedAssessmentName || ""}`}
    open={visible}
    onCancel={onCancel}
    onOk={onOk}
    width={800}
    okText="Save Links"
    cancelText="Cancel"
  >
    <div style={{ marginBottom: 16 }}>
      <p>Select questions to link with this assessment:</p>
    </div>
    <Transfer
      dataSource={transferData}
      titles={["Available Questions", "Linked Questions"]}
      targetKeys={targetKeys}
      onChange={onTransferChange}
      render={(item) => (
        <div>
          <div style={{ fontWeight: 500 }}>{item.title}</div>
          <div style={{ fontSize: 12, color: "#666" }}>{item.description}</div>
        </div>
      )}
      listStyle={{
        width: 350,
        height: 400,
      }}
      showSearch
      filterOption={(inputValue, option) => {
        if (!option || typeof option.title !== "string") {
          return false
        }
        return option.title.toLowerCase().includes(inputValue.toLowerCase())
      }}
    />
  </Modal>
)

export default ManageQuestionsModal
