// WhatsApp service - placeholder for final implementation
// All previous connection/API logic has been removed for clean slate

const whatsappService = {
  isConfigured(): boolean {
    return !!(
      process.env.WHATSAPP_ACCESS_TOKEN &&
      process.env.WHATSAPP_PHONE_NUMBER_ID &&
      process.env.WHATSAPP_BUSINESS_ACCOUNT_ID
    );
  },

  getConfig() {
    return {
      accessToken: process.env.WHATSAPP_ACCESS_TOKEN || '',
      phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
      businessAccountId: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID || '',
    };
  }
};

export { whatsappService };