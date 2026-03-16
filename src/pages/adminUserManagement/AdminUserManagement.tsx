import React, { useState, useEffect } from "react"
import { Button, message, Card, Typography, Form } from "antd"
import { PlusOutlined } from "@ant-design/icons"
import dayjs from "dayjs"
import type { Users } from "../../types/interfaces/User"
import "./AdminUserManagement.scss"
import { getAllUsers } from "../../services/userAPI"
import UserSearchBar from '../../components/AdminManager/UserSearchBar/UserSearchBar';
import UserTable from '../../components/AdminManager/UserTable/UserTable';
import UserEditModal from '../../components/AdminManager/UserEditModal/UserEditModal';
import UserFilterBar from '../../components/AdminManager/UserFilterBar/UserFilterBar';

const { Title, Text } = Typography

const roleMap: Record<number, string> = {
  4: "Admin",
  1: "Consultant",
  2: "Staff",
  3: "Manager",
  0: "Member",
};

const getRoleColor = (role: number) => {
  switch (role) {
    case 4: return "red";
    case 1: return "orange";
    case 2: return "blue";
    case 3: return "purple";
    case 0: return "green";
    default: return "default";
  }
};

const AdminUserManagement: React.FC = () => {
  const [users, setUsers] = useState<Users[]>([])
  const [loading, setLoading] = useState(false)
  const [modalVisible, setModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState<Users | null>(null)
  const [searchText, setSearchText] = useState("")
  const [form] = Form.useForm()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [filterRole, setFilterRole] = useState<number | undefined>(undefined);
  const [filterStatus, setFilterStatus] = useState<number | undefined>(undefined);

  useEffect(() => { fetchUsers() }, [])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await getAllUsers()
      setUsers(res.data)
    } catch (error) {
      message.error("Failed to fetch users")
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingUser(null)
    form.resetFields()
    setAvatarUrl(null) // <-- Thêm dòng này để reset avatar
    form.setFieldsValue({ role: 0, status: 0 });
    setModalVisible(true)
  }

  const handleEdit = (user: Users) => {
    setEditingUser(user)
    setAvatarUrl(user.imgUrl);
    form.setFieldsValue({
      userName: user.userName,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth ? dayjs(user.dateOfBirth, ["YYYY-MM-DD", "DD/MM/YYYY"]) : null,
      address: user.address,
      status: user.status,
      // Không set password khi edit để bảo mật
    })
    setModalVisible(true)
  }

  const handleSubmit = async (values: any) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      if (editingUser) {
        setUsers(users.map(user =>
          user.userID === editingUser.userID
            ? {
              ...user,
              userName: values.userName,
              email: values.email,
              fullName: values.fullName,
              role: values.role,
              phone: values.phone || null,
              dateOfBirth: values.dateOfBirth ? dayjs(values.dateOfBirth).format('YYYY-MM-DD') : null,
              address: values.address || null,
              status: values.status,
            }
            : user
        ))
        message.success("User updated successfully")
      } else {
        const newUser: Users = {
          userID: Date.now().toString(),
          userName: values.userName,
          password: values.password,
          email: values.email,
          imgUrl: avatarUrl,
          fullName: values.fullName,
          dateOfBirth: values.dateOfBirth ? dayjs(values.dateOfBirth).format('YYYY-MM-DD') : null,
          address: values.address || null,
          phone: values.phone || null,
          status: values.status,
          role: values.role,
        }
        setUsers([...users, newUser])
        message.success("User created successfully")
      }
      setModalVisible(false)
      setEditingUser(null)
      form.resetFields()
    } catch (error) {
      message.error("Failed to save user")
    }
  }

  const filteredUsers = users.filter(user =>
    (filterRole === undefined || Number(user.role) === filterRole) &&
    (filterStatus === undefined || user.status === filterStatus) &&
    (
      user.userName.toLowerCase().includes(searchText.toLowerCase()) ||
      user.email.toLowerCase().includes(searchText.toLowerCase()) ||
      (user.fullName && user.fullName.toLowerCase().includes(searchText.toLowerCase()))
    )
  )

  return (
    <div className="admin-user-management">
      <Card>
        <div className="page-header">
          <div className="header-left">
            <Title level={2}>User Management</Title>
            <Text type="secondary">
              Manage system users, roles, and permissions
            </Text>
          </div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
          >
            Add User
          </Button>
        </div>
        <UserSearchBar searchText={searchText} onSearchTextChange={setSearchText} />
        <UserFilterBar
          roleMap={roleMap}
          roleValue={filterRole}
          statusValue={filterStatus}
          onRoleChange={setFilterRole}
          onStatusChange={setFilterStatus}
          getRoleColor={getRoleColor}
        />
        <UserTable
          users={filteredUsers}
          loading={loading}
          onEdit={handleEdit}
          getRoleColor={getRoleColor}
          roleMap={roleMap}
        />
      </Card>
      <UserEditModal
        visible={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onSubmit={handleSubmit}
        editingUser={editingUser}
        avatarUrl={avatarUrl}
        setAvatarUrl={setAvatarUrl}
        form={form}
        roleMap={roleMap}
        getRoleColor={getRoleColor}
        onSuccess={fetchUsers}
      />
    </div>
  )
}

export default AdminUserManagement 