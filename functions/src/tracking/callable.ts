import * as functions from 'firebase-functions';
import { TrackingService } from './service';

export const getClientStatsCallable = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { clientId, startDate, endDate } = data;
  
  if (!clientId || !startDate || !endDate) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters');
  }

  try {
    const trackingService = new TrackingService();
    const stats = await trackingService.getClientStats(
      clientId,
      new Date(startDate),
      new Date(endDate)
    );
    return stats;
  } catch (error) {
    console.error('Error getting client stats:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get client statistics');
  }
});

export const getOverallStatsCallable = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { startDate, endDate } = data;
  
  if (!startDate || !endDate) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters');
  }

  try {
    const trackingService = new TrackingService();
    const stats = await trackingService.getOverallStats(
      new Date(startDate),
      new Date(endDate)
    );
    return stats;
  } catch (error) {
    console.error('Error getting overall stats:', error);
    throw new functions.https.HttpsError('internal', 'Failed to get overall statistics');
  }
});

export const trackEventCallable = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { type, clientId, appointmentId, metadata } = data;
  
  if (!type || !clientId) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required parameters');
  }

  try {
    const trackingService = new TrackingService();
    await trackingService.trackEvent({
      type,
      clientId,
      appointmentId,
      metadata
    });
    return { success: true };
  } catch (error) {
    console.error('Error tracking event:', error);
    throw new functions.https.HttpsError('internal', 'Failed to track event');
  }
}); 