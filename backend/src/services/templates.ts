interface IndustryTemplate {
  id: string;
  name: string;
  industry: string;
  icon: string;
  description: string;
  features: string[];
  autoReplies: AutoReplyRule[];
  quickReplies: string[];
  welcomeMessage: string;
  bookingEnabled: boolean;
}

interface AutoReplyRule {
  keyword: string;
  response: string;
  enabled: boolean;
}

class IndustryTemplateService {
  private templates: IndustryTemplate[] = [
    {
      id: 'salon',
      name: 'Salon & Spa',
      industry: 'beauty',
      icon: '💇',
      description: 'Perfect for hair salons, spas, nail studios, and beauty clinics',
      features: ['Appointment booking', 'Cancellation reminders', 'Customer history', 'Loyalty tracking', 'Promotional broadcasts'],
      autoReplies: [
        { keyword: 'price', response: 'Our prices start from R150 for a haircut. Would you like to see our full price list?', enabled: true },
        { keyword: 'booking', response: 'I can help you book an appointment. What date and time works for you?', enabled: true },
        { keyword: 'hours', response: 'We are open Tuesday-Saturday 9am-6pm. Closed Sundays and Mondays.', enabled: true },
        { keyword: 'location', response: 'We are located at 123 Main Street, Cape Town. Here is our location: [map link]', enabled: true }
      ],
      quickReplies: ['Book appointment', 'Price list', 'Location', 'Hours'],
      welcomeMessage: 'Welcome to our salon! ✨ How can we help you today? You can book an appointment, ask about prices, or check our hours.',
      bookingEnabled: true
    },
    {
      id: 'restaurant',
      name: 'Restaurant & Cafe',
      industry: 'food',
      icon: '🍽️',
      description: 'Ideal for restaurants, cafes, coffee shops, and food delivery',
      features: ['Table reservations', 'Menu sharing', 'Order taking', 'Delivery updates', 'Feedback collection'],
      autoReplies: [
        { keyword: 'menu', response: 'Our menu includes breakfast, lunch, and dinner options. Would you like to see our specials?', enabled: true },
        { keyword: 'reservation', response: 'I can help you make a reservation. How many people and what time?', enabled: true },
        { keyword: 'hours', response: 'We are open Monday-Sunday 8am-10pm.', enabled: true },
        { keyword: 'delivery', response: 'We offer delivery within 5km. Minimum order R100.', enabled: true }
      ],
      quickReplies: ['View menu', 'Make reservation', 'Delivery info', 'Hours'],
      welcomeMessage: 'Welcome to our restaurant! 🍕 Would you like to view our menu, make a reservation, or order delivery?',
      bookingEnabled: true
    },
    {
      id: 'realestate',
      name: 'Real Estate',
      industry: 'property',
      icon: '🏠',
      description: 'For real estate agents, property managers, and developers',
      features: ['Property inquiries', 'Viewing scheduling', 'Document sharing', 'Follow-up automation', 'Lead scoring'],
      autoReplies: [
        { keyword: 'properties', response: 'We have several properties available. Are you looking to buy or rent?', enabled: true },
        { keyword: 'viewing', response: 'I can schedule a viewing for you. What date and time works best?', enabled: true },
        { keyword: 'price', response: 'Property prices vary by location and size. Could you tell me more about what you\'re looking for?', enabled: true },
        { keyword: 'area', response: 'We have properties in Cape Town, Johannesburg, and Durban. Which area interests you?', enabled: true }
      ],
      quickReplies: ['View properties', 'Schedule viewing', 'Price range', 'Areas'],
      welcomeMessage: 'Welcome! 🏡 Looking to buy, rent, or sell property? Let me know how I can help you today.',
      bookingEnabled: true
    },
    {
      id: 'retail',
      name: 'Retail & E-commerce',
      industry: 'retail',
      icon: '🛍️',
      description: 'For retail stores, online shops, and product-based businesses',
      features: ['Product catalog', 'Order tracking', 'Customer support', 'Abandoned cart recovery', 'Promotional campaigns'],
      autoReplies: [
        { keyword: 'products', response: 'We have a wide range of products. What are you looking for today?', enabled: true },
        { keyword: 'order', response: 'I can help you track your order. Could you please provide your order number?', enabled: true },
        { keyword: 'shipping', response: 'We offer free shipping on orders over R500. Delivery takes 2-5 business days.', enabled: true },
        { keyword: 'return', response: 'We accept returns within 30 days. Please provide your order number to proceed.', enabled: true }
      ],
      quickReplies: ['Browse products', 'Track order', 'Shipping info', 'Returns'],
      welcomeMessage: 'Welcome to our store! 🛍️ Would you like to browse our products, track an order, or get shipping information?',
      bookingEnabled: false
    },
    {
      id: 'healthcare',
      name: 'Healthcare',
      industry: 'medical',
      icon: '🏥',
      description: 'For clinics, doctors, dentists, and wellness centers',
      features: ['Appointment booking', 'Prescription refills', 'Patient reminders', 'Follow-up care', 'Telehealth links'],
      autoReplies: [
        { keyword: 'appointment', response: 'I can help you book an appointment. What type of appointment do you need?', enabled: true },
        { keyword: 'prescription', response: 'I can help with prescription refills. Please provide your patient ID.', enabled: true },
        { keyword: 'hours', response: 'We are open Monday-Friday 8am-6pm, Saturday 9am-1pm. Closed Sundays.', enabled: true },
        { keyword: 'emergency', response: 'For emergencies, please call 10111 or visit your nearest emergency room immediately.', enabled: true }
      ],
      quickReplies: ['Book appointment', 'Prescription refill', 'Hours', 'Location'],
      welcomeMessage: 'Welcome to our practice! 🏥 How can we help you today? You can book an appointment, request a prescription refill, or check our hours.',
      bookingEnabled: true
    }
  ];

  getAllTemplates(): IndustryTemplate[] {
    return this.templates;
  }

  getTemplateById(id: string): IndustryTemplate | undefined {
    return this.templates.find(t => t.id === id);
  }

  getTemplateByIndustry(industry: string): IndustryTemplate | undefined {
    return this.templates.find(t => t.industry === industry);
  }

  async activateTemplate(userId: string, templateId: string): Promise<void> {
    // Store user's selected template in database
    // This will be used to configure their chatbot
    console.log(`User ${userId} activated template ${templateId}`);
  }
}

export const industryTemplateService = new IndustryTemplateService();