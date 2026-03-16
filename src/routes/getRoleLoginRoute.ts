import { UserRole } from "../types/enums/UserRoleEnum"

export function getRoleLoginRoute(role?: string) {
  switch (role) {
    case UserRole.ADMIN:
      return "/admin"
    case UserRole.CONSULTANT:
      return "/consultant"
    case UserRole.MANAGER:
      return "/staff"
    case UserRole.STAFF:
      return "/staff"
    default:
      return "/"
  }
}