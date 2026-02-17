import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import PaymentPortalClient from './client';

export const metadata = {
  title: 'Make Payment | Parent Portal',
  description: 'Make online payments for school fees',
};

export default async function ParentPaymentPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'PARENT') {
    redirect('/auth/signin');
  }

  // Get parent profile with children
  const parent = await prisma.parent.findUnique({
    where: { userId: session.user.id },
    include: {
      students: {
        include: {
          student: {
            include: {
              currentClass: true,
              account: true,
              school: true,
            },
          },
        },
      },
    },
  });

  if (!parent || parent.students.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-800">No Students Found</h2>
          <p className="mt-2 text-red-600">
            You don't have any students linked to your account.
          </p>
        </div>
      </div>
    );
  }

  // Format children data
  const children = parent.students.map((ps) => ({
    id: ps.student.id,
    studentNumber: ps.student.studentNumber,
    firstName: ps.student.firstName,
    lastName: ps.student.lastName,
    className: ps.student.currentClass?.name || 'Not assigned',
    balance: Number(ps.student.account?.balance || 0),
    relationship: ps.relationship,
  }));

  // Get available payment gateways
  const gateways = await fetch(`${process.env.NEXTAUTH_URL}/api/payments/initiate`, {
    cache: 'no-store',
  }).then(res => res.json()).catch(() => ({ configured: [] }));

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Make Payment</h1>
        <p className="mt-2 text-muted-foreground">
          Pay school fees securely online
        </p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <PaymentPortalClient 
          children={children}
          availableGateways={gateways.configured || []}
          parentName={`${parent.firstName} ${parent.lastName}`}
        />
      </Suspense>
    </div>
  );
}
