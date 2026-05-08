import { appointments } from '../models/Appointment';
import { whatsappService } from './whatsapp';

class ReminderService {
  private interval: NodeJS.Timeout | null = null;
  
  start(): void {
    // Check for reminders every hour
    this.interval = setInterval(() => this.checkReminders(), 60 * 60 * 1000);
    console.log('Reminder service started');
  }
  
  stop(): void {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
  
  private async checkReminders(): Promise<void> {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    
    const upcomingAppointments = appointments.filter(a => 
      a.status === 'confirmed' && 
      !a.reminderSent && 
      a.date === tomorrowStr
    );
    
    for (const appointment of upcomingAppointments) {
      await this.sendReminder(appointment);
    }
  }
  
  private async sendReminder(appointment: any): Promise<void> {
    const message = `🔔 REMINDER: You have an appointment tomorrow at ${appointment.time} for ${appointment.service}. ` +
                    `Reply 'CONFIRM' to confirm, or 'RESCHEDULE' to change.`;
    
    try {
      await whatsappService.sendTextMessage(appointment.customerPhone, message);
      appointment.reminderSent = true;
      console.log(`Reminder sent to ${appointment.customerPhone}`);
    } catch (error) {
      console.error(`Failed to send reminder to ${appointment.customerPhone}:`, error);
    }
  }
}

export const reminderService = new ReminderService();