'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CreditCard, Loader2, DollarSign, User, AlertCircle } from 'lucide-react';

interface Child {
  id: string;
  studentNumber: string;
  firstName: string;
  lastName: string;
  className: string;
  balance: number;
  relationship: string;
}

interface PaymentPortalClientProps {
  children: Child[];
  availableGateways: string[];
  parentName: string;
}

export default function PaymentPortalClient({
  children,
  availableGateways,
  parentName,
}: PaymentPortalClientProps) {
  const router = useRouter();
  const [selectedChild, setSelectedChild] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [gateway, setGateway] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedChildData = children.find((c) => c.id === selectedChild);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!selectedChild) {
      setError('Please select a student');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!gateway) {
      setError('Please select a payment method');
      return;
    }

    const amountNum = parseFloat(amount);
    if (selectedChildData && amountNum > Math.abs(selectedChildData.balance)) {
      const confirm = window.confirm(
        `The amount ($${amountNum}) is greater than the outstanding balance ($${Math.abs(selectedChildData.balance)}). Do you want to continue?`
      );
      if (!confirm) return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/payments/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: selectedChild,
          amount: amountNum,
          gateway,
          currency: 'USD',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initiate payment');
      }

      // Redirect to payment gateway
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else {
        setError('Payment URL not received from gateway');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to initiate payment');
      setLoading(false);
    }
  };

  const handleQuickPay = (child: Child) => {
    setSelectedChild(child.id);
    if (child.balance < 0) {
      setAmount(Math.abs(Number(child.balance)).toFixed(2));
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Payment Form */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Details
            </CardTitle>
            <CardDescription>
              Make a secure online payment for school fees
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Student Selection */}
              <div className="space-y-2">
                <Label htmlFor="student">Select Student *</Label>
                <Select value={selectedChild} onValueChange={setSelectedChild}>
                  <SelectTrigger id="student">
                    <SelectValue placeholder="Choose a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {children.map((child) => (
                      <SelectItem key={child.id} value={child.id}>
                        {child.firstName} {child.lastName} ({child.studentNumber}) -{' '}
                        {child.className}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (USD) *</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
                {selectedChildData && selectedChildData.balance < 0 && (
                  <p className="text-sm text-muted-foreground">
                    Outstanding balance: ${Math.abs(Number(selectedChildData.balance)).toFixed(2)}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="ml-2 h-auto p-0"
                      onClick={() => setAmount(Math.abs(Number(selectedChildData.balance)).toFixed(2))}
                    >
                      Pay full balance
                    </Button>
                  </p>
                )}
              </div>

              {/* Payment Gateway */}
              <div className="space-y-2">
                <Label htmlFor="gateway">Payment Method *</Label>
                <Select value={gateway} onValueChange={setGateway}>
                  <SelectTrigger id="gateway">
                    <SelectValue placeholder="Choose payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableGateways.length === 0 && (
                      <SelectItem value="none" disabled>
                        No payment methods available
                      </SelectItem>
                    )}
                    {availableGateways.includes('STRIPE') && (
                      <SelectItem value="STRIPE">
                        Credit/Debit Card (Stripe)
                      </SelectItem>
                    )}
                    {availableGateways.includes('PAYPAL') && (
                      <SelectItem value="PAYPAL">PayPal</SelectItem>
                    )}
                    {availableGateways.includes('PAYNOW') && (
                      <SelectItem value="PAYNOW">
                        Paynow (EcoCash, OneMoney)
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {availableGateways.length === 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      No payment gateways are configured. Please contact the school
                      administrator or make a manual payment.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  disabled={loading || availableGateways.length === 0}
                  className="flex-1"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="mr-2 h-4 w-4" />
                      Proceed to Payment
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/parent/finances')}
                >
                  Cancel
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                * All transactions are secure and encrypted. You will be redirected to
                the payment gateway to complete your payment.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Quick Pay Sidebar */}
      <div className="space-y-6">
        {/* Payer Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="h-4 w-4" />
              Paying As
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{parentName}</p>
          </CardContent>
        </Card>

        {/* Quick Pay for Each Child */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Pay</CardTitle>
            <CardDescription>Pay outstanding balance quickly</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {children.map((child) => (
              <div
                key={child.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {child.firstName} {child.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">{child.className}</p>
                  <p className="mt-1 text-sm font-semibold">
                    {child.balance < 0 ? (
                      <span className="text-red-600">
                        -${Math.abs(Number(child.balance)).toFixed(2)}
                      </span>
                    ) : child.balance > 0 ? (
                      <span className="text-green-600">
                        +${Number(child.balance).toFixed(2)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Paid Up</span>
                    )}
                  </p>
                </div>
                {child.balance < 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleQuickPay(child)}
                    disabled={loading}
                  >
                    Pay
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Security Notice */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="text-green-600">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-green-900 text-sm">
                  Secure Payment
                </h4>
                <p className="mt-1 text-xs text-green-700">
                  All payments are encrypted and processed securely through our
                  trusted payment partners.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
