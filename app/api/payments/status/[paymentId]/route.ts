import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/payments/status/[paymentId]
 * Check payment status
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paymentId } = params;

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        transaction: {
          include: {
            studentAccount: {
              include: {
                student: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },
        gatewayTransaction: true,
        parent: true,
      },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Verify access
    const userRole = session.user.role;
    const student = payment.transaction.studentAccount.student;

    if (userRole === 'PARENT') {
      const parentProfile = await prisma.parent.findUnique({
        where: { userId: session.user.id },
        include: {
          students: {
            where: { studentId: student.id },
          },
        },
      });

      if (!parentProfile || parentProfile.students.length === 0) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    } else if (userRole === 'STUDENT') {
      if (student.userId !== session.user.id) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({
      payment: {
        id: payment.id,
        receiptNumber: payment.receiptNumber,
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        status: payment.status,
        createdAt: payment.createdAt,
        verifiedAt: payment.verifiedAt,
      },
      gateway: payment.gatewayTransaction
        ? {
            gateway: payment.gatewayTransaction.gateway,
            status: payment.gatewayTransaction.status,
            gatewayRef: payment.gatewayTransaction.gatewayRef,
            completedAt: payment.gatewayTransaction.completedAt,
            errorMessage: payment.gatewayTransaction.errorMessage,
          }
        : null,
      student: {
        id: student.id,
        studentNumber: student.studentNumber,
        name: `${student.firstName} ${student.lastName}`,
      },
    });
  } catch (error: any) {
    console.error('Payment status check error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment status' },
      { status: 500 }
    );
  }
}
