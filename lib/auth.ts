import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"
import { isAccountLocked, getRemainingLockoutTime } from "./security"
import { sendAccountLockedEmail } from "./email"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        identifier: { label: "Email/Phone/Student Number", type: "text" },
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.password) {
          throw new Error("invalid_credentials")
        }

        let user = null

        // Handle different login types based on role
        if (credentials.role === "student") {
          // Student login with registration number
          if (!credentials.identifier) {
            throw new Error("invalid_credentials")
          }

          const student = await prisma.student.findUnique({
            where: { studentNumber: credentials.identifier },
            include: {
              user: {
                include: {
                  school: true,
                },
              },
              school: true,
            },
          })

          if (!student || !student.user) {
            throw new Error("invalid_credentials")
          }

          user = student.user

          // Check if student is active
          if (student.status !== "ACTIVE") {
            throw new Error("inactive_account")
          }
        } else if (credentials.role === "parent") {
          // Parent login with email or phone
          if (!credentials.identifier) {
            throw new Error("invalid_credentials")
          }

          // Try to find by email first
          const isEmail = credentials.identifier.includes("@")

          if (isEmail) {
            user = await prisma.user.findUnique({
              where: { email: credentials.identifier },
              include: {
                school: true,
                parentProfile: {
                  include: {
                    students: {
                      include: {
                        student: {
                          select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            studentNumber: true,
                            status: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            })
          } else {
            // Try to find by phone
            user = await prisma.user.findFirst({
              where: {
                phone: credentials.identifier,
                role: "PARENT",
              },
              include: {
                school: true,
                parentProfile: {
                  include: {
                    students: {
                      include: {
                        student: {
                          select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            studentNumber: true,
                            status: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            })
          }

          // Verify user is a parent
          if (user && user.role !== "PARENT") {
            throw new Error("invalid_credentials")
          }

          if (user?.status === "PENDING") {
            throw new Error("pending_approval")
          }

          // Check if parent has at least one approved child
          const hasApprovedChild = !!user?.parentProfile?.students?.some(
            (ps) => ps.student.status === "ACTIVE"
          )
          if (!hasApprovedChild) {
            throw new Error("no_linked_student")
          }
        } else {
          // Admin/Staff login with email
          const identifier = credentials.email || credentials.identifier
          if (!identifier) {
            throw new Error("invalid_credentials")
          }

          user = await prisma.user.findUnique({
            where: { email: identifier },
            include: {
              school: true,
              parentProfile: true,
              studentProfile: true,
              staffProfile: true,
            },
          })

          if (user && ["PARENT", "STUDENT"].includes(user.role)) {
            throw new Error("use_portal_login")
          }
        }

        if (!user || !user.isActive) {
          throw new Error("invalid_credentials")
        }

        if (user.status !== "ACTIVE") {
          throw new Error("inactive_account")
        }

        // Check if account is locked
        if (
          user.accountLockedUntil &&
          new Date() < user.accountLockedUntil
        ) {
          const remainingTime = Math.ceil(
            (user.accountLockedUntil.getTime() - new Date().getTime()) / 60000
          )
          throw new Error(`account_locked:${remainingTime}`)
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          // Increment failed login attempts
          const newAttempts = (user.failedLoginAttempts || 0) + 1
          const updateData: any = {
            failedLoginAttempts: newAttempts,
            lastFailedLoginAt: new Date(),
          }

          // Lock account if threshold reached
          if (newAttempts >= 5) {
            updateData.accountLockedUntil = new Date(
              Date.now() + 15 * 60 * 1000
            ) // 15 minutes

            // Send lockout email
            try {
              await sendAccountLockedEmail(user.email, user.name, 15)
            } catch (err) {
              console.error("Failed to send lockout email:", err)
            }
          }

          await prisma.user.update({
            where: { id: user.id },
            data: updateData,
          })

          throw new Error("invalid_credentials")
        }

        // Password correct - reset failed attempts and update last login
          // Update last login and reset failed attempts
          // For admins, also clear forced password change so they can proceed directly
          const updateData: any = {
            lastLogin: new Date(),
            failedLoginAttempts: 0,
            lastFailedLoginAt: null,
            accountLockedUntil: null,
          }

          if (user.role === "SUPER_ADMIN" || user.role === "SCHOOL_ADMIN") {
            updateData.mustChangePassword = false
          }

          await prisma.user.update({
            where: { id: user.id },
            data: updateData,
          })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          schoolId: user.schoolId,
          // Admins should bypass forced password change
          mustChangePassword: (user.role === "SUPER_ADMIN" || user.role === "SCHOOL_ADMIN") ? false : (user.mustChangePassword || false),
          school: user.school ? {
            id: user.school.id,
            name: user.school.name,
            subdomain: user.school.subdomain,
          } : null,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.schoolId = user.schoolId
        token.school = user.school
        token.mustChangePassword = user.mustChangePassword
      } else if (token.id && trigger === "update") {
        // Only refresh from database on explicit update trigger
        try {
          const dbUser = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: {
              id: true,
              role: true,
              schoolId: true,
              mustChangePassword: true,
              school: true,
            },
          })
          
          if (dbUser) {
            token.mustChangePassword = dbUser.mustChangePassword
          }
        } catch (error) {
          console.error("Error refreshing token:", error)
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.schoolId = token.schoolId as string | null
        session.user.school = token.school as any
        session.user.mustChangePassword = token.mustChangePassword as boolean
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}

