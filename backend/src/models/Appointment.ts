export interface Appointment {
  id: string;
  businessId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  service: string;
  staffId?: string;
  staffName?: string;
  date: string;
  time: string;
  duration: number; // minutes
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  reminderSent: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Staff {
  id: string;
  businessId: string;
  name: string;
  email?: string;
  phone?: string;
  services: string[];
  availability: AvailabilitySlot[];
  isActive: boolean;
}

export interface AvailabilitySlot {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string;
  endTime: string;
  enabled: boolean;
}

// In-memory storage (replace with database)
export const appointments: Appointment[] = [];
export const staffMembers: Staff[] = [];