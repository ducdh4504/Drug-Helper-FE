import React from "react"
import {
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  TimePicker,
  Button,
  Space,
} from "antd"
import { LocationType } from "../../types/enums/LocationTypeEnum"

const { TextArea } = Input
const { Option } = Select

interface ProgramModalProps {
  visible: boolean
  form: any
  editingProgram: any
  imageFile: File | null
  speakerImageFile: File | null
  setImageFile: (file: File | null) => void
  setSpeakerImageFile: (file: File | null) => void
  onCancel: () => void
  onSubmit: (values: any) => void
}

const ProgramModal: React.FC<ProgramModalProps> = ({
  visible,
  form,
  editingProgram,
  imageFile,
  speakerImageFile,
  setImageFile,
  setSpeakerImageFile,
  onCancel,
  onSubmit,
}) => (
  <Modal
    title={editingProgram ? "Edit Program" : "Create Program"}
    open={visible}
    onCancel={onCancel}
    footer={null}
    width={800}
  >
    <Form
      form={form}
      layout="vertical"
      onFinish={onSubmit}
      initialValues={{
        locationType: LocationType.OFFLINE,
      }}
    >
      <Form.Item
        name="name"
        label="Program Name"
        rules={[{ required: true, message: "Please input the program name!" }]}
      >
        <Input placeholder="Enter program name" />
      </Form.Item>
      <Form.Item
        name="description"
        label="Description"
        rules={[{ required: true, message: "Please input the description!" }]}
      >
        <TextArea
          rows={4}
          placeholder="Enter program description"
          showCount
          maxLength={1000}
        />
      </Form.Item>
      <Form.Item label="Program Image">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
        />
        {imageFile ? (
          <div style={{ marginTop: 8 }}>
            <img
              src={URL.createObjectURL(imageFile)}
              alt="preview"
              style={{
                width: 120,
                height: 80,
                objectFit: "cover",
                borderRadius: 4,
              }}
            />
          </div>
        ) : editingProgram?.imgUrl ? (
          <div style={{ marginTop: 8 }}>
            <img
              src={editingProgram.imgUrl}
              alt="current program image"
              style={{
                width: 120,
                height: 80,
                objectFit: "cover",
                borderRadius: 4,
              }}
            />
          </div>
        ) : null}
      </Form.Item>
      <Space style={{ width: "100%" }}>
        <Form.Item
          name="date"
          label="Date"
          rules={[{ required: true, message: "Please select date!" }]}
        >
          <DatePicker format="DD/MM/YYYY" style={{ width: 150 }} />
        </Form.Item>
        <Form.Item
          name="startTime"
          label="Start Time"
          rules={[{ required: true, message: "Please select start time!" }]}
        >
          <TimePicker format="HH:mm" style={{ width: 120 }} />
        </Form.Item>
        <Form.Item
          name="endTime"
          label="End Time"
          rules={[{ required: true, message: "Please select end time!" }]}
        >
          <TimePicker format="HH:mm" style={{ width: 120 }} />
        </Form.Item>
      </Space>
      <Form.Item name="speaker" label="Speaker">
        <Input placeholder="Enter speaker name" />
      </Form.Item>
      <Form.Item label="Speaker Image">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setSpeakerImageFile(e.target.files?.[0] || null)}
        />
        {speakerImageFile ? (
          <div style={{ marginTop: 8 }}>
            <img
              src={URL.createObjectURL(speakerImageFile)}
              alt="speaker preview"
              style={{
                width: 120,
                height: 80,
                objectFit: "cover",
                borderRadius: 4,
              }}
            />
          </div>
        ) : editingProgram?.speakerImageUrl ? (
          <div style={{ marginTop: 8 }}>
            <img
              src={editingProgram.speakerImageUrl}
              alt="current speaker image"
              style={{
                width: 120,
                height: 80,
                objectFit: "cover",
                borderRadius: 4,
              }}
            />
          </div>
        ) : null}
      </Form.Item>
      <Space style={{ width: "100%" }}>
        <Form.Item
          name="locationType"
          label="Location Type"
          rules={[{ required: true, message: "Please select location type!" }]}
        >
          <Select placeholder="Select type" style={{ width: 150 }}>
            <Option value={LocationType.ONLINE}>Online</Option>
            <Option value={LocationType.OFFLINE}>Offline</Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="location"
          label="Location"
          rules={[{ required: true, message: "Please input location!" }]}
        >
          <Input placeholder="Enter location" style={{ width: 250 }} />
        </Form.Item>
      </Space>
      <div style={{ textAlign: "right", marginTop: 16 }}>
        <Space>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            {editingProgram ? "Update" : "Create"}
          </Button>
        </Space>
      </div>
    </Form>
  </Modal>
)

export default ProgramModal
