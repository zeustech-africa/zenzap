# WhatsApp Business API Setup Guide

## Prerequisites
1. Facebook Business Manager account
2. WhatsApp Business account
3. Verified business

## Steps

### 1. Create WhatsApp Business App
- Go to developers.facebook.com
- Create a new app with "Business" type
- Add "WhatsApp" product

### 2. Get Access Token
- Go to App Dashboard → WhatsApp → API Setup
- Generate permanent access token

### 3. Get Phone Number ID
- Add phone number to WhatsApp Manager
- Note the Phone Number ID

### 4. Configure Webhook
- Set webhook URL: `https://your-domain.com/api/webhook`
- Verify token: `zenzap_verify_token_2025`
- Subscribe to "messages" and "message_deliveries" events

### 5. Update .env
```
WHATSAPP_ACCESS_TOKEN=your_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_id
WHATSAPP_VERIFY_TOKEN=zenzap_verify_token_2025
```

### Sandbox Mode (Testing)
- Use test numbers from Meta dashboard
- Limited to 5 phone numbers

### Production Mode
- Submit app for review
- Get business verification
- Go live