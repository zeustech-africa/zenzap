// Yoco Payment Service for African market
class YocoService {
  async createPayment(amount: number, currency: string = 'ZAR', redirectUrl: string): Promise<any> {
    // Yoco API integration
    const response = await fetch('https://online.yoco.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.YOCO_SECRET_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amount * 100, // Convert to cents
        currency,
        redirectUrl
      })
    });
    return response.json();
  }
}

export const yocoService = new YocoService();