import '@types/jest';
import * as functionsTest from 'firebase-functions-test';
import { FirebaseAppointmentService } from '../src/appointment/service';

const testEnv = functionsTest();

describe('Appointment Service', () => {
  let appointmentService: FirebaseAppointmentService;

  beforeEach(() => {
    appointmentService = new FirebaseAppointmentService();
  });

  afterEach(() => {
    testEnv.cleanup();
  });

  it('should create an appointment', async () => {
    const appointmentData = {
      clientId: 'test-client',
      prospectEmail: 'test@example.com',
      date: new Date(),
    };

    const appointment = await appointmentService.createAppointment(appointmentData);

    expect(appointment).toHaveProperty('id');
    expect(appointment.clientId).toBe(appointmentData.clientId);
    expect(appointment.prospectEmail).toBe(appointmentData.prospectEmail);
    expect(appointment.status).toBe('pending');
  });

  it('should get an appointment by id', async () => {
    const appointmentData = {
      clientId: 'test-client',
      prospectEmail: 'test@example.com',
      date: new Date(),
    };

    const created = await appointmentService.createAppointment(appointmentData);
    const retrieved = await appointmentService.getAppointment(created.id);

    expect(retrieved).toEqual(created);
  });

  it('should update an appointment', async () => {
    const appointmentData = {
      clientId: 'test-client',
      prospectEmail: 'test@example.com',
      date: new Date(),
    };

    const created = await appointmentService.createAppointment(appointmentData);
    const updated = await appointmentService.updateAppointment(created.id, {
      status: 'confirmed',
    });

    expect(updated.status).toBe('confirmed');
  });

  it('should delete an appointment', async () => {
    const appointmentData = {
      clientId: 'test-client',
      prospectEmail: 'test@example.com',
      date: new Date(),
    };

    const created = await appointmentService.createAppointment(appointmentData);
    await appointmentService.deleteAppointment(created.id);

    await expect(appointmentService.getAppointment(created.id)).rejects.toThrow();
  });
}); 