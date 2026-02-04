import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

/**
 * GET /api/students/export
 * Fetches ALL students (not paginated) for export purposes
 * Supports filtering by curriculum, status, search, etc.
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const curriculum = searchParams.get('curriculum') || '';
    const classId = searchParams.get('classId') || '';

    // Build where clause
    const where: Prisma.StudentWhereInput = {
      schoolId: session.user.schoolId || undefined,
    };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { studentNumber: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) {
      where.status = status as any;
    }

    if (curriculum) {
      where.curriculum = curriculum as any;
    }

    if (classId) {
      where.currentClassId = classId;
    }

    // Fetch ALL matching students without pagination
    const students = await prisma.student.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        currentClass: true,
        account: true,
        parents: {
          include: {
            parent: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      students,
      total: students.length,
      curriculum: curriculum || 'ALL',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching students for export:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    );
  }
}
