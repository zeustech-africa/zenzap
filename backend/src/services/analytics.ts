import { customers, customerInteractions } from '../models/Customer';
import { leads } from '../models/Lead';
import { appointments } from '../models/Appointment';
import { paymentTransactions } from '../routes/payments';

interface MessageStats {
  totalIncoming: number;
  totalOutgoing: number;
  byDay: { date: string; incoming: number; outgoing: number }[];
  byHour: { hour: number; count: number }[];
}

interface ResponseTimeStats {
  averageFirstResponseMinutes: number;
  fastestResponseMinutes: number;
  slowestResponseMinutes: number;
  byAgent: { agentName: string; avgResponseMinutes: number }[];
}

interface ConversionFunnel {
  stages: {
    name: string;
    count: number;
    conversionRate: number;
  }[];
}

interface RevenueStats {
  totalRevenue: number;
  mrr: number;
  byMonth: { month: string; amount: number }[];
  byPlan: { plan: string; amount: number; count: number }[];
}

class AnalyticsService {
  getMessageStats(businessId: string, days: number = 30): MessageStats {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    
    const relevantInteractions = customerInteractions.filter(i => {
      const customer = customers.find(c => c.id === i.customerId);
      return customer?.businessId === businessId && new Date(i.timestamp) >= cutoffDate;
    });
    
    const incoming = relevantInteractions.filter(i => i.type === 'message_received');
    const outgoing = relevantInteractions.filter(i => i.type === 'message_sent');
    
    // Group by day
    const byDayMap = new Map<string, { incoming: number; outgoing: number }>();
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      byDayMap.set(dateStr, { incoming: 0, outgoing: 0 });
    }
    
    [...incoming, ...outgoing].forEach(interaction => {
      const dateStr = interaction.timestamp.split('T')[0];
      const existing = byDayMap.get(dateStr);
      if (existing) {
        if (interaction.type === 'message_received') existing.incoming++;
        else existing.outgoing++;
      }
    });
    
    const byDay = Array.from(byDayMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, counts]) => ({ date, incoming: counts.incoming, outgoing: counts.outgoing }));
    
    // Group by hour
    const byHourMap = new Map<number, number>();
    for (let i = 0; i < 24; i++) byHourMap.set(i, 0);
    
    incoming.forEach(interaction => {
      const hour = new Date(interaction.timestamp).getHours();
      byHourMap.set(hour, (byHourMap.get(hour) || 0) + 1);
    });
    
    const byHour = Array.from(byHourMap.entries()).map(([hour, count]) => ({ hour, count }));
    
    return {
      totalIncoming: incoming.length,
      totalOutgoing: outgoing.length,
      byDay,
      byHour
    };
  }
  
  getResponseTimeStats(businessId: string): ResponseTimeStats {
    // TODO: Implement response time tracking
    // For now, return mock data
    return {
      averageFirstResponseMinutes: 4.2,
      fastestResponseMinutes: 0.5,
      slowestResponseMinutes: 45.0,
      byAgent: [
        { agentName: 'Support Team', avgResponseMinutes: 3.8 },
        { agentName: 'Sales Team', avgResponseMinutes: 5.1 }
      ]
    };
  }
  
  getConversionFunnel(businessId: string): ConversionFunnel {
    const businessLeads = leads.filter(l => l.businessId === businessId);
    const stages = ['new', 'contacted', 'qualified', 'won', 'lost'];
    const counts: Record<string, number> = {};
    
    stages.forEach(stage => {
      counts[stage] = businessLeads.filter(l => l.status === stage).length;
    });
    
    const total = counts.new + counts.contacted + counts.qualified + counts.won + counts.lost;
    
    const stagesWithRates = stages.map((stage, idx) => {
      const count = counts[stage] || 0;
      let conversionRate = 0;
      if (idx === 0 && total > 0) conversionRate = (count / total) * 100;
      else if (idx > 0) {
        const prevCount = counts[stages[idx - 1]] || 0;
        if (prevCount > 0) conversionRate = (count / prevCount) * 100;
      }
      return {
        name: stage.charAt(0).toUpperCase() + stage.slice(1),
        count,
        conversionRate
      };
    });
    
    return { stages: stagesWithRates };
  }
  
  getRevenueStats(businessId: string): RevenueStats {
    const businessTransactions = paymentTransactions.filter((t: any) => t.businessId === businessId && t.status === 'completed');
    const totalRevenue = businessTransactions.reduce((sum: number, t: any) => sum + t.amount, 0);
    
    // Calculate MRR (Monthly Recurring Revenue)
    const currentMonth = new Date().toISOString().slice(0, 7);
    const mrrTransactions = businessTransactions.filter((t: any) => t.completedAt?.startsWith(currentMonth));
    const mrr = mrrTransactions.reduce((sum: number, t: any) => sum + t.amount, 0);
    
    // Group by month
    const byMonthMap = new Map<string, number>();
    businessTransactions.forEach((t: any) => {
      if (t.completedAt) {
        const month = t.completedAt.slice(0, 7);
        byMonthMap.set(month, (byMonthMap.get(month) || 0) + t.amount);
      }
    });
    
    const byMonth = Array.from(byMonthMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, amount]) => ({ month, amount }));
    
    // Group by plan
    const byPlanMap = new Map<string, { amount: number; count: number }>();
    businessTransactions.forEach((t: any) => {
      const plan = t.plan || 'unknown';
      const existing = byPlanMap.get(plan);
      if (existing) {
        existing.amount += t.amount;
        existing.count++;
      } else {
        byPlanMap.set(plan, { amount: t.amount, count: 1 });
      }
    });
    
    const byPlan = Array.from(byPlanMap.entries()).map(([plan, data]) => ({
      plan: plan.charAt(0).toUpperCase() + plan.slice(1),
      amount: data.amount,
      count: data.count
    }));
    
    return {
      totalRevenue,
      mrr,
      byMonth,
      byPlan
    };
  }
  
  getBookingStats(businessId: string): any {
    const businessAppointments = appointments.filter(a => a.businessId === businessId);
    const totalBookings = businessAppointments.length;
    const completedBookings = businessAppointments.filter(a => a.status === 'completed').length;
    const cancelledBookings = businessAppointments.filter(a => a.status === 'cancelled').length;
    
    const byMonthMap = new Map<string, number>();
    businessAppointments.forEach(a => {
      const month = a.date.slice(0, 7);
      byMonthMap.set(month, (byMonthMap.get(month) || 0) + 1);
    });
    
    const byMonth = Array.from(byMonthMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, count]) => ({ month, count }));
    
    return {
      totalBookings,
      completedBookings,
      cancelledBookings,
      completionRate: totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0,
      byMonth
    };
  }
}

export const analyticsService = new AnalyticsService();