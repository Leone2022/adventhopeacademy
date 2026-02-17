/**
 * Payment Gateway Service
 * Handles integration with multiple payment providers
 */

import { PaymentGateway, PaymentGatewayStatus } from '@prisma/client';

export interface PaymentInitiationRequest {
  studentId: string;
  amount: number;
  currency?: string;
  gateway: PaymentGateway;
  returnUrl: string;
  callbackUrl: string;
  metadata?: Record<string, any>;
}

export interface PaymentInitiationResponse {
  paymentId: string;
  gatewayTransactionId: string;
  paymentUrl: string;
  expiresAt?: Date;
  status: PaymentGatewayStatus;
}

export interface PaymentCallbackData {
  gatewayTransactionId: string;
  gatewayRef: string;
  status: PaymentGatewayStatus;
  amount: number;
  currency: string;
  metadata?: Record<string, any>;
  errorMessage?: string;
}

/**
 * Abstract base class for payment gateway providers
 */
export abstract class PaymentGatewayProvider {
  abstract readonly name: PaymentGateway;

  /**
   * Initiate a payment with the gateway
   */
  abstract initiatePayment(
    request: PaymentInitiationRequest
  ): Promise<PaymentInitiationResponse>;

  /**
   * Verify payment callback/webhook
   */
  abstract verifyCallback(
    data: any,
    signature?: string
  ): Promise<PaymentCallbackData>;

  /**
   * Query payment status from gateway
   */
  abstract queryPaymentStatus(
    gatewayRef: string
  ): Promise<PaymentGatewayStatus>;

  /**
   * Cancel/void a payment
   */
  abstract cancelPayment(gatewayRef: string): Promise<boolean>;
}

/**
 * Stripe Payment Gateway
 */
export class StripePaymentGateway extends PaymentGatewayProvider {
  readonly name = PaymentGateway.STRIPE;

  async initiatePayment(
    request: PaymentInitiationRequest
  ): Promise<PaymentInitiationResponse> {
    // Check if Stripe is configured
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
    }

    try {
      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(stripeKey, {
        apiVersion: '2026-01-28.clover',
      });

      // Create Stripe Checkout Session
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: request.currency?.toLowerCase() || 'usd',
              product_data: {
                name: 'School Fees Payment',
                description: `Payment for student ${request.studentId}`,
              },
              unit_amount: Math.round(request.amount * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: request.returnUrl,
        cancel_url: request.returnUrl,
        metadata: {
          studentId: request.studentId,
          paymentId: request.metadata?.paymentId || '',
          ...request.metadata,
        },
      });

      return {
        paymentId: request.metadata?.paymentId || '',
        gatewayTransactionId: session.id,
        paymentUrl: session.url || '',
        expiresAt: new Date(session.expires_at * 1000),
        status: PaymentGatewayStatus.PENDING,
      };
    } catch (error: any) {
      throw new Error(`Stripe payment initiation failed: ${error.message}`);
    }
  }

  async verifyCallback(
    data: any,
    signature?: string
  ): Promise<PaymentCallbackData> {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeKey || !webhookSecret) {
      throw new Error('Stripe webhook verification failed: Missing configuration');
    }

    try {
      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(stripeKey, {
        apiVersion: '2026-01-28.clover',
      });

      // Verify webhook signature
      const event = stripe.webhooks.constructEvent(
        data.body,
        signature || '',
        webhookSecret
      );

      const session = event.data.object as any;

      let status: PaymentGatewayStatus;
      switch (event.type) {
        case 'checkout.session.completed':
          status = PaymentGatewayStatus.COMPLETED;
          break;
        case 'checkout.session.expired':
          status = PaymentGatewayStatus.EXPIRED;
          break;
        default:
          status = PaymentGatewayStatus.PROCESSING;
      }

      return {
        gatewayTransactionId: session.id,
        gatewayRef: session.payment_intent,
        status,
        amount: session.amount_total / 100,
        currency: session.currency.toUpperCase(),
        metadata: session.metadata,
      };
    } catch (error: any) {
      throw new Error(`Stripe webhook verification failed: ${error.message}`);
    }
  }

  async queryPaymentStatus(gatewayRef: string): Promise<PaymentGatewayStatus> {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      throw new Error('Stripe is not configured');
    }

    try {
      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(stripeKey, {
        apiVersion: '2026-01-28.clover',
      });

      const session = await stripe.checkout.sessions.retrieve(gatewayRef);

      switch (session.payment_status) {
        case 'paid':
          return PaymentGatewayStatus.COMPLETED;
        case 'unpaid':
          return PaymentGatewayStatus.PENDING;
        default:
          return PaymentGatewayStatus.PROCESSING;
      }
    } catch (error) {
      return PaymentGatewayStatus.FAILED;
    }
  }

  async cancelPayment(gatewayRef: string): Promise<boolean> {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) return false;

    try {
      const Stripe = (await import('stripe')).default;
      const stripe = new Stripe(stripeKey, {
        apiVersion: '2026-01-28.clover',
      });

      await stripe.checkout.sessions.expire(gatewayRef);
      return true;
    } catch (error) {
      return false;
    }
  }
}

