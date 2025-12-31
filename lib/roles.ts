export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  SCHOOL_ADMIN = "SCHOOL_ADMIN",
  ACCOUNTANT = "ACCOUNTANT",
  REGISTRAR = "REGISTRAR",
  TEACHER = "TEACHER",
  HOSTEL_MANAGER = "HOSTEL_MANAGER",
  PARENT = "PARENT",
  STUDENT = "STUDENT",
}

export const roleHierarchy: Record<string, number> = {
  [UserRole.SUPER_ADMIN]: 8,
  [UserRole.SCHOOL_ADMIN]: 7,
  [UserRole.ACCOUNTANT]: 6,
  [UserRole.REGISTRAR]: 6,
  [UserRole.TEACHER]: 5,
  [UserRole.HOSTEL_MANAGER]: 5,
  [UserRole.PARENT]: 3,
  [UserRole.STUDENT]: 2,
}

export function hasPermission(userRole: string, requiredRole: string): boolean {
  const userLevel = roleHierarchy[userRole] || 0
  const requiredLevel = roleHierarchy[requiredRole] || 0
  return userLevel >= requiredLevel
}

export function canAccess(userRole: string, allowedRoles: string[]): boolean {
  return allowedRoles.includes(userRole)
}

export const roleLabels: Record<string, string> = {
  [UserRole.SUPER_ADMIN]: "Super Admin",
  [UserRole.SCHOOL_ADMIN]: "School Admin",
  [UserRole.ACCOUNTANT]: "Accountant",
  [UserRole.REGISTRAR]: "Registrar",
  [UserRole.TEACHER]: "Teacher",
  [UserRole.HOSTEL_MANAGER]: "Hostel Manager",
  [UserRole.PARENT]: "Parent",
  [UserRole.STUDENT]: "Student",
}

