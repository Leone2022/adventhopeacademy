import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import PaymentStatusClient from './client';

export const metadata = {
  title: 'Payment Status | Parent Portal',
  description: 'Check your payment status',
};

export default async function PaymentStatusPage({
  searchParams,
}: {
  searchParams: { paymentId?: string; status?: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  const { paymentId, status } = searchParams;

  if (!paymentId) {
    redirect('/parent/payments');
  }

  return (
    <div className="container mx-auto p-6">
      <Suspense fallback={<div>Loading payment status...</div>}>
        <PaymentStatusClient paymentId={paymentId} initialStatus={status} />
      </Suspense>
    </div>
  );
}
