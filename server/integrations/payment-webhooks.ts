import crypto from 'crypto';
import axios, { AxiosInstance } from 'axios';

// ============ Stripe ============
export interface StripeConfig {
  secretKey: string;
  publishableKey: string;
  webhookSecret: string;
}

export interface StripeWebhookEvent {
  id: string;
  type: string;
  created: number;
  data: {
    object: Record<string, any>;
    previousAttributes?: Record<string, any>;
  };
  livemode: boolean;
  request: { id: string | null; idempotencyKey: string | null };
  account: string;
}

export interface StripePayment {
  id: string;
  object: string;
  amount: number;
  amount_captured: number;
  amount_refunded: number;
  application: string | null;
  application_fee: string | null;
  application_fee_amount: number | null;
  balance_transaction: string;
  billing_details: {
    address: {
      city: string | null;
      country: string | null;
      line1: string | null;
      line2: string | null;
      postal_code: string | null;
      state: string | null;
    };
    email: string | null;
    name: string | null;
    phone: string | null;
  };
  captured: boolean;
  charges: { object: string; data: any[]; has_more: boolean; total_count: number; url: string };
  client_secret: string;
  confirmation_method: string;
  created: number;
  currency: string;
  customer: string | null;
  description: string | null;
  last_payment_error: any;
  livemode: boolean;
  metadata: Record<string, string>;
  next_action: any;
  on_behalf_of: string | null;
  payment_method: string;
  payment_method_types: string[];
  receipt_email: string | null;
  review: string | null;
  setup_future_usage: string | null;
  shipping: any;
  source: any;
  statement_descriptor: string | null;
  statement_descriptor_suffix: string | null;
  status: string;
  transfer_data: any;
  transfer_group: string | null;
}

export class StripeWebhookHandler {
  private config: StripeConfig;
  private client: AxiosInstance;

  constructor(config: StripeConfig) {
    this.config = config;
    this.client = axios.create({
      baseURL: 'https://api.stripe.com/v1',
      auth: {
        username: config.secretKey,
        password: '',
      },
    });
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(
    payload: string,
    signature: string
  ): { valid: boolean; event?: StripeWebhookEvent } {
    try {
      const hash = crypto
        .createHmac('sha256', this.config.webhookSecret)
        .update(payload, 'utf8')
        .digest('hex');

      const computedSignature = `t=${Math.floor(Date.now() / 1000)},v1=${hash}`;

      // Extract timestamp and hash from signature
      const parts = signature.split(',');
      const signatureHash = parts.find((p) => p.startsWith('v1='))?.slice(3);

      if (!signatureHash || signatureHash !== hash) {
        return { valid: false };
      }

      const event = JSON.parse(payload) as StripeWebhookEvent;
      return { valid: true, event };
    } catch (error) {
      console.error('Error verifying Stripe webhook:', error);
      return { valid: false };
    }
  }

  /**
   * Handle payment intent succeeded
   */
  async handlePaymentIntentSucceeded(paymentIntentId: string): Promise<StripePayment> {
    try {
      const response = await this.client.get(`/payment_intents/${paymentIntentId}`);
      return response.data;
    } catch (error) {
      console.error('Error retrieving Stripe payment intent:', error);
      throw error;
    }
  }

  /**
   * Handle charge refunded
   */
  async handleChargeRefunded(chargeId: string) {
    try {
      const response = await this.client.get(`/charges/${chargeId}`);
      return response.data;
    } catch (error) {
      console.error('Error retrieving Stripe charge:', error);
      throw error;
    }
  }

  /**
   * Handle customer subscription updated
   */
  async handleCustomerSubscriptionUpdated(subscriptionId: string) {
    try {
      const response = await this.client.get(`/subscriptions/${subscriptionId}`);
      return response.data;
    } catch (error) {
      console.error('Error retrieving Stripe subscription:', error);
      throw error;
    }
  }

  /**
   * Process webhook event
   */
  async processWebhookEvent(event: StripeWebhookEvent): Promise<any> {
    switch (event.type) {
      case 'payment_intent.succeeded':
        return this.handlePaymentIntentSucceeded(event.data.object.id);
      case 'charge.refunded':
        return this.handleChargeRefunded(event.data.object.id);
      case 'customer.subscription.updated':
        return this.handleCustomerSubscriptionUpdated(event.data.object.id);
      case 'invoice.payment_succeeded':
        return event.data.object;
      case 'invoice.payment_failed':
        return event.data.object;
      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
        return null;
    }
  }
}

// ============ PayPal ============
export interface PayPalConfig {
  clientId: string;
  clientSecret: string;
  webhookId: string;
  environment?: 'sandbox' | 'live';
}

export interface PayPalWebhookEvent {
  id: string;
  create_time: string;
  event_type: string;
  resource_type: string;
  summary: string;
  resource: Record<string, any>;
}

export interface PayPalPayment {
  id: string;
  state: string;
  intent: string;
  payer: {
    payment_method: string;
    status: string;
    payer_info: {
      email: string;
      first_name: string;
      last_name: string;
      payer_id: string;
      phone: string;
      shipping_address: {
        recipient_name: string;
        type: string;
        line1: string;
        line2: string;
        city: string;
        state: string;
        postal_code: string;
        country_code: string;
      };
    };
  };
  transactions: Array<{
    amount: { total: string; currency: string; details: { subtotal: string; tax: string; shipping: string } };
    description: string;
    invoice_number: string;
    custom: string;
    related_resources: Array<{
      sale: {
        id: string;
        state: string;
        amount: { total: string; currency: string };
        payment_mode: string;
        create_time: string;
        update_time: string;
        protection_eligibility: string;
        protection_eligibility_type: string;
        links: Array<{ rel: string; href: string; method: string }>;
      };
    }>;
  }>;
  links: Array<{ rel: string; href: string; method: string }>;
  create_time: string;
  update_time: string;
}

export class PayPalWebhookHandler {
  private config: PayPalConfig;
  private client: AxiosInstance;
  private accessToken: string | null = null;

