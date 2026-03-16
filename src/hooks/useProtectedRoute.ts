// src/hooks/useProtectedRoute.ts
import { useSelector } from 'react-redux'
import type { RootState } from '../redux/store'
import { UserRole } from '../types/enums/UserRoleEnum'

/**
 * Custom React hook dùng để kiểm tra quyền truy cập (role-based) cho các route hoặc component.
 * 
 * Sử dụng dữ liệu từ Redux store (state.auth) để xác định user hiện tại và role của họ.
 * 
 * Trả về:
 * @returns isLoggedIn: boolean - User đã đăng nhập hay chưa
 * @returns isAdmin: boolean - User có phải ADMIN không
 * @returns isManager: boolean - User có phải MANAGER không
 * @returns isStaff: boolean - User có phải STAFF không
 * @returns isConsultant: boolean - User có phải CONSULTANT không
 * @returns isAdminOrManager: boolean - User có phải ADMIN hoặc MANAGER không
 * @returns checkPermission: function - Kiểm tra user hiện tại có thuộc 1 hoặc nhiều role truyền vào không
 */

export const useProtectedRoute = () => {
  const { isLoggedIn } = useSelector((state: RootState) => state.auth)
  const role = useSelector((state: RootState) => state.auth.role) as UserRole | undefined

  const checkPermission = (requiredRoles: UserRole[] | UserRole) => {
    if (!isLoggedIn || !role) return undefined 
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles]
    return roles.includes(role)
  }

  return {
    isLoggedIn,
    isAdmin: checkPermission([UserRole.ADMIN]),
    isManager: checkPermission([UserRole.MANAGER]),
    isStaff: checkPermission([UserRole.STAFF]),
    isConsultant: checkPermission([UserRole.CONSULTANT]),
    isAdminOrManager: checkPermission([UserRole.ADMIN, UserRole.MANAGER]),
    checkPermission
  }
}

