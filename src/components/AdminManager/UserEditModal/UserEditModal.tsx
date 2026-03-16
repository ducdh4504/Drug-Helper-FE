import React from 'react';
import { Modal, Form, Input, Select, Tag, Upload, Avatar, Button, Space, DatePicker, notification } from 'antd';
import { UploadOutlined, UserOutlined } from '@ant-design/icons';
import type { Users } from '../../../types/interfaces/User';
import { UserRole } from '../../../types/enums/UserRoleEnum';
import './UserEditModal.scss';
import { updateUser } from '../../../services/userAPI';
import { addUser } from '../../../services/userAPI';
import { uploadUserAvatar } from '../../../utils/helpers/firebaseUpload';

const { Option } = Select;

interface UserEditModalProps {
  visible: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  editingUser: Users | null;
  avatarUrl: string | null;
  setAvatarUrl: (url: string | null) => void;
  form: any;
  roleMap: Record<number, string>;
  getRoleColor: (role: number) => string;
  onSuccess?: () => void; // callback reload user
}

const UserEditModal: React.FC<UserEditModalProps> = ({
  visible,
  onCancel,
  editingUser,
  avatarUrl,
  setAvatarUrl,
  form,
  roleMap,
  getRoleColor,
  onSuccess,
}) => {
  const handleSubmit = async (values: any) => {
    try {
      const payload = { ...values, imgUrl: avatarUrl };
      if (editingUser) {
        // Nếu đang edit và password rỗng, không gửi password
        const updateData = { ...payload };
        if (!updateData.password || updateData.password.trim() === '') {
          delete updateData.password;
        }
        await updateUser(editingUser.userID, updateData);
        notification.success({ message: 'User updated successfully!' });
        if (onSuccess) onSuccess(); // reload user list
        onCancel();
      } else {
        await addUser(payload);
        notification.success({ message: 'User created successfully!' });
        if (onSuccess) onSuccess();
        onCancel();
      }
    } catch (error) {
      notification.error({ message: 'Error updating user!' });
    }
  };

  return (
    <Modal
      title={editingUser ? 'Edit User' : 'Create New User'}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{ role: UserRole.MEMBER }}
      >
        <Form.Item label="Avatar">
          <div className="avatar-upload-wrapper">
            <Upload
              showUploadList={false}
              beforeUpload={async (file) => {
                try {
                  const url = await uploadUserAvatar(file); 
                  setAvatarUrl(url);
                                     notification.success({ message: "Avatar uploaded successfully!" });
                 } catch (error) {
                   notification.error({ message: "Failed to upload image!" });
                  console.error('Upload error:', error);
                }
                return false;
              }}
              accept="image/*"
            >
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <Avatar
                  src={avatarUrl}
                  icon={<UserOutlined />}
                  size={200}
                />
                <div className="upload-icon-overlay">
                  <UploadOutlined />
                  <div className="upload-label">Upload Avatar</div>
                </div>
              </div>
            </Upload>
          </div>
        </Form.Item>
        <Form.Item
          name="userName"
          label="Username"
          rules={[
            { required: true, message: 'Please enter username' },
            { min: 3, message: 'Username must be at least 3 characters' },
          ]}
        >
          <Input placeholder="Enter username" />
        </Form.Item>
        <Form.Item
          name="password"
          label="Password"
          rules={[
            { required: !editingUser, message: 'Please enter password' },
            { min: 6, message: 'Password must be at least 6 characters' },
          ]}
        >
          <Input.Password 
            placeholder={editingUser ? "Leave blank to keep current password" : "Enter password"} 
          />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Please enter email' },
            { type: 'email', message: 'Please enter a valid email' },
          ]}
        >
          <Input placeholder="Enter email address" />
        </Form.Item>
        <Form.Item
          name="fullName"
          label="Full Name"
          rules={[
            { required: true, message: 'Please enter full name' },
          ]}
        >
          <Input placeholder="Enter full name" />
        </Form.Item>
        <Form.Item
          name="phone"
          label="Phone Number"
        >
          <Input placeholder="Enter phone number (optional)" />
        </Form.Item>
        <Form.Item
          name="dateOfBirth"
          label="Date of Birth"
        >
          <DatePicker
            format="DD/MM/YYYY"
            style={{ width: '100%' }}
            allowClear
            placeholder="Select date of birth (optional)"
          />
        </Form.Item>
        <Form.Item
          name="address"
          label="Address"
        >
          <Input.TextArea
            placeholder="Enter address (optional)"
            rows={3}
          />
        </Form.Item>
        <Form.Item
          name="role"
          label="Role"
          rules={[
            { required: true, message: 'Please select a role' },
          ]}
        >
          <Select placeholder="Select role">
            {Object.entries(roleMap).map(([key, value]) => (
              <Option value={Number(key)} key={key}>
                <Tag color={getRoleColor(Number(key))} style={{ fontWeight: 600, fontSize: 14, padding: '2px 8px', height: 24, lineHeight: '20px', borderRadius: 4 }}>
                  {value}
                </Tag>
              </Option>
            ))}
          </Select>
        </Form.Item>
        <Form.Item
          name="status"
          label="Status"
          rules={[{ required: true, message: 'Please select status' }]}
        >
          <Select>
            <Option value={0}>
              <Tag color="success" style={{ fontWeight: 600 }}>Active</Tag>
            </Option>
            <Option value={1}>
              <Tag color="default" style={{ fontWeight: 600 }}>Inactive</Tag>
            </Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Space>
            <Button type="primary" htmlType="submit">
              {editingUser ? 'Update User' : 'Create User'}
            </Button>
            <Button onClick={onCancel}>
              Cancel
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default UserEditModal; 