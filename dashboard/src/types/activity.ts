export type ActivityType = 'appointment_created' | 'appointment_completed' | 'client_added' | 'client_updated' | 'client_deleted';

export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  date: string;
  client: string;
}