import crypto from 'crypto';

interface PayFastConfig {
  merchantId: string;
  merchantKey: string;
  passphrase?: string;
  testMode: boolean;
}

interface PaymentRequest {
  amount: number;
  item_name: string;
  item_description?: string;
  custom_str1?: string;
  custom_str2?: string;
  email_address?: string;
  name_first?: string;
  name_last?: string;
}

class PayFastService {
  private config: PayFastConfig = {
    merchantId: process.env.PAYFAST_MERCHANT_ID || '10000100',
    merchantKey: process.env.PAYFAST_MERCHANT_KEY || '46f0cd694581a',
    testMode: true,
    passphrase: process.env.PAYFAST_PASSPHRASE
  };

  private getPayfastUrl(): string {
    return this.config.testMode 
      ? 'https://sandbox.payfast.co.za/eng/process'
      : 'https://www.payfast.co.za/eng/process';
  }

  generateSignature(data: Record<string, string>): string {
    let pfOutput = '';
    for (const key in data) {
      if (data.hasOwnProperty(key) && data[key] !== '') {
        pfOutput += `${key}=${encodeURIComponent(data[key].trim())}&`;
      }
    }
    
    pfOutput = pfOutput.slice(0, -1);
    
    if (this.config.passphrase) {
      pfOutput += `&passphrase=${encodeURIComponent(this.config.passphrase)}`;
    }
    
    return crypto.createHash('md5').update(pfOutput).digest('hex');
  }

  createPaymentRequest(payment: PaymentRequest, returnUrl: string, cancelUrl: string): { url: string; formData: Record<string, string> } {
    const data: Record<string, string> = {
      merchant_id: this.config.merchantId,
      merchant_key: this.config.merchantKey,
      return_url: returnUrl,
      cancel_url: cancelUrl,
      notify_url: `${process.env.APP_URL || 'http://localhost:5001'}/api/payments/notify`,
      amount: payment.amount.toFixed(2),
      item_name: payment.item_name,
      item_description: payment.item_description || '',
      email_address: payment.email_address || '',
      name_first: payment.name_first || '',
      name_last: payment.name_last || '',
      custom_str1: payment.custom_str1 || '',
      custom_str2: payment.custom_str2 || ''
    };

    const signature = this.generateSignature(data);
    data['signature'] = signature;

    return {
      url: this.getPayfastUrl(),
      formData: data
    };
  }

  verifyPayment(data: any): boolean {
    const receivedSignature = data['pf_signature'];
    if (!receivedSignature) return false;
    
    const { pf_signature, ...dataToSign } = data;
    
    const calculatedSignature = this.generateSignature(dataToSign);
    
    return calculatedSignature === receivedSignature;
  }

  getSubscriptionPlans() {
    return {
      starter: { name: 'Starter Plan', price: 299, monthly: true, messages: 5000, agents: 3 },
      pro: { name: 'Pro Plan', price: 599, monthly: true, messages: 25000, agents: 10 },
      business: { name: 'Business Plan', price: 999, monthly: true, messages: 100000, agents: 'Unlimited' },
      yearly_starter: { name: 'Starter Plan (Yearly)', price: 2990, yearly: true, messages: 5000, agents: 3, discount: '2 months free' },
      yearly_pro: { name: 'Pro Plan (Yearly)', price: 5990, yearly: true, messages: 25000, agents: 10, discount: '2 months free' }
    };
  }
}

export const payfastService = new PayFastService();