import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { ResponseTracking, ResponseHistory, ResponseStatus, ReminderConfig } from '../types/response';

export class ResponseTrackingService {
  private db = getFirestore();
  private defaultConfig: ReminderConfig = {
    initialReminder: 24, // 24 hours before
    followUpReminder: 12, // 12 hours after no response
    maxReminders: 3,
    responseTimeout: 48 // 48 hours to respond
  };

  async trackResponse(
    appointmentId: string,
    status: ResponseStatus,
    source: 'calendar' | 'email' | 'manual'
  ): Promise<void> {
    const trackingRef = this.db.collection('responseTracking').doc(appointmentId);
    const tracking = await trackingRef.get();

    const responseHistory: ResponseHistory = {
      status,
      timestamp: Timestamp.now(),
      source
    };

    if (!tracking.exists) {
      // Create new tracking record
      const newTracking: ResponseTracking = {
        appointmentId,
        currentStatus: status,
        responseHistory: [responseHistory],
        remindersSent: 0,
        lastReminderSent: Timestamp.now(),
        lastChecked: Timestamp.now(),
        nextCheck: this.calculateNextCheck(status),
        isActive: true
      };
      await trackingRef.set(newTracking);
    } else {
      // Update existing tracking
      const data = tracking.data() as ResponseTracking;
      await trackingRef.update({
        currentStatus: status,
        responseHistory: [...data.responseHistory, responseHistory],
        lastChecked: Timestamp.now(),
        nextCheck: this.calculateNextCheck(status)
      });
    }
  }

  async updateReminderCount(appointmentId: string): Promise<void> {
    const trackingRef = this.db.collection('responseTracking').doc(appointmentId);
    await trackingRef.update({
      remindersSent: Timestamp.increment(1),
      lastReminderSent: Timestamp.now()
    });
  }

  async getTracking(appointmentId: string): Promise<ResponseTracking | null> {
    const tracking = await this.db.collection('responseTracking').doc(appointmentId).get();
    return tracking.exists ? (tracking.data() as ResponseTracking) : null;
  }

  async setReminderConfig(appointmentId: string, config: ReminderConfig): Promise<void> {
    await this.db.collection('responseSettings').doc(appointmentId).set({
      reminders: config
    }, { merge: true });
  }

  private calculateNextCheck(status: ResponseStatus): Timestamp {
    const now = Timestamp.now();
    const hours = status === 'pending' ? 12 : 24; // Check more frequently for pending responses
    return Timestamp.fromDate(new Date(now.toDate().getTime() + hours * 60 * 60 * 1000));
  }

  async shouldSendReminder(appointmentId: string): Promise<boolean> {
    const tracking = await this.getTracking(appointmentId);
    if (!tracking) return false;

    const config = await this.getReminderConfig(appointmentId);
    const now = Timestamp.now();

    // Don't send if max reminders reached
    if (tracking.remindersSent >= config.maxReminders) return false;

    // Don't send if response timeout reached
    const timeoutReached = now.toDate().getTime() - tracking.lastChecked.toDate().getTime() > 
      config.responseTimeout * 60 * 60 * 1000;
    if (timeoutReached) return false;

    // Calculate time since last reminder
    const timeSinceLastReminder = now.toDate().getTime() - tracking.lastReminderSent.toDate().getTime();
    const hoursSinceLastReminder = timeSinceLastReminder / (60 * 60 * 1000);

    // Send reminder if enough time has passed
    return hoursSinceLastReminder >= config.followUpReminder;
  }

  private async getReminderConfig(appointmentId: string): Promise<ReminderConfig> {
    const settings = await this.db.collection('responseSettings').doc(appointmentId).get();
    return settings.exists ? 
      (settings.data()?.reminders as ReminderConfig) : 
      this.defaultConfig;
  }
} 