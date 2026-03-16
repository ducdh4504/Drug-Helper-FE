import React from "react"
import { Modal, Form, Input, Select, DatePicker, Button, Space } from "antd"
import { ActivityStatus } from "../../types/enums/ActitvityStatusEnum"
import {
  getResultLevelFromLevelTarget,
  LevelTarget,
} from "../../types/enums/LevelTargetEnum"
import { PaperDraftEnum } from "../../types/enums/PaperDraftEnum"

const { TextArea } = Input
const { Option } = Select

interface BlogModalProps {
  visible: boolean
  form: any
  editingBlog: any
  imageFile: File | null
  setImageFile: (file: File | null) => void
  onCancel: () => void
  onFinish: (values: any) => void
}

const BlogModal: React.FC<BlogModalProps> = ({
  visible,
  form,
  editingBlog,
  imageFile,
  setImageFile,
  onCancel,
  onFinish,
}) => (
  <Modal
    title={editingBlog ? "Edit Blog" : "Create Blog"}
    open={visible}
    onCancel={onCancel}
    footer={null}
    width={800}
  >
    <Form
      form={form}
      layout="vertical"
      onFinish={onFinish}
      initialValues={{
        status: PaperDraftEnum.Opened,
      }}
    >
      <Form.Item
        name="title"
        label="Title"
        rules={[{ required: true, message: "Please input the title!" }]}
      >
        <Input placeholder="Enter blog title" />
      </Form.Item>

      <Form.Item label="Blog Image" name="imageFile" valuePropName="file">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0]
            setImageFile(file || null)
            form.setFieldsValue({ imageFile: file })
          }}
        />
      </Form.Item>
      {imageFile ? (
        <div style={{ marginBottom: 16 }}>
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
      ) : editingBlog?.imgUrl ? (
        <div style={{ marginBottom: 16 }}>
          <img
            src={editingBlog.imgUrl}
            alt="current blog image"
            style={{
              width: 120,
              height: 80,
              objectFit: "cover",
              borderRadius: 4,
            }}
          />
        </div>
      ) : null}

      <Form.Item
        name="content"
        label="Content"
        rules={[{ required: true, message: "Please input the content!" }]}
      >
        <TextArea
          rows={6}
          placeholder="Enter blog content"
          showCount
          maxLength={5000}
        />
      </Form.Item>

      <Space style={{ width: "100%" }}>
        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: "Please select status!" }]}
        >
          <Select placeholder="Select status" style={{ width: 150 }}>
            <Option value={PaperDraftEnum.Opened}>Open</Option>
            <Option value={PaperDraftEnum.Closed}>Closed</Option>
          </Select>
        </Form.Item>

        <Form.Item name="levelTarget" label="Level Target">
          <Select placeholder="Select level" style={{ width: 150 }} allowClear>
            <Option value={getResultLevelFromLevelTarget(LevelTarget.LOW)}>
              Low
            </Option>
            <Option value={getResultLevelFromLevelTarget(LevelTarget.MEDIUM)}>
              Medium
            </Option>
            <Option value={getResultLevelFromLevelTarget(LevelTarget.HIGH)}>
              High
            </Option>
          </Select>
        </Form.Item>

        <Form.Item name="publishDate" label="Publish Date">
          <DatePicker format="DD/MM/YYYY" style={{ width: 150 }} />
        </Form.Item>
      </Space>

      <div style={{ textAlign: "right", marginTop: 16 }}>
        <Space>
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="primary" htmlType="submit">
            {editingBlog ? "Update" : "Create"}
          </Button>
        </Space>
      </div>
    </Form>
  </Modal>
)

export default BlogModal
