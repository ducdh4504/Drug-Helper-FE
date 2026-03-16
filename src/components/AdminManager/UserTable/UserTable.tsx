import React from 'react';
import { Table, Tag, Avatar, Button, Tooltip, Space, Typography } from 'antd';
import { EditOutlined, UserOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import type { Users } from '../../../types/interfaces/User';
import './UserTable.scss';
import dayjs from 'dayjs';

const { Text } = Typography;

interface UserTableProps {
  users: Users[];
  loading: boolean;
  onEdit: (user: Users) => void;
  getRoleColor: (role: number) => string;
  roleMap: Record<number, string>;
}

const UserTable: React.FC<UserTableProps> = ({ users, loading, onEdit, getRoleColor, roleMap }) => {
  const columns: ColumnsType<Users> = [
    {
      title: 'User',
      key: 'user',
      width: 180,
      render: (_, record) => (
        <div className="user-info">
          <Avatar
            size={40}
            icon={<UserOutlined />}
            src={record.imgUrl}
            className={record.status === 0 ? 'active-avatar' : 'inactive-avatar'}
          />
          <div className="user-details">
            <div className="user-name">{record.fullName || 'No Name'}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Username',
      dataIndex: 'userName',
      key: 'userName',
      width: 140,
      render: (userName) => <Text copyable>{userName}</Text>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      className: 'ant-table-cell-email',
      render: (email) => <Text copyable>{email}</Text>,
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      className: 'ant-table-cell-phone',
      render: (phone) => phone || 'N/A',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      className: 'ant-table-cell-address',
      render: (address) => address || 'N/A',
      ellipsis: true,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      className: 'ant-table-cell-role',
      width: 90,
      render: (role) => (
        <Tag color={getRoleColor(role)}>
          {roleMap[role] || 'Unknown'}
        </Tag>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      className: 'ant-table-cell-status',
      width: 90,
      render: (_, record) => (
        <Tag color={record.status === 0 ? 'success' : 'default'}>
          {record.status === 0 ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Date of Birth',
      dataIndex: 'dateOfBirth',
      key: 'dateOfBirth',
      className: 'ant-table-cell-dob',
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY') : 'N/A',
    },
    {
      title: 'Actions',
      key: 'actions',
      className: 'ant-table-cell-actions',
      width: 70,
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit user">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => onEdit(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={users}
      rowKey="userID"
      loading={loading}
      pagination={{
        pageSize: 5,
        showQuickJumper: true,
        showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} users`,
      }}
      className="users-table"
    />
  );
};

export default UserTable; 