'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Appointment {
  id: string;
  customerName: string;
  customerPhone: string;
  service: string;
  date: string;
  time: string;
  status: string;
}

export default function BookingPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    customerName: '',
    customerPhone: '',
    service: '',
    date: '',
    time: ''
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments');
      const data = await response.json();
      setAppointments(data);
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const createAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAppointment)
      });
      
      if (response.ok) {
        await fetchAppointments();
        setShowForm(false);
        setNewAppointment({ customerName: '', customerPhone: '', service: '', date: '', time: '' });
      }
    } catch (error) {
      console.error('Failed to create appointment:', error);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/appointments/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      await fetchAppointments();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500/20 text-green-400';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400';
      case 'completed': return 'bg-blue-500/20 text-blue-400';
      case 'cancelled': return 'bg-red-500/20 text-red-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800 flex items-center justify-center">
        <div className="text-white">Loading appointments...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-orange-800">
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-6 py-4">
          <Link href="/dashboard" className="text-gray-400 hover:text-white transition">
            ← Dashboard
          </Link>
          <span className="text-white font-bold ml-4">Booking System</span>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        {/* Header with Add Button */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-white">Appointments</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition"
          >
            + New Appointment
          </button>
        </div>

        {/* Create Appointment Form */}
        {showForm && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 mb-6">
            <h2 className="text-white font-bold mb-4">Create New Appointment</h2>
            <form onSubmit={createAppointment} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Customer Name"
                  value={newAppointment.customerName}
                  onChange={(e) => setNewAppointment({...newAppointment, customerName: e.target.value})}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                  required
                />
                <input
                  type="tel"
                  placeholder="Customer Phone"
                  value={newAppointment.customerPhone}
                  onChange={(e) => setNewAppointment({...newAppointment, customerPhone: e.target.value})}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                  required
                />
                <input
                  type="text"
                  placeholder="Service"
                  value={newAppointment.service}
                  onChange={(e) => setNewAppointment({...newAppointment, service: e.target.value})}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400"
                  required
                />
                <input
                  type="date"
                  value={newAppointment.date}
                  onChange={(e) => setNewAppointment({...newAppointment, date: e.target.value})}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  required
                />
                <input
                  type="time"
                  value={newAppointment.time}
                  onChange={(e) => setNewAppointment({...newAppointment, time: e.target.value})}
                  className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  required
                />
              </div>
              <div className="flex gap-3">
                <button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition">
                  Create Appointment
                </button>
                <button type="button" onClick={() => setShowForm(false)} className="bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-lg transition">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Appointments Table */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="text-left p-4 text-gray-300">Customer</th>
                  <th className="text-left p-4 text-gray-300">Service</th>
                  <th className="text-left p-4 text-gray-300">Date & Time</th>
                  <th className="text-left p-4 text-gray-300">Status</th>
                  <th className="text-left p-4 text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => (
                  <tr key={apt.id} className="border-t border-white/10">
                    <td className="p-4">
                      <div className="text-white">{apt.customerName}</div>
                      <div className="text-gray-400 text-sm">{apt.customerPhone}</div>
                    </td>
                    <td className="p-4 text-gray-300">{apt.service}</td>
                    <td className="p-4">
                      <div className="text-white">{apt.date}</div>
                      <div className="text-gray-400 text-sm">{apt.time}</div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(apt.status)}`}>
                        {apt.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {apt.status === 'pending' && (
                          <>
                            <button onClick={() => updateStatus(apt.id, 'confirmed')} className="text-green-400 hover:text-green-300 text-sm">Confirm</button>
                            <button onClick={() => updateStatus(apt.id, 'cancelled')} className="text-red-400 hover:text-red-300 text-sm">Cancel</button>
                          </>
                        )}
                        {apt.status === 'confirmed' && (
                          <button onClick={() => updateStatus(apt.id, 'completed')} className="text-blue-400 hover:text-blue-300 text-sm">Complete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}