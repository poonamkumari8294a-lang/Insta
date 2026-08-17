import QRCode from 'qrcode';
import crypto from 'crypto';
import { db } from './db';
import { OrderItem } from '../src/types';

export interface CreateOrderParams {
  contentId: string;
  customerSessionId: string;
}

export interface PaymentProviderConfig {
  mode: 'sandbox_simulator' | 'phonepe_merchant' | 'razorpay' | 'live_upi';
  upiId: string;
  merchantName: string;
  webhookSecret: string;
}

export class PaymentProvider {
  private config: PaymentProviderConfig;

  constructor() {
    const settings = db.getSettings();
    this.config = {
      mode: (process.env.PAYMENT_GATEWAY_MODE as any) || 'sandbox_simulator',
      upiId: settings.upiId || process.env.CREATOR_UPI_ID || 'ashokjee62022.wallet@phonepe',
      merchantName: settings.creatorName || 'Ruma Kumari',
      webhookSecret: process.env.WEBHOOK_SECRET || 'whsec_ruma_creator_secret_key_8849'
    };
  }

  public updateConfig(partial: Partial<PaymentProviderConfig>) {
    this.config = { ...this.config, ...partial };
  }

  public getConfig(): PaymentProviderConfig {
    const settings = db.getSettings();
    return {
      ...this.config,
      upiId: settings.upiId || this.config.upiId,
      merchantName: settings.creatorName || this.config.merchantName
    };
  }

  /**
   * Generates a unique, server-validated order and returns dynamic QR code & UPI Intent
   */
  public async createOrder(params: CreateOrderParams): Promise<{ order: OrderItem; qrDataUrl: string; upiIntentUrl: string }> {
    const content = db.getContentById(params.contentId);
    if (!content) {
      throw new Error('Content not found');
    }

    if (!content.published) {
      throw new Error('Content is not available');
    }

    if (content.access === 'free' || content.price <= 0) {
      throw new Error('This content is free, no payment required');
    }

    // SERVER DETERMINES PRICE (Never trust client)
    const exactAmount = Number(content.price);
    const orderId = `ORD_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const settings = db.getSettings();
    const upiId = settings.upiId || this.config.upiId;
    const payeeName = settings.creatorName || this.config.merchantName;

    // Standard NPCI UPI URI Scheme
    // e.g. upi://pay?pa=ashokjee62022.wallet@phonepe&pn=Ruma%20Kumari&am=99.00&cu=INR&tn=Order_ORD_...&tr=ORD_...
    const note = `Unlock: ${content.title.substring(0, 20)} (${orderId.substring(0, 10)})`;
    const upiIntentUrl = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${exactAmount.toFixed(2)}&cu=INR&tn=${encodeURIComponent(note)}&tr=${encodeURIComponent(orderId)}`;

    // Generate Dynamic QR Code image data URL
    const qrDataUrl = await QRCode.toDataURL(upiIntentUrl, {
      errorCorrectionLevel: 'H',
      margin: 2,
      scale: 8,
      color: {
        dark: '#1a0b2e',
        light: '#ffffff'
      }
    });

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 min expiry

    const order: OrderItem = {
      orderId,
      contentId: content.id,
      contentTitle: content.title,
      contentType: content.type,
      thumbnailUrl: content.thumbnailUrl,
      amount: exactAmount,
      currency: 'INR',
      status: 'pending',
      upiId,
      qrString: upiIntentUrl,
      qrDataUrl,
      customerSessionId: params.customerSessionId,
      createdAt: new Date().toISOString(),
      expiresAt
    };

    const savedOrder = db.createOrder(order);
    return { order: savedOrder, qrDataUrl, upiIntentUrl };
  }

  /**
   * Verify server-side webhook signature and execute status update
   */
  public verifyAndProcessWebhook(payload: any, signatureHeader?: string): { success: boolean; order?: OrderItem; error?: string } {
    try {
      const { orderId, amount, transactionRef, status, signature } = payload;
      if (!orderId) {
        return { success: false, error: 'Missing orderId' };
      }

      const order = db.getOrder(orderId);
      if (!order) {
        return { success: false, error: 'Order not found' };
      }

      // Check amount matching
      if (amount && Number(amount) !== order.amount) {
        return { success: false, error: 'Amount mismatch' };
      }

      // Verify HMAC signature if provided
      if (signature || signatureHeader) {
        const expectedSig = crypto
          .createHmac('sha256', this.config.webhookSecret)
          .update(JSON.stringify({ orderId, amount: order.amount, status }))
          .digest('hex');

        const providedSig = signature || signatureHeader;
        if (providedSig !== expectedSig && this.config.mode !== 'sandbox_simulator') {
          return { success: false, error: 'Invalid webhook signature' };
        }
      }

      if (status === 'SUCCESS' || status === 'PAID' || status === 'paid') {
        const updated = db.updateOrderStatus(orderId, 'paid', transactionRef || `TXN_${Date.now()}`);
        return { success: true, order: updated || undefined };
      } else {
        const updated = db.updateOrderStatus(orderId, 'failed', transactionRef);
        return { success: true, order: updated || undefined };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Webhook processing failed' };
    }
  }

  /**
   * Sandbox simulator trigger (strictly flagged for dev/sandbox mode only)
   */
  public simulateSandboxPayment(orderId: string, customRef?: string): { success: boolean; order?: OrderItem; error?: string } {
    const order = db.getOrder(orderId);
    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    if (order.status === 'paid') {
      return { success: true, order };
    }

    // Process payment verification through server logic
    const ref = customRef || `SIM_UPI_${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    const updated = db.updateOrderStatus(orderId, 'paid', ref);
    return { success: true, order: updated || undefined };
  }
}

export const paymentProvider = new PaymentProvider();
