import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// GET /api/hostels - Get all hostels with students
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId') || session.user.schoolId;

    if (!schoolId) {
      return NextResponse.json(
        { error: 'School context required' },
        { status: 400 }
      );
    }

    const hostels = await prisma.hostel.findMany({
      where: {
        schoolId,
        isActive: true,
      },
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
                            middleName: true,
                            studentNumber: true,
                            gender: true,
                            currentClass: {
                              select: {
                                id: true,
                                name: true,
                              },
                            },
                            photo: true,
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
        manager: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            employeeNumber: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    // Calculate statistics
    const hostelsWithStats = hostels.map(hostel => {
      const totalRooms = hostel.blocks.reduce((sum, block) => sum + block.rooms.length, 0);
      const totalCapacity = hostel.blocks.reduce(
        (sum, block) => sum + block.rooms.reduce((roomSum, room) => roomSum + room.capacity, 0),
        0
      );
      const totalOccupied = hostel.blocks.reduce(
        (sum, block) => sum + block.rooms.reduce(
          (roomSum, room) => roomSum + room.beds.filter(bed => bed.allocation).length,
          0
        ),
        0
      );

      return {
        ...hostel,
        stats: {
          totalRooms,
          totalCapacity,
          totalOccupied,
          available: totalCapacity - totalOccupied,
          occupancyRate: totalCapacity > 0 ? (totalOccupied / totalCapacity) * 100 : 0,
        },
      };
    });

    return NextResponse.json({ hostels: hostelsWithStats });
  } catch (error) {
    console.error('Error fetching hostels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hostels' },
      { status: 500 }
    );
  }
}

