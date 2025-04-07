import { Appointment, AppointmentCreateInput, AppointmentUpdateInput } from '../types/appointment';

export interface AppointmentService {
  createAppointment(data: AppointmentCreateInput): Promise<Appointment>;
  getAppointment(id: string): Promise<Appointment>;
  updateAppointment(id: string, data: AppointmentUpdateInput): Promise<Appointment>;
  deleteAppointment(id: string): Promise<void>;
  getAppointmentsByClient(clientId: string): Promise<Appointment[]>;
  getAppointmentsByDateRange(startDate: Date, endDate: Date): Promise<Appointment[]>;
}