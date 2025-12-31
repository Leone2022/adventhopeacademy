import { NextRequest, NextResponse } from "next/server"
import { getSchoolBySubdomain, getSchoolByDomain } from "@/lib/multi-tenant"

/**
 * Extract tenant (school) from request
 * Supports both subdomain and custom domain routing
 */
export async function getTenantFromRequest(
  request: NextRequest
): Promise<{ schoolId: string | null; school: any }> {
  const hostname = request.headers.get("host") || ""
  
  // Remove port if present
  const host = hostname.split(":")[0]
  
  // Check for custom domain (e.g., adventhope.ac.zw)
  // In production, you'd check against your database of custom domains
  const customDomainMatch = host.match(/^([^\.]+\.(ac\.zw|co\.zw|org\.zw))$/)
  
  if (customDomainMatch) {
    const domain = customDomainMatch[1]
    const school = await getSchoolByDomain(domain)
    if (school) {
      return { schoolId: school.id, school }
    }
  }
  
  // Check for subdomain (e.g., adventhope.schoolsms.com)
  const subdomainMatch = host.match(/^([^\.]+)\./)
  if (subdomainMatch) {
    const subdomain = subdomainMatch[1]
    if (subdomain !== "www" && subdomain !== "app") {
      const school = await getSchoolBySubdomain(subdomain)
      if (school) {
        return { schoolId: school.id, school }
      }
    }
  }
  
  // Default: no tenant (for super admin or main app)
  return { schoolId: null, school: null }
}