  constructor(config: PayPalConfig) {
    this.config = {
      environment: 'sandbox',
      ...config,
    };

    const baseURL =
      this.config.environment === 'sandbox'
        ? 'https://api.sandbox.paypal.com'
        : 'https://api.paypal.com';

    this.client = axios.create({
      baseURL,
      auth: {
        username: this.config.clientId,
        password: this.config.clientSecret,
      },
    });
  }

  /**
   * Get access token
   */
  private async getAccessToken(): Promise<string> {
    if (this.accessToken) return this.accessToken;

    try {
      const response = await this.client.post('/v1/oauth2/token', 'grant_type=client_credentials');
      this.accessToken = response.data.access_token;
      return this.accessToken;
    } catch (error) {
      console.error('Error getting PayPal access token:', error);
      throw error;
    }
  }

  /**
   * Verify webhook signature
   */
  async verifyWebhookSignature(
    transmissionId: string,
    transmissionTime: string,
    certUrl: string,
    webhookBody: string,
    webhookSignature: string
  ): Promise<boolean> {
    try {
      const token = await this.getAccessToken();

      const response = await this.client.post(
        '/v1/notifications/verify-webhook-signature',
        {
          transmission_id: transmissionId,
          transmission_time: transmissionTime,
          cert_url: certUrl,
          auth_algo: 'SHA256withRSA',
          webhook_body: webhookBody,
          webhook_id: this.config.webhookId,
          webhook_signature: webhookSignature,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data.verification_status === 'SUCCESS';
    } catch (error) {
      console.error('Error verifying PayPal webhook:', error);
      return false;
    }
  }

  /**
   * Handle payment completed
   */
  async handlePaymentCompleted(paymentId: string): Promise<PayPalPayment> {
    try {
      const token = await this.getAccessToken();

      const response = await this.client.get(`/v1/payments/payment/${paymentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return response.data;
    } catch (error) {
      console.error('Error retrieving PayPal payment:', error);
      throw error;
    }
  }

  /**
   * Process webhook event
   */
  async processWebhookEvent(event: PayPalWebhookEvent): Promise<any> {
    switch (event.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED':
        return event.resource;
      case 'PAYMENT.CAPTURE.REFUNDED':
        return event.resource;
      case 'BILLING.SUBSCRIPTION.CREATED':
        return event.resource;
      case 'BILLING.SUBSCRIPTION.UPDATED':
        return event.resource;
      case 'BILLING.SUBSCRIPTION.CANCELLED':
        return event.resource;
      default:
        console.log(`Unhandled PayPal event type: ${event.event_type}`);
        return null;
    }
  }
}
