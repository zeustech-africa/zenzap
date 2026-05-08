import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { leads, Lead } from '../models/Lead';

const WHATSAPP_API_VERSION = 'v18.0';
const WHATSAPP_API_URL = `https://graph.facebook.com/${WHATSAPP_API_VERSION}`;

interface WhatsAppConfig {
  accessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
}

class WhatsAppService {
  private config: WhatsAppConfig | null = null;

  initialize(config: WhatsAppConfig) {
    this.config = config;
  }

  async sendTextMessage(to: string, text: string): Promise<any> {
    if (!this.config) throw new Error('WhatsApp not configured');
    
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${this.config.phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to.replace(/[^0-9]/g, ''),
        type: 'text',
        text: { preview_url: false, body: text }
      },
      {
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  }

  async sendTemplateMessage(to: string, templateName: string, language: string = 'en', components?: any[]): Promise<any> {
    if (!this.config) throw new Error('WhatsApp not configured');
    
    const payload: any = {
      messaging_product: 'whatsapp',
      to: to.replace(/[^0-9]/g, ''),
      type: 'template',
      template: { name: templateName, language: { code: language } }
    };
    
    if (components) {
      payload.template.components = components;
    }
    
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${this.config.phoneNumberId}/messages`,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  }

  async markAsRead(messageId: string): Promise<any> {
    if (!this.config) throw new Error('WhatsApp not configured');
    
    const response = await axios.post(
      `${WHATSAPP_API_URL}/${this.config.phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        status: 'read',
        message_id: messageId
      },
      {
        headers: {
          'Authorization': `Bearer ${this.config.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  }

  async handleBookingIntent(from: string, message: string): Promise<string | null> {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('book') || lowerMessage.includes('appointment')) {
      return "I can help you book an appointment. What service would you like to book?\n\n" +
             "Reply with:\n" +
             "• HAIRCUT - for a haircut appointment\n" +
             "• COLOR - for a color treatment\n" +
             "• MASSAGE - for a massage session\n" +
             "• CONSULT - for a consultation";
    }
    
    if (lowerMessage.includes('haircut')) {
      return "Great! What day works for you?\n\n" +
             "We're open Tuesday-Saturday 9am-6pm.\n" +
             "Please reply with a date (e.g., 'tomorrow', 'Friday', or 'May 15th')";
    }
    
    if (lowerMessage.match(/\b(monday|tuesday|wednesday|thursday|friday|saturday|sunday|tomorrow|today)\b/i)) {
      return "Perfect! What time would you prefer?\n\n" +
             "Available times: 9am, 10am, 11am, 1pm, 2pm, 3pm, 4pm, 5pm\n\n" +
             "Reply with your preferred time (e.g., '2pm')";
    }
    
    if (lowerMessage.match(/\b(9am|10am|11am|1pm|2pm|3pm|4pm|5pm)\b/)) {
      return "I've created a pending appointment for you. Would you like to confirm?\n\n" +
             "Reply 'CONFIRM' to finalize your booking, or 'CANCEL' to discard.";
    }
    
    if (lowerMessage === 'confirm') {
      // Create appointment in database
      return "✅ Your appointment has been confirmed! You'll receive a reminder 24 hours before.\n\n" +
             "To reschedule, reply 'RESCHEDULE'. To cancel, reply 'CANCEL'.";
    }
    
    return null;
  }

  async getTemplates(): Promise<any[]> {
    if (!this.config) throw new Error('WhatsApp not configured');
    
    const response = await axios.get(
      `${WHATSAPP_API_URL}/${this.config.businessAccountId}/message_templates`,
      {
        headers: { 'Authorization': `Bearer ${this.config.accessToken}` }
      }
    );
    
    return response.data.data || [];
  }

  async handlePaymentIntent(from: string, message: string): Promise<string | null> {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('pay') || lowerMessage.includes('payment')) {
      // Reference customers from the Customer model
      const { customers } = require('../models/Customer');
      const customer = customers.find((c: any) => c.phone === from);
      if (!customer) {
        return "I can't process a payment until I know who you are. Please provide your name.";
      }
      
      // Generate payment link
      const paymentLink = `https://zenzap.app/pay/${customer.id}`;
      
      return `🔗 Payment link generated: ${paymentLink}\n\nClick the link to complete your payment securely via PayFast. We accept credit cards, instant EFT, and more.`;
    }
    
    return null;
  }

  async handleLeadCapture(from: string, message: string, customerName: string): Promise<string | null> {
    const lowerMessage = message.toLowerCase();
    
    // Check for interest signals
    const interestKeywords = ['interested', 'price', 'cost', 'book', 'appointment', 'quote', 'estimate'];
    const isInterested = interestKeywords.some(keyword => lowerMessage.includes(keyword));
    
    if (isInterested) {
      // Create lead
      const existingLead = leads.find(l => l.customerPhone === from);
      
      if (!existingLead) {
        const newLead: Lead = {
          id: uuidv4(),
          businessId: 'default',
          customerId: uuidv4(),
          customerName: customerName,
          customerPhone: from,
          source: 'whatsapp',
          status: 'new',
          score: 50,
          interest: this.detectInterest(lowerMessage),
          notes: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        leads.push(newLead);
        
        // Trigger welcome sequence
        await this.sendFollowUpSequence(newLead.id);
        
        return "Thank you for your interest! 🎉\n\nI've noted your interest. One of our team members will contact you within 24 hours.\n\nIn the meantime, feel free to ask any questions!";
      }
    }
    
    return null;
  }

  private detectInterest(message: string): string {
    if (message.includes('price') || message.includes('cost')) return 'Pricing Inquiry';
    if (message.includes('book') || message.includes('appointment')) return 'Booking';
    if (message.includes('product')) return 'Product Inquiry';
    return 'General Interest';
  }

  private async sendFollowUpSequence(leadId: string): Promise<void> {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;
    
    // Schedule follow-up for 2 hours later
    setTimeout(async () => {
      const message = "Hi! Just checking in. Do you have any questions I can help with?";
      await this.sendTextMessage(lead.customerPhone, message);
      
      lead.lastContactAt = new Date().toISOString();
      lead.status = 'contacted';
    }, 2 * 60 * 60 * 1000);
  }
}

export const whatsappService = new WhatsAppService();