// src/components/ProtectedRoute/EnhancedProtectedRoute.tsx
import React from "react"
import { Navigate, useLocation } from "react-router-dom"

interface ProtectedRouteProps {
  isAllowed?: boolean
  redirectPath?: string
  children: React.ReactNode
}

/**
 * Component bảo vệ route hoặc component con, chỉ cho phép truy cập khi thỏa mãn điều kiện isAllowed.
 * @param children: ReactNode - Component con sẽ được render nếu có quyền truy cập.
 * @param isAllowed: boolean - Điều kiện cho phép truy cập (ví dụ: đã đăng nhập, đúng role, ...).
 * @param redirectPath: string - Đường dẫn sẽ chuyển hướng nếu không đủ quyền (mặc định: "/login").
 * @param fallback: ReactNode - Nếu không đủ quyền, sẽ hiển thị fallback này thay vì redirect (tùy chọn).
 *
 * Cách hoạt động:
 * - Nếu isAllowed = true: render children.
 * - Nếu isAllowed = false và có fallback: render fallback.
 * - Nếu isAllowed = false và không có fallback: redirect sang redirectPath.
 *
 * Ví dụ sử dụng:
 * <ProtectedRoute isAllowed={isAdmin}>
 *   <AdminPage />
 * </ProtectedRoute>
 *
 * <ProtectedRoute isAllowed={isLoggedIn} fallback={<div>Vui lòng đăng nhập!</div>}>
 *   <Profile />
 * </ProtectedRoute>
 */

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  isAllowed,
  redirectPath = "/login",
  children,
}) => {
  const location = useLocation()

  if (isAllowed === undefined) return null

  if (!isAllowed) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
