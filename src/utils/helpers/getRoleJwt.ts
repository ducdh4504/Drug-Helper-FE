export function getRoleFromToken(token: string): string | undefined {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    return decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]
  } catch {
    return undefined
  }
}

export function getUserIdFromToken(token: string): string | undefined {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    return decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]
  } catch {
    return undefined
  }
}

export function getUserNameFromToken(token: string): string | undefined {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload))
    return decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"]
  } catch {
    return undefined
  }
}