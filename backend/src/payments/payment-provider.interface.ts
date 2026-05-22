/**
 * Payment provider adapter interface.
 * Implement for Stripe, Razorpay, or PayPal webhooks and charge flows.
 */
export interface PaymentProviderAdapter {
  readonly name: 'STRIPE' | 'RAZORPAY' | 'PAYPAL';

  createPaymentIntent(params: {
    amount: number;
    currency: string;
    orderId: string;
    customerEmail: string;
    metadata?: Record<string, string>;
  }): Promise<{ providerRef: string; clientSecret?: string }>;

  capturePayment(providerRef: string): Promise<{ status: 'COMPLETED' | 'FAILED' }>;

  refundPayment(
    providerRef: string,
    amount?: number,
  ): Promise<{ status: string; refundAmount: number }>;

  verifyWebhook(payload: Buffer, signature: string): boolean;
}
