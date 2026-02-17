'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  Download,
  ArrowLeft,
} from 'lucide-react';

interface PaymentStatusClientProps {
  paymentId: string;
  initialStatus?: string;
}

export default function PaymentStatusClient({
  paymentId,
  initialStatus,
}: PaymentStatusClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPaymentStatus();
    // Poll for status updates every 5 seconds for up to 2 minutes
    const interval = setInterval(fetchPaymentStatus, 5000);
    const timeout = setTimeout(() => clearInterval(interval), 120000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [paymentId]);

  const fetchPaymentStatus = async () => {
    try {
      const response = await fetch(`/api/payments/status/${paymentId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch payment status');
      }

      setPayment(data);
      setLoading(false);

      // Stop polling if payment is completed or failed
      if (
        data.gateway?.status === 'COMPLETED' ||
        data.gateway?.status === 'FAILED' ||
        data.payment?.status === 'Verified' ||
        data.payment?.status === 'Rejected'
      ) {
        return true; // Signal to stop polling
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  const getStatusInfo = () => {
    if (!payment) return null;

    const gatewayStatus = payment.gateway?.status;
    const paymentStatus = payment.payment?.status;

    if (gatewayStatus === 'COMPLETED' || paymentStatus === 'Verified') {
      return {
        icon: <CheckCircle className="h-12 w-12 text-green-600" />,
        title: 'Payment Successful',
        description: 'Your payment has been processed successfully.',
        variant: 'success' as const,
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
      };
    }

    if (gatewayStatus === 'FAILED' || paymentStatus === 'Rejected') {
      return {
        icon: <XCircle className="h-12 w-12 text-red-600" />,
        title: 'Payment Failed',
        description:
          payment.gateway?.errorMessage ||
          payment.payment?.rejectionReason ||
          'The payment could not be processed.',
        variant: 'destructive' as const,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
      };
    }

    if (gatewayStatus === 'CANCELLED') {
      return {
        icon: <XCircle className="h-12 w-12 text-orange-600" />,
        title: 'Payment Cancelled',
        description: 'The payment was cancelled.',
        variant: 'default' as const,
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200',
      };
    }

    if (gatewayStatus === 'EXPIRED') {
      return {
        icon: <Clock className="h-12 w-12 text-gray-600" />,
        title: 'Payment Expired',
        description: 'The payment session has expired. Please try again.',
        variant: 'default' as const,
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
      };
    }

    return {
      icon: <Loader2 className="h-12 w-12 animate-spin text-blue-600" />,
      title: 'Processing Payment',
      description: 'Please wait while we confirm your payment...',
      variant: 'default' as const,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    };
  };

  if (loading && !payment) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading payment status...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const statusInfo = getStatusInfo();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Status Card */}
      <Card className={`${statusInfo?.borderColor}`}>
        <CardContent className={`pt-8 ${statusInfo?.bgColor}`}>
          <div className="text-center">
            <div className="mx-auto mb-4 flex justify-center">{statusInfo?.icon}</div>
            <h2 className="text-2xl font-bold">{statusInfo?.title}</h2>
            <p className="mt-2 text-muted-foreground">{statusInfo?.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Payment Details */}
      {payment && (
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
            <CardDescription>Transaction information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Receipt Number</p>
                <p className="text-lg font-semibold">{payment.payment.receiptNumber}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Amount</p>
                <p className="text-lg font-semibold">
                  ${payment.payment.amount.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Student</p>
                <p className="text-base">
                  {payment.student.name}
                  <br />
                  <span className="text-sm text-muted-foreground">
                    {payment.student.studentNumber}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                <p className="text-base">{payment.payment.paymentMethod}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Date</p>
                <p className="text-base">
                  {new Date(payment.payment.createdAt).toLocaleDateString()}
                </p>
              </div>
              {payment.payment.verifiedAt && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Verified At
                  </p>
                  <p className="text-base">
                    {new Date(payment.payment.verifiedAt).toLocaleString()}
                  </p>
                </div>
              )}
            </div>

            {payment.gateway && (
              <div className="mt-4 rounded-lg border bg-muted/50 p-4">
                <p className="text-sm font-medium">Gateway Information</p>
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  <p>Gateway: {payment.gateway.gateway}</p>
                  <p>Status: {payment.gateway.status}</p>
                  {payment.gateway.gatewayRef && (
                    <p className="font-mono text-xs">Ref: {payment.gateway.gatewayRef}</p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => router.push('/parent/finances')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Finances
        </Button>

        {payment?.payment?.status === 'Verified' && (
          <Button
            className="flex-1"
            onClick={() => window.print()}
          >
            <Download className="mr-2 h-4 w-4" />
            Download Receipt
          </Button>
        )}

        {(payment?.gateway?.status === 'FAILED' ||
          payment?.gateway?.status === 'EXPIRED' ||
          payment?.gateway?.status === 'CANCELLED') && (
          <Button
            className="flex-1"
            onClick={() => router.push('/parent/payments')}
          >
            Try Again
          </Button>
        )}
      </div>

      {/* Help Text */}
      {payment?.gateway?.status === 'PROCESSING' && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription>
            This page will automatically update when your payment is confirmed. This
            usually takes a few moments but can take up to 5 minutes.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
