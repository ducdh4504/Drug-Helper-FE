import React from 'react';
import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import './UserSearchBar.scss';

interface UserSearchBarProps {
  searchText: string;
  onSearchTextChange: (value: string) => void;
}

const UserSearchBar: React.FC<UserSearchBarProps> = ({ searchText, onSearchTextChange }) => (
  <div className="search-section">
    <Input
      placeholder="Search users by name, username, or email..."
      prefix={<SearchOutlined />}
      value={searchText}
      onChange={e => onSearchTextChange(e.target.value)}
      style={{ maxWidth: 400 }}
    />
  </div>
);

export default UserSearchBar; 