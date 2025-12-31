import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/hostels/rooms - Get available rooms for allocation
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const gender = searchParams.get('gender'); // MALE, FEMALE
    const schoolId = searchParams.get('schoolId') || session.user.schoolId;

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School context required' },
        { status: 400 }
      );
    }

    // Get hostels matching gender
    const where: any = {
      schoolId,
      isActive: true,
    };

    if (gender) {
      where.gender = gender;
    }

    const hostels = await prisma.hostel.findMany({
      where,
      include: {
        blocks: {
          include: {
            rooms: {
              include: {
                beds: {
                  include: {
                    allocation: {
                      where: {
                        isActive: true,
                      },
                      include: {
                        student: {
                          select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            studentNumber: true,
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    // Format rooms with bed availability info
    const rooms = hostels.flatMap(hostel =>
      hostel.blocks.flatMap(block =>
        block.rooms.flatMap(room =>
          room.beds.map(bed => ({
            id: bed.id,
            bedId: bed.id,
            bedNumber: bed.bedNumber,
            roomId: room.id,
            roomNumber: room.roomNumber,
            hostelId: hostel.id,
            hostelName: hostel.name,
            blockId: block.id,
            blockName: block.name,
            capacity: room.capacity,
            isAvailable: bed.isAvailable && !bed.allocation,
            isOccupied: !!bed.allocation,
            currentStudent: bed.allocation ? {
              id: bed.allocation.student.id,
              name: `${bed.allocation.student.firstName} ${bed.allocation.student.lastName}`,
              studentNumber: bed.allocation.student.studentNumber,
            } : null,
            displayName: `${hostel.name} - ${block.name} - Room ${room.roomNumber} - Bed ${bed.bedNumber}`,
          }))
        )
      )
    );

    return NextResponse.json({ rooms, hostels });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    );
  }
}