/**
 * PayPal Payment Gateway
 */
export class PayPalPaymentGateway extends PaymentGatewayProvider {
  readonly name = PaymentGateway.PAYPAL;

  async initiatePayment(
    request: PaymentInitiationRequest
  ): Promise<PaymentInitiationResponse> {
    // PayPal implementation would go here
    // For now, return a placeholder
    throw new Error('PayPal gateway not yet implemented');
  }

  async verifyCallback(data: any): Promise<PaymentCallbackData> {
    throw new Error('PayPal gateway not yet implemented');
  }

  async queryPaymentStatus(gatewayRef: string): Promise<PaymentGatewayStatus> {
    throw new Error('PayPal gateway not yet implemented');
  }

  async cancelPayment(gatewayRef: string): Promise<boolean> {
    throw new Error('PayPal gateway not yet implemented');
  }
}

/**
 * Paynow Payment Gateway (Zimbabwe)
 */
export class PaynowPaymentGateway extends PaymentGatewayProvider {
  readonly name = PaymentGateway.PAYNOW;

  async initiatePayment(
    request: PaymentInitiationRequest
  ): Promise<PaymentInitiationResponse> {
    // Paynow implementation would go here
    throw new Error('Paynow gateway not yet implemented');
  }

  async verifyCallback(data: any): Promise<PaymentCallbackData> {
    throw new Error('Paynow gateway not yet implemented');
  }

  async queryPaymentStatus(gatewayRef: string): Promise<PaymentGatewayStatus> {
    throw new Error('Paynow gateway not yet implemented');
  }

  async cancelPayment(gatewayRef: string): Promise<boolean> {
    throw new Error('Paynow gateway not yet implemented');
  }
}

/**
 * Payment Gateway Factory
 */
export class PaymentGatewayFactory {
  private static providers = new Map<PaymentGateway, PaymentGatewayProvider>([
    [PaymentGateway.STRIPE, new StripePaymentGateway()],
    [PaymentGateway.PAYPAL, new PayPalPaymentGateway()],
    [PaymentGateway.PAYNOW, new PaynowPaymentGateway()],
  ]);

  static getProvider(gateway: PaymentGateway): PaymentGatewayProvider {
    const provider = this.providers.get(gateway);
    if (!provider) {
      throw new Error(`Payment gateway ${gateway} is not supported`);
    }
    return provider;
  }

  static getSupportedGateways(): PaymentGateway[] {
    return Array.from(this.providers.keys());
  }

  static isGatewaySupported(gateway: PaymentGateway): boolean {
    return this.providers.has(gateway);
  }
}
