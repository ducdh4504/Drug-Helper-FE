import React from 'react';
import { Select, Space, Tag } from 'antd';
import './UserFilterBar.scss';

interface UserFilterBarProps {
  roleMap: Record<number, string>;
  roleValue: number | undefined;
  statusValue: number | undefined;
  onRoleChange: (role: number | undefined) => void;
  onStatusChange: (status: number | undefined) => void;
  getRoleColor: (role: number) => string;
}

const ThinFilterIcon = () => (
  <svg className="user-filterbar__icon" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 5H15M5 9H13M7 13H11" stroke="#000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const UserFilterBar: React.FC<UserFilterBarProps> = ({
  roleMap,
  roleValue,
  statusValue,
  onRoleChange,
  onStatusChange,
  getRoleColor,
}) => {
  return (
    <Space className="user-filterbar" align="center">
      <span className="user-filterbar__label">
        <ThinFilterIcon />
        <span className="user-filterbar__label-text">Filter</span>
      </span>
      <Select
        allowClear
        placeholder="Role"
        className="user-filterbar__select"
        value={roleValue}
        onChange={onRoleChange}
        optionLabelProp="label"
      >
        {Object.entries(roleMap).map(([key, value]) => (
          <Select.Option
            value={Number(key)}
            key={key}
            label={<Tag color={getRoleColor(Number(key))} className="user-filterbar__tag">{value}</Tag>}
          >
            <Tag color={getRoleColor(Number(key))} className="user-filterbar__tag">{value}</Tag>
          </Select.Option>
        ))}
      </Select>
      <Select
        allowClear
        placeholder="Status"
        className="user-filterbar__select"
        value={statusValue}
        onChange={onStatusChange}
        optionLabelProp="label"
      >
        <Select.Option value={0} label={<Tag color="success" className="user-filterbar__tag">Active</Tag>}>
          <Tag color="success" className="user-filterbar__tag">Active</Tag>
        </Select.Option>
        <Select.Option value={1} label={<Tag color="default" className="user-filterbar__tag">Inactive</Tag>}>
          <Tag color="default" className="user-filterbar__tag">Inactive</Tag>
        </Select.Option>
      </Select>
    </Space>
  );
};

export default UserFilterBar; 