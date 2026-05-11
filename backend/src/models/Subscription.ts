export interface SubscriptionTier {
  id: string;
  name: 'free' | 'starter' | 'pro' | 'business';
  priceZAR: number;
  features: string[];
  limits: {
    messagesPerMonth: number;
    agents: number;
    contacts: number;
    broadcastsPerMonth: number;
    templates: number;
    flows: number;
  };
}

export const subscriptionTiers: SubscriptionTier[] = [
  {
    id: 'free',
    name: 'free',
    priceZAR: 0,
    features: [
      'connect_whatsapp',
      'basic_inbox',
      'auto_replies_5',
      'contacts_100',
      'broadcasts_10',
      'templates_3',
      'flows_1',
      'catalog_10_products'
    ],
    limits: {
      messagesPerMonth: 500,
      agents: 1,
      contacts: 100,
      broadcastsPerMonth: 10,
      templates: 3,
      flows: 1
    }
  },
  {
    id: 'starter',
    name: 'starter',
    priceZAR: 299,
    features: [
      'connect_whatsapp',
      'basic_inbox',
      'auto_replies_unlimited',
      'contacts_1000',
      'broadcasts_100',
      'templates_20',
      'flows_5',
      'catalog_100_products',
      'agent_performance',
      'quality_rating'
    ],
    limits: {
      messagesPerMonth: 5000,
      agents: 3,
      contacts: 1000,
      broadcastsPerMonth: 100,
      templates: 20,
      flows: 5
    }
  },
  {
    id: 'pro',
    name: 'pro',
    priceZAR: 599,
    features: [
      'connect_whatsapp',
      'basic_inbox',
      'auto_replies_unlimited',
      'contacts_unlimited',
      'broadcasts_unlimited',
      'templates_unlimited',
      'flows_unlimited',
      'catalog_unlimited',
      'agent_performance',
      'quality_rating',
      'ai_nlu',
      'instagram_dm',
      'abandoned_cart',
      'payment_links',
      'webhooks',
      'recovery_automation'
    ],
    limits: {
      messagesPerMonth: 25000,
      agents: 10,
      contacts: -1,
      broadcastsPerMonth: -1,
      templates: -1,
      flows: -1
    }
  },
  {
    id: 'business',
    name: 'business',
    priceZAR: 999,
    features: [
      'connect_whatsapp',
      'basic_inbox',
      'auto_replies_unlimited',
      'contacts_unlimited',
      'broadcasts_unlimited',
      'templates_unlimited',
      'flows_unlimited',
      'catalog_unlimited',
      'agent_performance',
      'quality_rating',
      'ai_nlu',
      'instagram_dm',
      'abandoned_cart',
      'payment_links',
      'webhooks',
      'recovery_automation',
      'shopify_integration',
      'hubspot_integration',
      'salesforce_integration',
      'whatsapp_calls',
      'green_tick_guide',
      'opt_in_management',
      'coexistence_mode'
    ],
    limits: {
      messagesPerMonth: -1,
      agents: -1,
      contacts: -1,
      broadcastsPerMonth: -1,
      templates: -1,
      flows: -1
    }
  }
];

export const FEATURE_FLAGS: Record<string, string[]> = {
  // Basic features (all tiers)
  connect_whatsapp: ['free', 'starter', 'pro', 'business'],
  basic_inbox: ['free', 'starter', 'pro', 'business'],
  
  // Auto-replies (all tiers)
  auto_replies_5: ['free'],
  auto_replies_unlimited: ['starter', 'pro', 'business'],
  
  // Contacts limits
  contacts_100: ['free'],
  contacts_1000: ['starter'],
  contacts_unlimited: ['pro', 'business'],
  
  // Broadcasts
  broadcasts_10: ['free'],
  broadcasts_100: ['starter'],
  broadcasts_unlimited: ['pro', 'business'],
  
  // Templates
  templates_3: ['free'],
  templates_20: ['starter'],
  templates_unlimited: ['pro', 'business'],
  
  // Flows
  flows_1: ['free'],
  flows_5: ['starter'],
  flows_unlimited: ['pro', 'business'],
  
  // Catalog
  catalog_10_products: ['free'],
  catalog_100_products: ['starter'],
  catalog_unlimited: ['pro', 'business'],
  
  // Agent features (Starter+)
  agent_performance: ['starter', 'pro', 'business'],
  quality_rating: ['starter', 'pro', 'business'],
  
  // Pro features
  ai_nlu: ['pro', 'business'],
  instagram_dm: ['pro', 'business'],
  abandoned_cart: ['pro', 'business'],
  payment_links: ['pro', 'business'],
  webhooks: ['pro', 'business'],
  recovery_automation: ['pro', 'business'],
  
  // Business-only features
  shopify_integration: ['business'],
  hubspot_integration: ['business'],
  salesforce_integration: ['business'],
  whatsapp_calls: ['business'],
  green_tick_guide: ['business'],
  opt_in_management: ['business'],
  coexistence_mode: ['business']
};

export function hasFeature(subscriptionTier: string, feature: string): boolean {
  const allowedTiers = FEATURE_FLAGS[feature];
  return allowedTiers ? allowedTiers.includes(subscriptionTier) : false;
}

export function getFeatureLimits(subscriptionTier: string) {
  const tier = subscriptionTiers.find(t => t.name === subscriptionTier);
  return tier?.limits || subscriptionTiers[0].limits;
}