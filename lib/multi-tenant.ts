import { prisma } from "./prisma"

/**
 * Get school by subdomain
 */
export async function getSchoolBySubdomain(subdomain: string) {
  return await prisma.school.findUnique({
    where: { subdomain },
  })
}

/**
 * Get school by domain
 */
export async function getSchoolByDomain(domain: string) {
  return await prisma.school.findUnique({
    where: { domain },
  })
}

/**
 * Ensure user belongs to the correct school (for multi-tenant isolation)
 */
export async function validateUserSchoolAccess(
  userId: string,
  schoolId: string | null
): Promise<boolean> {
  if (!schoolId) {
    // Super Admin can access all schools
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })
    return user?.role === "SUPER_ADMIN"
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { schoolId: true, role: true },
  })

  if (!user) return false

  // Super Admin can access all schools
  if (user.role === "SUPER_ADMIN") return true

  // Other users must belong to the school
  return user.schoolId === schoolId
}

/**
 * Add school filter to Prisma queries for multi-tenant isolation
 */
export function addSchoolFilter(schoolId: string | null, role: string) {
  // Super Admin can see all schools
  if (role === "SUPER_ADMIN") {
    return {}
  }

  // Other users can only see their school's data
  return {
    schoolId: schoolId || undefined,
  }
}

